import { Request, Response } from 'express';
import SerialPort from 'serialport';

const express = require('express');
const path = require('path');
const Serial = require('serialport');
const cors = require('cors');

const server = express();

const buildPath = '../frontend/build';
const port = 3030;

server.use(express.json());
server.use(cors());

server.get('/ping', (req: Request, res: Response) => {
    res.status(200).send('Pong');
});

let serialPort: SerialPort | undefined;
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
    console.log(comPort);
    serialPort = new Serial(comPort);
    res.status(200).end();
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

server.get('/serialtest', (req: Request, res: Response) => {
    if (serialPort !== undefined) {
        serialPort.write('MT00RD0000NT');
        console.log('written');
        let ret = serialPort.read();
        if (ret != null) {
            ret = ret.toString();
        }
        console.log(ret);
        res.status(200).send(ret);
        return;
    }
    res.status(409).send('No port open');
});

server.post('/setoutput', (req: Request, res: Response) => {
    if (serialPort !== undefined) {
        const { output, input } = req.body;
        const command = `MT00SW${(`${input}`).padStart(2, '0')}${(`${output}`).padStart(2, '0')}NT`;
        console.log(command);
        serialPort.write(command);
        serialPort.write('MT00RD0000NT');
        let ret = serialPort.read();
        if (ret != null) {
            ret = ret.toString();
        }
        res.status(200).send(ret);
        return;
    }
    res.status(409).send('No port open');
});

// default to returning the production build of the frontend files
server.get('/*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, buildPath, 'index.html'));
});

server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on port ${port}`);
});
