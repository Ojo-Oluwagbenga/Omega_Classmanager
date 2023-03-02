import React, {Component} from "react";
import CommentReplies from "../Commentary/CommentReplies";
import Helper from "../../generals/requesthelper";

// TRY OUT PUSHER
class PageSingleSuper extends Component {
    constructor(props) {
        super(props);
        let needed = JSON.parse($("meta[name='needed']").attr("needed_data"));

        this.state = {
            tableset:null,
            tabledata:{},
            parcel:{
                address:"comments",
                text:"",  
                replies:{},
                parent_owner:{
                    user_code:"comments"
                },
                owner:{
                    user_code:"user_code",
                    name:"Writer Name",
                }              
            },
            needed: needed
        }

        let h = new Helper();
        h.initiateListeners();        
        h.registerListener("comments",  this)

        this.setUpChatSocket();        
        this.setUpNotiSocket();        
    }  

    chat_wsConnect = {}

    setUpChatSocket(){
        let needed = this.state.needed;
        let class_code = needed.class_code;
        let dc_code = needed.dc_code;

        let dayclass_code = `${class_code}_${dc_code}`

        let url = `ws://${window.location.host}/ws/chat/subscribe/${dayclass_code}`;
        this.chat_wsConnect = new WebSocket(url);

        this.chat_wsConnect.onopen = function(){
            popAlert("Connected");
        }
        this.chat_wsConnect.onclose = function (event) {
            popAlert("Reconnecting...");            
        };

        let context = this;
        let helper = new Helper();
        this.chat_wsConnect.onmessage = function(e){

            let response = (JSON.parse(e.data))
            
            response["action"] = 'addchild';

            let parcel = response
            helper.sendParcel(response.parent_address, parcel);            
        }
    }
    setUpNotiSocket(){
        let class_code = "neededclass_code";
        let user_code = "user_code"

        let url = `ws://${window.location.host}/ws/notification/subscribe/${class_code}/${user_code}`;
        this.chat_wsConnect = new WebSocket(url);

        this.chat_wsConnect.onopen = function(){
            console.log("Agba connected");
            // popAlert("Connected");
        }
        this.chat_wsConnect.onclose = function (event) {
            popAlert("Connection Lost");   
        };
        
        this.chat_wsConnect.onmessage = function(e){

            let response = (JSON.parse(e.data))
            
        }
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
    hasvalues(obj){
        return (Object.keys(obj).length > 0)
    }    
    myprops = {}
    componentDidMount(){ 
        axios({
            method: 'POST',
            url: '../../api/class/fetch_dayclass',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                class_code : this.state.needed.class_code,
                dc_code : this.state.needed.dc_code,
                day : this.state.needed.day
            }
        }).then(response => {
            response = response.data;
            if (response.passed){
                response = response.queryset;


                if (this.hasvalues(response)){
                    this.myprops['citem'] = {...response.tableset}
                    this.setState({tabledata: {...response.tabledata}})
                    
                }else{
                    console.log("-----");
                }
            }
            

        })
        .catch(error => console.error(error))
    }
    k = 0;
    recaller(func, cont_func, timeout, context){
        setTimeout(() => {
            let cond = cont_func(context);
            if (cond){
                func(context);
            }else{
                context.recaller(func, cont_func, timeout, context)
            }
        }, timeout);
    }
    scrolltocomment(new_address, counter){

        setTimeout(() => {
            // let addedcode = context.state.parcel.address + "|codenew" + context.k;
            let obj = $(`div[code="${new_address}"]`);

            if (obj.length){

                let addtop = obj.position().top;
                let scrolltop = $(".innerscroll").position().top;

                $(".innerscroll").animate({
                    scrollTop: (addtop - scrolltop) + 150
                }, 200);
                this.endirect_reply()   
                $("textarea.text").val("")  
            }else{
                counter = !counter?1:counter+1
                
                counter < 10 ? this.scrolltocomment(new_address, counter) : null;
            }

        }, 300);         

    }

    sendComment = ()=>{

        let text = $("textarea.text").val();
        if (text == ""){
            popAlert("Reply texts cannot be empty");
            return
        }     
        popAlert('Adding comment, please wait');

        axios({
            method: 'POST',
            url: '../../api/class/add_timetable_comment',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                text : text,
                address : this.state.parcel.address,
                user_code : 'user_code',
                class_code : this.state.needed.class_code,
                dayclass_code : this.state.needed.dc_code,
                owner:this.state.parcel.owner,
                date:new Date(),                
                parent_owner:this.state.parcel.parent_owner,      
                url:window. location. href,          
            }
        }).then(response => {
            response = response.data;

            if (response.passed){
                this.endirect_reply();
                this.scrolltocomment(this.state.parcel.address+"|"+response.comment_code)
            }else{
                popAlert("Unable to add comment!")
            }
            

        })
        .catch(error => console.error(error))
    }

    listener(parcel){
        // console.log("home", parcel, thisClass);
        if (parcel.isreply){
            this.setState({
                parcel: parcel
            })

            $(".innerscroll").animate({
                scrollTop: '0'
            }, 200);
        }
        if (parcel.action == 'addchild'){
            this.state.tabledata.comments.replies[parcel.comment_code] = parcel;
            this.forceUpdate();
        }
    }
    

    endirect_reply(){
        this.setState({
            parcel:{
                address:"comments",
                text:"",  
                replies:{},
                parent_owner:{
                    user_code:"comments"
                },
                owner:{
                    user_code:"user_code",
                    name:"Writer Name",
                }              
            },
        })
    }

    render() {
        return (
            <div className="product-super">
                {
                    this.myprops.citem ?
                    <div loaded="1" className="container">
                        <div className="otherhold">
                            <div className="first-flex">
                                    <div className="course">
                                <b>{this.myprops.citem.code}</b>  
                                </div>
                                <div className="status">
                                    {
                                        this.myprops.citem.status == 2 ? 
                                            <><span className="color"></span> <span className="name c-vert">Tentative</span></>
                                        : ''                        
                                    } 
                                    {
                                        this.myprops.citem.status == 1 ? 
                                            <><span className="color green"></span> <span className="name c-vert">Active</span></>
                                        : ''
                                    } 
                                </div>
                            </div>
                            <div className="content">
                                <h5>{this.myprops.citem.name}</h5>
                                <p className="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>                                
                                    <span>{this.tomeridian(this.myprops.citem.starttime)} - {this.tomeridian(this.myprops.citem.endtime)}</span>
                                </p>
                                <p className="icon bottom">
                                    <svg style={{"height ":" 16px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                                    <span>{this.myprops.citem.venue}</span>
                                </p>
                            </div>
                        </div>
                        <div className="description">
                            <div className="head">Extra Info</div>
                            {this.myprops.citem.extrainfo}             
                        </div>
                        
                    </div> : ""
                }


                

                <div className="itembiosuper">    
                            
                    <div className="itembio">
                        <div className="topline"></div>
                        <div className="innerscroll">
                            <div className="reviews">
                                <h2 className="revtitle">Class Comments</h2>
                                <div className="commenthold">
                                    {
                                        this.state.parcel.isreply ?
                                            <div className="reply-data">
                                                <div className="head">Replying to <b>Ojo John</b></div>
                                                <div className="body">{this.state.parcel.body}</div>
                                                <div className="cancel" onClick={() => this.endirect_reply()}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                                                </div>
                                            </div>
                                        : ""
                                    }
                                    
                                    <textarea  placeholder="Enter comment here..." className={this.state.parcel.isreply? "text replying":"text"} name="" id=""></textarea>
                                    <div className="submit" onClick={() => this.sendComment()}>
                                        Send <svg xmlns="http://www.w3.org/2000/svg" style={{"fill":" white"}} viewBox="0 0 512 512"><path d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z"/></svg>
                                    </div>
                                </div>
                                <div className="commentSuperPack" style={{"maxHeight": "unset"}}>
                                    {
                                        this.state.tabledata.comments ?
                                            <CommentReplies parent_address="comments" parent={this} replies={this.state.tabledata.comments.replies}/>
                                        : ""
                                    }
                                    
                                    <div className="upost-show-more" style={{"display": "none"}}></div>
                                </div>
                            </div>
                        </div>                  
                            
                    </div>
                </div>



            </div>   
        );
    }
}

export default PageSingleSuper;
