import React, {Component} from "react";
import './alert.css';

class Alert extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }  

    render() {
        return (<>
            <div className="alertsuper c-vert">
                <div className="alertbox">
                    <div className="head">{this.props.alert_data.head}</div>
                    <div className="text">{this.props.alert_data.text}</div>
                    <div className="but-hold">
                        <div className="negative" onClick={() => this.props.alert_data.callback(0)}>Cancel</div>
                        <div className="positive" onClick={() => this.props.alert_data.callback(1, this.props.alert_data.otherdata)}>Proceed</div>
                    </div>
                </div>
            </div>        
        </>);
    }
}

export default Alert;
