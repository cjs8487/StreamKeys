import React from 'react';

type SceneButtonProps = {
    sceneName: string,
    changeScene: Function,
}

class SceneButton extends React.Component < SceneButtonProps, {} > {
    constructor(props: SceneButtonProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        const { sceneName, changeScene } = this.props;
        changeScene(sceneName);
    }

    render() {
        const { sceneName } = this.props;
        return (
            <div role="button" onClick={this.handleClick} onKeyDown={this.handleClick} tabIndex={0}>
                {`${sceneName}`}
            </div>
        );
    }
}

export default SceneButton;
