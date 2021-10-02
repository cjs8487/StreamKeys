import React, { BaseSyntheticEvent } from 'react';
import _ from 'lodash';

type SerialControllerProps = {

}

type SerialControllerState = {
    ports: Array<string>,
    selectedPort: string,
    statusText: string,
}

class SerialController extends React.Component<SerialControllerProps, SerialControllerState> {
    constructor(props: SerialControllerProps) {
        super(props);
        this.state = {
            ports: [],
            selectedPort: '',
            statusText: 'loading',
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

    connect() {
        const { selectedPort } = this.state;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comPort: selectedPort }),
        };
        fetch('http://localhost:3030/connect', options);
    }

    render() {
        const { ports, selectedPort, statusText } = this.state;
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
            </div>
        );
    }
}

export default SerialController;
