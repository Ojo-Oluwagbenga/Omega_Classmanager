import React, {Component} from "react";

class Notification extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.noti_data);
    }  
    category_set = {
        "gen":'General',
        "exa":'Exams',
        "cla":'Class',
        "soc":'Social',
        "upd":'Update',
        "rem":'Reminders',
    }
    processTime(time){
        let now = new Date();
        console.log(new Date(time));
        let milliseconds = Math.abs(now - new Date(time));
        let sec = Math.floor(milliseconds/1000);
        let min = Math.floor(sec/60);
        let hr = Math.floor(min/60);

        console.log(sec, min, hr);

        let _hr = hr>1 ? hr + "hrs ago" : hr + "hr ago" 
        let _min = min>1 ? min + "mins ago" : min + "min ago" 
        let _sec = sec + "s ago"
        if (min < 1){
            this.refreshCompo(10);
        }
        if (hr < 1 && min > 5){
            this.refreshCompo(30);
        }

        return hr > 24 ? new Date(time).toUTCString() : (hr > 0 ? _hr : (min > 0 ? _min : _sec))
    }

    refreshCompo(time){
        setTimeout(() => {
            this.forceUpdate();
            this.refreshCompo(time*1000)
        }, time*1000);
    }
    
    getTimeLeft(time){
        let now = new Date();
        var hours = Math.abs(new Date(time) - now) / 36e5;
        let days = Math.floor(hours/24)
        let remhour = Math.floor(hours - (days*24))
    
        let d_apd = 'day';
        let h_apd = 'hr';
    
        if (days > 1){
            d_apd = 'days';
        }
        if (remhour > 1){
            h_apd = 'hrs';
        }
    
        d_apd = days + d_apd + " ";
        h_apd = remhour + h_apd;
    
        if (days == 0){
            d_apd = '';
        }
        if (remhour == 0){
            h_apd = '';
        }
    
        let ret = d_apd+h_apd; 
        return ret;    
    
      }

    render() {
        return (
            <div className="details" style={{"marginTop":" 0"}} onClick={()=>{window.location.href = this.props.noti_data.callback_url}}>
                <h5 style={{"backgroundColor": "#191641"}}>{this.category_set[this.props.noti_data.category]}</h5>
                <p className="detail" dangerouslySetInnerHTML={{ __html: this.props.noti_data.text }}></p>
                <p className="time">{this.processTime(this.props.noti_data.time)}</p>
            </div>
        );
    }
}

export default Notification;
