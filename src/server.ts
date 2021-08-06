import { Request, Response } from 'express';
import SerialPort from 'serialport';

const express = require('express');
const path = require('path');
const Serial = require('serialport');

const server = express();

const buildPath = '../frontend/build';
const port = 3030;

server.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('Pong');
});

const serialPort: SerialPort = new Serial('COM3');
serialPort.write('MT00RD0000NT');
serialPort.read();
server.get('/serialtest', (req: Request, res: Response) => {
    serialPort.write('MT00RD0000NT');
    console.log('written');
    let ret = serialPort.read();
    if (ret != null) {
        ret = ret.toString();
    }
    console.log(ret);
    res.status(200).send(ret);
});

// default to returning the production build of the frontend files
server.get('/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, buildPath, 'index.html'));
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`);
});
