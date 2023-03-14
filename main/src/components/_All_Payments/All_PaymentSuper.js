import React, {Component} from "react";
// import Notification from "./Notification";

class All_PaymentSuper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paychannels : [],
            togglestate:"all" //For All pages page
        }
    }  

    

    toggleScreen(to){
        console.log(to);
        this.setState({togglestate:to});
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
                fetchset:['name', 'price', 'deadline_text', 'channel_code', "has_deadline"],
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
        axios({
            method: 'POST',
            url: window.location.origin + '/api/paychannel/fetch',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                fetchset:['name', 'price', 'deadline_text', 'channel_code', "has_deadline"],
                fetchpair:{
                    creatorid:"cidofrep"
                }
            }
        }).then(response => {
            console.log(response);
            response = response.data;
            if (response.passed){
                const data = response.queryset;
                this.setState({paychannels: data})
            }else{
                console.log('gg', response.passed);
            }
        })
        .catch(error => console.error(error))

    }


    render() {
        return (
            <>
                {/* // Announcement Nav */}
                <div className="item-container hidescroll">
                    <ul className="items">
                        <li onClick={()=>this.toggleScreen("all")} className={this.state.togglestate=="all"? "active" : ""}>All Payments</li>
                        <li onClick={()=>this.toggleScreen("1")} className={this.state.togglestate=="1"? "active" : ""}>Waiting</li>
                        <li onClick={()=>this.toggleScreen("0")} className={this.state.togglestate=="0"? "active" : ""}>Cleared</li>
                    </ul>
                </div>
                {/* // <!-- Announcement details --> */}        

                <div className="details-hold"  style={{"padding":"40px 0px 0px 0px "}}>
                    {
                        this.state.paychannels.map((item, i) =>{
                            const ss = this.state.togglestate;
                            return (ss == item.status || ss == "all") ? 
                                <div key={i} className={"box one " + item.channel_code} style={{"margin": "15px auto", "width":"90%"}}>
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
                                                <a className="pay-btn" onClick={()=>{window.location.href = window.location.origin + '/payout/' + item.channel_code}}>Proceed</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>                            
                            : ""
                        })
                    }
                </div>    

                

            </>
        );
    }
}
export default All_PaymentSuper;
