import React, {Component} from "react";

class Control extends Component {
  constructor(props) {
    super(props);
  }   

  render() {
    return (
        <div disabled={this.props.disabled} className="hold" style={{backgroundColor: this.props.b_color}} id={this.props.id} onClick={this.props.action}>
            <span className="c-vert">
                {this.props.children}
            </span>
            <span className="c-vert" style={{color: this.props.color}}>{this.props.text}</span> 
        </div>
    )
    
    
  }

  static defaultProps = {
    color: "strikeout",
    disabled: false,
    b_color: "strikeout"
  }
}



export default Control;