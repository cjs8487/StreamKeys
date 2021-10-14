import React, { BaseSyntheticEvent } from 'react';
import _ from 'lodash';

const fetchRetry = require('fetch-retry')(fetch);

type SerialControllerProps = {

}

type SerialControllerState = {
    ports: Array<string>,
    selectedPort: string,
    statusText: string,
    outputMap: Array<number>,
    inputs: Array<number>,
    outputs: Array<number>
}

const NUM_INPUTS = 8;
const NUM_OUTPUTS = 8;

class SerialController extends React.Component<SerialControllerProps, SerialControllerState> {
    constructor(props: SerialControllerProps) {
        super(props);
        this.state = {
            ports: [],
            selectedPort: '',
            statusText: 'loading',
            outputMap: [],
            inputs: [],
            outputs: [],
        };
        this.portSelect = this.portSelect.bind(this);
        this.connect = this.connect.bind(this);
        this.status = this.status.bind(this);
    }

    componentDidMount() {
        fetch('http://localhost:3050/status')
            .then((res: Response) => {
                if (res.ok) {
                    res.text().then((text) => {
                        const { status, outputMap, inputs, outputs } = this.parseStatus(text);
                        this.setState({ statusText: status, outputMap, inputs, outputs });
                    });
                } else {
                    fetch('http://localhost:3050/getports')
                        // eslint-disable-next-line no-shadow
                        .then((res: Response) => {
                            // console.log(res);
                            if (!res.ok) {
                                this.setState({ statusText: 'Failed to load serial ports from server' });
                                return false;
                            }
                            return res.json();
                        })
                        .then((data) => {
                            if (!data) {
                                this.setState({ statusText: 'Failed to load serial ports from server' });
                            }
                            this.setState({ ports: data.ports, statusText: 'Ports loaded' });
                        });
                }
            });
    }

    async setOutput(output: number, input: number) {
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ output, input }),
        };
        await fetch('http://localhost:3050/setoutput', options);
        await this.status();
    }

    // eslint-disable-next-line class-methods-use-this
    portSelect(e: BaseSyntheticEvent) {
        const { value } = e.target;
        this.setState({ selectedPort: value });
    }

    async connect() {
        const { selectedPort } = this.state;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comPort: selectedPort }),
        };
        await fetch('http://localhost:3050/connect', options);
        this.status();
    }

    async status() {
        fetchRetry('http://localhost:3050/status', {
            retryOn: async (attempt: number, erro: number, response: Response) => {
                const text = await response.clone().text();
                if (text === 'Status update pending') {
                    return true;
                }
                return false;
            },
            retryDelay: 100,
        })
            .then((response: Response) => response.text())
            .then((text: string) => {
                const { status, outputMap, inputs, outputs } = this.parseStatus(text);
                this.setState({ statusText: status, outputMap, inputs, outputs });
            });
    }

    // eslint-disable-next-line class-methods-use-this
    parseStatus(text: string) {
        const matches = Array.from(text.matchAll(/(O(?<output>.))(I(?<input>.))/g));
        const outputMap: Array<number> = [];
        let status = '';
        matches.forEach((match) => {
            if (match.groups !== undefined) {
                outputMap[Number.parseInt(match.groups.output, 10)] = Number.parseInt(match.groups.input, 10);
            } else {
                status = 'Received invalid status syntx from server';
            }
        });
        if (status === '') {
            status = text;
        }
        const inputs = _.range(1, NUM_INPUTS + 1);
        const outputs = _.range(1, NUM_OUTPUTS + 1);
        return { status, outputMap, inputs, outputs };
    }

    render() {
        const { ports, selectedPort, statusText, outputMap, inputs, outputs } = this.state;
        if (ports === []) {
            return (
                <div />
            );
        }
        return (
            <div>
                {statusText}
                {
                    statusText === 'Status update pending' && (
                        <button type="button" onClick={this.status}>Update</button>
                    )
                }
                <select onChange={this.portSelect}>
                    {
                        _.map(ports, (port: string) => (
                            <option>{port}</option>
                        ))
                    }
                </select>
                {
                    selectedPort !== '' && (
                        <button type="submit" onClick={this.connect}>Connect</button>
                    )
                }
                {
                    outputMap !== [] && outputMap.map((input, output) => (
                        <p>
                            Output
                            {output}
                            displaying input
                            {input}
                        </p>
                    ))
                }
                {
                    outputMap !== [] && (
                        <table style={{ border: '1px solid black' }}>
                            <tr>
                                <th style={{ border: '1px solid black' }}>Input</th>
                                <th style={{ border: '1px solid black' }}>Current Output</th>
                                <th style={{ border: '1px solid black' }}>Change Output</th>
                            </tr>
                            {
                                _.map(inputs, (input) => (
                                    <tr>
                                        <td style={{ border: '1px solid black' }}>{input}</td>
                                        <td style={{ border: '1px solid black' }}>{outputMap[input]}</td>
                                        <td style={{ border: '1px solid black' }}>
                                            {
                                                _.map(outputs, (output) => (
                                                    <button type="button" onClick={() => this.setOutput(input, output)}>
                                                        {output}
                                                    </button>
                                                ))
                                            }
                                        </td>
                                    </tr>
                                ))
                            }
                        </table>
                    )
                }
            </div>
        );
    }
}

export default SerialController;
