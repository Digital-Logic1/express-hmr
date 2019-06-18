import http from 'http';
import app from './server';
import config from './config';
import socket from './Socket';

const server = http.createServer(app);

socket(server);

server.listen(4000, () => {
    console.log(`Server listening on: ${config.server.PORT}`);
});