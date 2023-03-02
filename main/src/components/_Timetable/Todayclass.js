import React, {Component} from "react";

class Todayclass extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }  
    daytocode(name){
        const name2code = {
            "Monday":"md",
            "Tuesday":"td",
            "Wednesday":"wd",
            "Thursday":"thd",
            "Friday":"fd",
            "Saturday":"std",
            "Sunday":"snd",
        }
        return name2code[name]
    }

    makeandredirect(){
        console.log("dadd");
        let dcode = this.daytocode(this.props.citem.day)
        let daycl_code = this.props.citem.daycl_code
        let class_code = "irK9v"

        window.location.href = `./classdata/${class_code}_${dcode}_${daycl_code}`;

    }

    tomeridian(time) {
        var timeSplit = time.split(':'), hours, minutes, meridian;

        hours = timeSplit[0];
        minutes = timeSplit[1];
        
        if (hours > 12) {
            meridian = 'PM';
            hours -= 12;
        } else if (hours < 12) {
            meridian = 'AM';
            if (hours == 0) {
                hours = 12;
            }
        } else {
            meridian = 'PM';
        }

        return (hours + ':' + minutes + ' ' + meridian);
    }

    render() {
        return (
            <div loaded="1" className="container" onClick={() => this.makeandredirect()}>
                <div className="first-flex">
                        <div className="course">
                    <b>{this.props.citem.code}</b>  
                    </div>
                    <div className="status">
                        {
                            this.props.citem.status == 2 ? 
                                <><span className="color"></span> <span className="name c-vert">Tentative</span></>
                            : ''                        
                        } 
                        {
                            this.props.citem.status == 1 ? 
                                <><span className="color green"></span> <span className="name c-vert">Active</span></>
                            : ''                        
                        }                    
                    </div>
                </div>
                <div className="content">
                    <h5>{this.props.citem.name}</h5>
                    <p className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>                                
                        <span>{this.tomeridian(this.props.citem.starttime)} - {this.tomeridian(this.props.citem.endtime)}</span>
                    </p>
                    <p className="icon bottom">
                        <svg style={{height: "16px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                        <span>{this.props.citem.venue}</span>
                    </p>
                </div>
                <div className="description">
                    <div className="head">Extra Info</div>
                    {this.props.citem.extrainfo}
                </div>
                
                <div className="open-desc c-vert" opened="0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M169.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 274.7 54.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>
                </div>
                
            </div>
        );  
    }
}

export default Todayclass;
