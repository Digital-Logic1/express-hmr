import socketIO from 'socket.io';
import cookie from 'cookie';
import Logger from './Logger';
import { refreshToken } from './modules/auth/token';

function create(server, options) {
    const io = socketIO(server,options);

    io.on('connection', async function(socket) {

        console.log('User connected');
        socket.user = {};

        /**
         * When user connects, see if they have a valid refresh token in the cookie headers.
         * If they do, create a auth room for each instance this user has created.
         */
        const { refreshToken: rToken } = cookie.parse(socket.handshake.headers.cookie);
        if (rToken) {
            try {
                const { id } = await refreshToken.verify(rToken)
                if (id) {
                    // Save the user id for this socket
                    socket.user.id = id;
                    socket.join(socket.user.id);
                    socket.emit('SYNC_AUTH_SUBSCRIBE_SUCCESS');
                }
            } catch(e) { Logger.error(`Socket.IO init error: ${e.message}`); }
        }

        socket.on('disconnect', () => {
            console.log('User disconnect');
        });

        /**
         *
         */
        socket.on('SYNC_AUTH_SUBSCRIBE', async ({ id, token }) => {

            if (!socket.user.id || socket.user.id !== id) {
                // console.log(`SYNC_AUTH_SUBSCRIBE - id: ${id}, token: ${ Boolean(token)}`);

                // if the socket was previously attached to a room, leave that room
                if (socket.user.id) {
                    socket.leave(socket.user.id);
                   // console.log('SYNC_AUTH_SUBSCRIBE: Leaving Room: ', socket.user.id);
                }

                // verify the users id
                if (token) {
                    try {
                        const rToken = await refreshToken.verify(token);
                        if (id === rToken.id) {
                            socket.user.id = id;
                            socket.join(socket.user.id);
                            // console.log(`Joining Room: ${socket.user.id}`);
                        }
                    } catch(e){
                        Logger.error('Invalid token provided to Socket.IO: SYNC_AUTH_SUBSCRIBE');
                    }
                }
            }
        });

        // The user on this socket is logging out,
        // notify all other listeners.
        socket.on('SYNC_AUTH_LOGOUT', () => {
            socket.to(socket.user.id).emit('SYNC_AUTH_LOGOUT', socket.user.id);
        });

        // Update user info
        socket.on('SYNC_USER_INFO', user => {
            socket.to(socket.user.id).emit('SYNC_USER_INFO', user);
        });
    });
}

export default create;