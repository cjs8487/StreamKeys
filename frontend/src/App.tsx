import React from 'react';
// import './App.css';

import OBSWebSocket, { Scene } from 'obs-websocket-js';
import SceneButton from './components/obs/SceneButton';

type AppProps = {}
type AppState = {
    sceneList: Array<Scene>
}

class App extends React.Component<AppProps, AppState> {
    websocket: OBSWebSocket;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            sceneList: [],
        };
        this.websocket = new OBSWebSocket();
        this.changeScene = this.changeScene.bind(this);
    }

    async componentDidMount() {
        // need to await the connection here to ensure that it is connected when we start assembling state
        // let connected = this.obs.isConnected();
        // while (!connected) {
        //     connected = this.obs.isConnected();
        // }
        await this.websocket.connect({ address: 'localhost:4444', password: 'password' });
        this.websocket.sendCallback('GetSceneList', (err, data) => {
            if (data) {
                this.getSceneListCallBack(data.scenes);
            }
        });
    }

    getSceneListCallBack(sceneList: Array<Scene>) {
        this.setState({ sceneList });
    }

    changeScene(sceneName: string) {
        this.websocket.send('SetCurrentScene', { 'scene-name': sceneName });
    }

    render() {
        const { sceneList } = this.state;
        console.log(sceneList);
        return (
            <div className="App">
                <ul>
                    {
                        sceneList.map((scene) => (
                            <li>
                                <SceneButton sceneName={scene.name} changeScene={this.changeScene} />
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}

export default App;
