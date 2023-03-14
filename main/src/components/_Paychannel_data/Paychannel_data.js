import React, {Component} from "react";
// import Notification from "./Notification";

class Paychannel_data extends Component {
    constructor(props) {
        super(props);
        this.state = {
            payset : {},
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
    
    toggleMilestone(ucode){
        console.log("Openings");
        let obj = $(`#${ucode}`);
        if (obj.hasClass("open-miles")){
            obj.removeClass("open-miles")
        }else{
            obj.addClass("open-miles")
        }
    }

    toggleHasGiven(ucode){
        let obj = $(`#${ucode}`);
        let context = this;

        if (obj.hasClass("has-collected")){
            confirmChoice({
                head:"Unmark User?",
                text:"Are you sure you want un-mark user from given?",
                negativeCallback:()=>{},
                positiveCallback:()=>{
                    obj.removeClass("has-collected")
                    this.state.payset.pay_data[ucode].is_attended_to = 0;
                    context.forceUpdate();
                }
            })  
            
        }else{
            confirmChoice({
                head:"Give User?",
                text:"Are you sure you want mark user as given?",
                negativeCallback:()=>{},
                positiveCallback:()=>{
                    obj.addClass("has-collected")
                    this.state.payset.pay_data[ucode].is_attended_to = 1;
                    context.forceUpdate()
                }
            })  
            
        }

              
    }

    componentDidMount(){ 
        // axios({
        //     method: 'POST',
        //     url: window.location.origin + '/api/paychannel/fetch',
        //     headers: {
        //         'Cache-Control': 'no-cache',
        //         'Pragma': 'no-cache',
        //         "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
        //     },
        //     data: {
        //         fetchset:['name', 'price', 'deadline_text', 'channel_code', "has_deadline"],
        //         fetchpair:{
        //             creatorid:"cidofrep"
        //         }
        //     }
        // }).then(response => {
        //     console.log(response);
        //     response = response.data;
        //     if (response.passed){
        //         const data = response.queryset;
        //         this.setState({paychannels: data})
        //     }else{
        //         console.log('gg', response.passed);
        //     }
        // })
        // .catch(error => console.error(error))

        let paysuperset = {
            channel_code : "test",
            creatorid : "test",
            name : "For CHM",
            price : "300",
            description : "tHE FREAKING TEST",
            has_deadline : "",
            deadline_text : "",
            deadline_digit : "",
            imageset : "",
            paydata : {
                "user_code":{
                    name:"Ojo John", 
                    user_code:"user_code",
                    status:"1", // 1 is completed, 0 is stillpaying
                    total_paid:"2000",
                    total_left:"2322",
                    last_paid_date:"23th Jan",
                    is_attended_to:0, //1 if user has collected package, 0 if user has not
                    pay_milestone:[
                        {
                            amount_paid:120,
                            date:"12th Jan 2020",
                            amount_left:1200,
                        },
                        {
                            amount_paid:1200,
                            date:"13th Jan 2020",
                            amount_left:0,
                        }
        
                    ]            
                },
                "user_code2":{
                    name:"Ojo John Sdond", 
                    user_code:"user_code",
                    status:"0", // 1 is completed, 0 is stillpaying
                    total_paid:"2000",
                    total_left:"2322",
                    last_paid_date:"23th Jan",
                    is_attended_to:0, //1 if user has collected package, 0 if user has not
                    pay_milestone:[
                        {
                            amount_paid:120,
                            date:"12th Jan 2020",
                            amount_left:1200,
                        },
                        {
                            amount_paid:1200,
                            date:"13th Jan 2020",
                            amount_left:12,
                        }
        
                    ]            
                },
                "user_code3":{
                    name:"Ojo John", 
                    user_code:"user_code",
                    status:"1", // 1 is completed, 0 is stillpaying
                    total_paid:"2000",
                    total_left:"2322",
                    last_paid_date:"23th Jan",
                    is_attended_to:1, //1 if user has collected package, 0 if user has not
                    pay_milestone:[
                        {
                            amount_paid:120,
                            date:"12th Jan 2020",
                            amount_left:1200,
                        },
                        {
                            amount_paid:1200,
                            date:"13th Jan 2020",
                            amount_left:0,
                        }
        
                    ]            
                }
            }
        }

        let pay_data = {...paysuperset.paydata};
        delete paysuperset.paydata;

        let payset = {
            head:paysuperset,
            pay_data:pay_data
        }
        this.setState({payset:{...payset}});

    }


    render() {
        return (
            this.state.payset.head ?
            <>
                {/* Pay Tab */}
                <div className={"box one " + this.state.payset.head.channel_code} style={{"margin": "15px auto"}}>
                    <div className="inner-box">
                        {
                            this.state.payset.head.has_deadline == 1 ? 
                            <p>Due in {this.getTimeLeft(this.state.payset.head.deadline_text)}</p> 
                            : <p>No deadline</p> 
                        }
                            
                        
                        <h5>{this.state.payset.head.name}</h5>
                        <div className="c-bio-out">
                            <h4 className="amount">#{this.state.payset.head.price}</h4>
                            <p className="pay-box">
                                <a className="pay-btn" onClick={()=>{window.location.href = window.location.origin + '/payout/' + this.state.payset.head.channel_code}}>Proceed</a>
                            </p>
                        </div>
                    </div>
                </div>   

                <div className="item-container hidescroll">
                    <ul className="items">
                        <li onClick={()=>this.toggleScreen("all")} className={this.state.togglestate=="all"? "active" : ""}>All Payments</li>
                        <li onClick={()=>this.toggleScreen("com")} className={this.state.togglestate=="com"? "active" : ""}>Completed</li>
                        {/* <li onClick={()=>this.toggleScreen("s")} className={this.state.togglestate=="0"? "active" : ""}>Started</li> */}
                        <li onClick={()=>this.toggleScreen("giv")} className={this.state.togglestate=="giv"? "active" : ""}>Given</li>
                    </ul>
                </div>
                {/* // <!-- Announcement details --> */}        
                

                <div className="details-hold"  style={{"padding":"60px 0px 0px 0px "}}>
                    
                    <div className="user-data-hold">
                        <div className="user-data-sc-hold">
                            <div className="user-data">
                                <div className="user-row head">
                                    <div className="rowpack head">
                                        <div className="item showmore">Show</div>
                                        <div className="item name">Name</div>
                                        <div className="item">Total paid</div>
                                        <div className="item">Total remaining</div>
                                        <div className="item">Last paid</div>
                                        <div className="item">Has Given?</div>
                                    </div>
                                </div>
                                <div className="inner-scroll">
                                    {
                                        Object.keys(this.state.payset.pay_data).map((usercode, i) =>{
                                            const ss = this.state.togglestate;
                                            let userdata = this.state.payset.pay_data[usercode];
                                            // console.log(userdata);
                                            
                                            
                                            if (this.state.togglestate == "com"){
                                                if (userdata.status != 1){
                                                    return
                                                }
                                            }
                                            if (this.state.togglestate == "giv"){
                                                if (userdata.is_attended_to != 1){
                                                    return
                                                }
                                            }

                                            return <div key={i} className={userdata.status == 1 ? "user-row given":"user-row"}  id={usercode} >
                                                <div className="rowpack">
                                                    <div className="item showmore" onClick={()=>this.toggleMilestone(usercode)}> 
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M169.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 205.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/></svg>
                                                    </div>
                                                    <div className="item name">{userdata.name}</div>
                                                    <div className="item">{userdata.total_paid}</div>
                                                    <div className="item">{userdata.total_left}</div>
                                                    <div className="item date">{userdata.last_paid_date}</div>
                                                    <div className="item col-status" onClick={()=>this.toggleHasGiven(usercode)}>
                                                        <div className="inhold c-vert">
                                                            {userdata.is_attended_to == 1 ? 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                            : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rowextra">
                                                    <div className="head">Milestone</div>

                                                    {
                                                        userdata.pay_milestone.map((day_data, j) => {
                                                            
                                                            return (day_data.amount_left == 0 ?                                                              
                                                                <div className="mile-item" key={j}>
                                                                    <div>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M374.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 178.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l80 80c12.5 12.5 32.8 12.5 45.3 0l160-160zm96 128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7 86.6 297.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l256-256z"/></svg>
                                                                    </div>
                                                                    <div>Balanced <b>#{day_data.amount_paid}</b> on {day_data.date} </div>
                                                                </div> 
                                                            :
                                                                <div className="mile-item" key={j}>
                                                                    <div>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                                                                    </div>
                                                                    <div>Paid  <b>#{day_data.amount_paid}</b> on {day_data.date} remaining <b>#{day_data.amount_left}</b> </div>
                                                                </div> )
                                                                
                                                        })
                                                    }
                                                </div>
                                            </div>  
                                    
                                        })
                                    }                                                                

                                </div>
                                
                            </div>        
                        </div>    
                    </div>

                </div>    

                

            </>
            : ""
        );
    }
}
export default Paychannel_data;
