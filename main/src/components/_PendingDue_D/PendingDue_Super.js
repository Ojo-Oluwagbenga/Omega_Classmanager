import React, {Component} from "react";
import Appsed from './test'
import './pending.css'



class PendingDue_Super extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paychannels : []
        }
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

  getPayChannelData(){
    axios({
        method: 'POST',
        url: window.location.origin + '/api/paychannel/fetch',
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
        },
        data: {
            fetchset:['name', 'price', 'deadline_text', 'itemcode', "has_deadline"],
            fetchpair:{
                creatorid:"cidofrep"
            }
        }
    }).then(response => {
        response = response.data;
        if (response.passed){
            const data = response.queryset
            this.setState({paychannels: data})
        }else{
            console.log('gg', response.passed);
        }
    })
    .catch(error => console.error(error))
}

componentDidMount(){
    this.getPayChannelData()             
}


  render() {
    return (
 
    <section className="pending-due">
        <div className="pending-head">
            <div className="pending">
                <b>Pending Dues</b>
                <span className="c-vert">
                    <svg className="head-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                </span>
            </div>
            <div className="seeall" id="addchannel" onClick={() => {window.location.href = "./createchannel"}}>
                <svg style={{height: "15px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M240 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H176V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H240V80z"/></svg>                    
            </div>
        </div>
        <div className="box-row">
            {
                this.state.paychannels.map((item, i) => {
                    console.log(item);
                    return <div key={i} className={"box one " + item.itemcode}>
                        <div className="inner-box">
                            {
                                item.has_deadline == 1 ? 
                                <p>Due in {this.getTimeLeft(item.deadline_text)}</p> 
                                : <p>No deadline</p> 
                            }
                                
                            
                            <h5>{item.name}</h5>
                            <div className="c-bio-out">
                                <h4 className="amount">#{item.price}</h4>
                                <p className="pay-box">
                                    <a className="pay-btn" onClick={()=>{window.location.href = window.location.origin + '/payout/' + item.itemcode}}>Proceed</a>
                                </p>
                            </div>
                        </div>
                    </div>
                })
            }

        </div>
    </section> 
    )
    
    
  }
}



export default PendingDue_Super;