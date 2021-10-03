import React, { BaseSyntheticEvent } from 'react';
import _ from 'lodash';

type SerialControllerProps = {

}

type SerialControllerState = {
    ports: Array<string>,
    selectedPort: string,
    statusText: string,
    outputMap: Array<number>
}

class SerialController extends React.Component<SerialControllerProps, SerialControllerState> {
    constructor(props: SerialControllerProps) {
        super(props);
        this.state = {
            ports: [],
            selectedPort: '',
            statusText: 'loading',
            outputMap: [],
        };
        this.portSelect = this.portSelect.bind(this);
        this.connect = this.connect.bind(this);
    }

    componentDidMount() {
        fetch('http://localhost:3030/getports')
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
        await fetch('http://localhost:3030/connect', options);
        this.status();
    }

    async status() {
        let status = await (await fetch('http://localhost:3030/status')).text();
        const matches = Array.from(status.matchAll(/(O(?<output>.))(I(?<input>.))/g));
        const outputMap: Array<number> = [];
        matches.forEach((match) => {
            console.log(match);
            if (match.groups !== undefined) {
                outputMap[Number.parseInt(match.groups.output, 10)] = Number.parseInt(match.groups.input, 10);
            } else {
                status = 'Received invalid status syntx from server';
            }
        });
        console.log(matches);
        this.setState({ statusText: status, outputMap });
    }

    render() {
        const { ports, selectedPort, statusText, outputMap } = this.state;
        if (ports === []) {
            return (
                <div />
            );
        }
        return (
            <div>
                {statusText}
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
            </div>
        );
    }
}

export default SerialController;
