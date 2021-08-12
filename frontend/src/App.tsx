import React from 'react';
import './App.css';

import OBSWebSocket from 'obs-websocket-js';

type AppProps = {}
type AppState = {
    obsSocket: OBSWebSocket
}

class App extends React.Component<AppProps, AppState> {
    
    constructor(props: AppProps) {
        super(props);
        const obsSocket = new OBSWebSocket();
        this.state = {
            obsSocket
        }
    }

    async componentDidMount() {
        const { obsSocket } = this.state;
        //need to await the connection here to ensure that it is connected when we start assembling state data
        await obsSocket.connect({ address: 'localhost:4444', password: 'password' })
        obsSocket.send('GetSceneList')
            .then((scenes) => {
                console.log(scenes);
            })
            .catch((err) => {
                console.log(err)
            })
    }

    render() {
        return (
            <div className="App">
                
            </div>
        );
    }
}

export default App;
