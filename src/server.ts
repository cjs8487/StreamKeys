import { Request, Response } from 'express';
import SerialPort from 'serialport';

const express = require('express');
const path = require('path');
const Serial = require('serialport');
const Readline = require('@serialport/parser-readline');
const cors = require('cors');

const server = express();

const buildPath = '../frontend/build';
const port = 3050;

server.use(express.json());
server.use(cors());

server.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('Pong');
});

let serialPort: SerialPort | undefined;
let status: Buffer;
let statusUpdated: boolean;

function updateStatus() {
    if (serialPort !== undefined) {
        statusUpdated = false;
        const parser = serialPort.pipe(new Readline({ delimiter: 'END' }));
        serialPort.write('MT00RD0000NT');
        parser.on('data', (data: Buffer) => {
            console.log(data);
            status = data;
            statusUpdated = true;
        });
    }
}

server.get('/getports', async (req: Request, res: Response) => {
    const portsList: Array<string> = [];

    await SerialPort.list().then((ports) => {
        ports.forEach((serPort) => {
            portsList.push(serPort.path);
        });
    });
    res.status(200).json({ ports: portsList }).end();
});

server.post('/connect', (req: Request, res: Response) => {
    const { comPort } = req.body;
    serialPort = new Serial(comPort);
    res.status(200).end();
    updateStatus();
});

server.post('/disconnect', (req: Request, res: Response) => {
    if (serialPort !== undefined) {
        serialPort.close(() => {
            serialPort = undefined;
        });
        res.status(200).end();
        return;
    }
    res.status(409).send('No port open');
});

server.post('/setoutput', (req: Request, res: Response) => {
    if (serialPort !== undefined) {
        const { output, input } = req.body;
        const command = `MT00SW${(`${input}`).padStart(2, '0')}${(`${output}`).padStart(2, '0')}NT`;
        serialPort.write(command);
        res.status(200).end();
        updateStatus();
        return;
    }
    res.status(409).send('No port open');
});

server.get('/status', (req: Request, res: Response) => {
    if (serialPort === undefined) {
        res.status(409).send('No port open');
    }
    if (!statusUpdated) {
        res.status(409).send('Status update pending');
    }
    res.status(200).send(status);
});

// default to returning the production build of the frontend files
server.get('/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, buildPath, 'index.html'));
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`);
});

process.on('exit', () => {
    if (serialPort !== undefined) {
        serialPort.close();
    }
});
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
