const express = require('express');
const path = require('path');

const server = express();

const buildPath = '../frontend/build';
const port = 3030;

server.get('/ping', (req, res) => {
    res.status(200).send('Pong');
});

// default to returning the production build of the frontend files
server.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, buildPath, 'index.html'));
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`);
});
