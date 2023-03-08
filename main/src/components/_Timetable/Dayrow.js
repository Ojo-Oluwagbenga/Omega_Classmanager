import React, {Component} from "react";

class Dayrow extends Component {
    constructor(props) {
        super(props);
        console.log("prrops", props);
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
            <div className="row" given_index={this.props.mindex} given_code={this.props.rowdata.daycl_code}>
                <div col="status" className="texthold editbox c-vert">
                    <div status={this.props.rowdata.status} className="actions">                                                   
                        <div style={{"backgroundColor": "green"}} onClick={this.thrower.bind(this, 'action', [1, this.props.mindex], this.props.super)} className="act c-vert nocolor-click">
                            <svg style={{display: this.props.rowdata.status== 1 ?"inline":'none'}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                        </div>
                        <div style={{"backgroundColor": "yellow"}} onClick={this.thrower.bind(this, 'action', [2, this.props.mindex], this.props.super)} className="act c-vert nocolor-click">
                            <svg style={{ display: this.props.rowdata.status== 2 ?"inline":'none'}}  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                        </div>
                        <div style={{"backgroundColor": " red"}} onClick={this.thrower.bind(this, 'action', [0, this.props.mindex], this.props.super)} className="act nocolor-click">
                        </div>
                    </div>            
                </div>
                <div col="code" className="texthold editbox">
                    <input className="collectible" type="text" placeholder="SER002" defaultValue={this.rowdata.code}></input>            
                </div>
                <div col="name" className="texthold editbox">
                    <input className="collectible" type="text" placeholder="Introducto..." defaultValue={this.rowdata.name} ></input>                             
                </div>
                <div col="venue" className="texthold editbox ">
                    <input className="collectible" type="text" placeholder="Ajos.." defaultValue={this.rowdata.venue}></input>                              
                </div>
                <div col="starttime" className="texthold editbox ">
                    <input className="collectible" type="time" id="starttime" 
                        name="meeting-time" defaultValue={this.rowdata.starttime} style={{
                        padding: "10px",
                        border: "none",
                        backgroundColor:"white",
                        outline: "none",
                        "borderRadius": "5px 0",
                    }}></input>                     
                </div>
                <div col="endtime" className="texthold editbox ">
                    <input className="collectible" type="time" id="endtime" 
                        name="meeting-time" defaultValue={this.rowdata.endtime} style={{
                        padding: "10px",
                        border: "none",
                        backgroundColor:"white",
                        outline: "none",
                        "borderRadius": "5px 0",
                    }}></input>                     
                </div>
                <div col="extrainfo" className="texthold editbox ">
                    <textarea defaultValue={this.rowdata.extrainfo} className="collectible" type="text" placeholder="" resize="vertical" style={{
                        padding: "10px",
                        border: "none",
                        backgroundColor:"white",
                        height: "40px",
                        outline: "none",
                        marginRight: "20px",
                        borderRadius: "5px 0",
                        
                    }}>
                    </textarea>                           
                </div>
            </div>  
        );
    }
}

export default Dayrow;
