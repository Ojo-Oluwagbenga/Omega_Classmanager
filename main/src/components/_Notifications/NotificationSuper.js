import React, {Component} from "react";
import Notification from "./Notification";

class NotificationSuper extends Component {
    constructor(props) {
        super(props);
        this.setUpNotiSocket();
        this.state = {
            notifications : [],
            togglestate:"all" //For All pages page
        }
    }  

    setUpNotiSocket(){
        let class_code = "neededclass_code";
        let user_code = "user_code"

        let url = `ws://${window.location.host}/ws/notification/subscribe/${class_code}/${user_code}`;
        this.chat_wsConnect = new WebSocket(url);

        this.chat_wsConnect.onopen = function(){
            console.log("Connected");
            popAlert("Connected");
        }
        this.chat_wsConnect.onclose = function (event) {
            // popAlert("Reconnecting...");    
            console.log("Disconnected");
        };

        let context = this;
        this.chat_wsConnect.onmessage = function(e){

            let response = (JSON.parse(e.data))
            context.process_notification_recieved(response)
            

            console.log(response);
            popAlert("Notification recieved");
            
        }
    }
    process_notification_recieved(notidata){
        this.state.notifications = [notidata, ...this.state.notifications]
        this.forceUpdate();
    }

    toggleScreen(to){
        console.log(to);
        this.setState({togglestate:to});
    }


    componentDidMount(){ 
        axios({
            method: 'POST',
            url: '../../api/notification/fetch_user_notifications',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                class_code : "class_code",
                user_code : "user_code",
            }
        }).then(response => {
            response = response.data;

            console.log(response);

            if (response.passed){
                response = response.queryset;
                if (this.hasvalues(response)){
                    this.myprops['citem'] = {...response.tableset}
                    this.setState({tabledata: {...response.tabledata}})
                    
                }else{
                    console.log("-----");
                }
            }else{
                popAlert("Unable to fetch");
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
                        <li onClick={()=>this.toggleScreen("all")} className={this.state.togglestate=="all"? "active" : ""}>All Items</li>
                        <li onClick={()=>this.toggleScreen("upd")} className={this.state.togglestate=="upd"? "active" : ""}>Updates</li>
                        <li onClick={()=>this.toggleScreen("rem")} className={this.state.togglestate=="rem"? "active" : ""}>Reminder</li>
                        <li onClick={()=>this.toggleScreen("cla")} className={this.state.togglestate=="cla"? "active" : ""}>Class</li>
                        <li onClick={()=>this.toggleScreen("soc")} className={this.state.togglestate=="soc"? "active" : ""}>Social</li>
                        <li onClick={()=>this.toggleScreen("gen")} className={this.state.togglestate=="gen"? "active" : ""}>General</li>
                    </ul>
                </div>
                {/* // <!-- Announcement details --> */}        

                <div className="details-hold">
                    {
                        this.state.notifications.map((noti, i) =>{
                            const ss = this.state.togglestate;
                            return (ss == noti.category || ss == "all") ? <Notification key={i} noti_data={noti}/> : ""
                        })
                    }
                </div>    

                

            </>
        );
    }
}
export default NotificationSuper;
