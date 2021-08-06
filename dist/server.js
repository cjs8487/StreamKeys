"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var path = require('path');
var server = express();
var buildPath = '../frontend/build';
var port = 3030;
server.get('/ping', function (req, res) {
    res.status(200).send('Pong');
});
// default to returning the production build of the frontend files
server.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, buildPath, 'index.html'));
});
server.listen(port, function () {
    // eslint-disable-next-line no-console
    console.log("Listening on port " + port);
});
