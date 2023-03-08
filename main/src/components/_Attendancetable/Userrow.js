import React, {Component} from "react";

class Userrow extends Component {
    constructor(props) {
        super(props);
       
    }  
    
    thrower(type, value, parclass){
        this.props.catcher(type, value, parclass)  
        if (type == 'action'){
            if (value[0] != 0){
                this.props.rowdata.status = value[0];
                this.forceUpdate()
            }
        }    
    }


  rowdata = this.props.rowdata;
  
  render() {
    return (
        [
            <div>
                
            </div>
        ]
    );
  }
}

export default Userrow;
