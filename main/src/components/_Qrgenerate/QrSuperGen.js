import React, {Component} from "react";
import './gen_style.css'
import Control from './Control'
import Helper from "../../generals/requesthelper";
import Alert from "../Utils/alert";


class QrSuperGen extends Component {
    constructor(props) {
        super(props);
        let needed = JSON.parse($("meta[name='needed_data']").attr("content"));
        this.state = {
            activated: needed.status == 1,
            closed: needed.status == 2,
            status:needed.status,
            isOwner:true,//needed.owner
            attendance_code:needed.attendance_code,//needed.attendance_code
            user_verified:needed.user_verified,            
        }
        this.attendance_code = false;
        this.time_set = new Date().toISOString().split(".")[0];

        console.log("State", this.state);
    }
    
    myState = {
        processRunning: false
    }

    fetch_and_showqr = ()=>{
        
        if (!this.myState.processRunning){
            this.myState.processRunning = true;
            let payload = {
                "attendance_code":this.state.attendance_code,
                "user_code":"loggeduser",
            }
            popAlert("Fetching QRs, wait a sec!");
            axios({ 
                method: 'POST',
                url: '../api/attendance/fetchqr',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    payload: payload
                }
            }).then(response => {
                console.log(response)
                if (response.data.response == 200){
                    console.log("Starting");
                    popAlert("Start the handshake!")
                    let imageset = response.data.image_set
                    this.switchImage(imageset, 1200, function(img64){
                        $("#qrcodeimage").attr("src", img64);
                    },{count:0},()=>{
                        alert('Handshake QRC expired! You may generate a new one');
                        $("#qrcodeimage").attr("src", null);
                        this.myState.processRunning = false;
                    })
                }else{
                    popAlert(response.data.error)
                }            

            })
            .catch(error => console.error(error))
        }else{
            popAlert("Process is running!")
        }

    }

    switchImage = (imageset, t_delta, callback, _data, finalFunc) => {
        if (typeof(_data) == 'undefined'){
            _data = {
                count:0
            }
        }

        setTimeout(() => {
            const ct = _data['count'];
            callback(imageset[ct])                       
            if (imageset.length > ct){
                _data['count'] = ct+1; 
                this.switchImage(imageset, t_delta, callback, _data, finalFunc);
            }else{
                if (typeof(finalFunc) != 'undefined'){
                    finalFunc()
                }
            }
        }, t_delta);
    }  
    view_attendance(){ 
        
    }

    getAttendanceData(){
        
        axios({
            method: 'POST',
            url: '../api/attendance/genfetch',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                fetchpair:{
                    "attendance_code":1
                },
                fetchset:['attendance_code']
            }
        }).then(response => {
            response = response.data;
        })
        .catch(error => console.error(error))
    }

    activate_attendance(context){ 
        
        let attcode = context.state.attendance_code;
        if (!context.myState.processRunning){
            context.myState.processRunning = true;
            popAlert("Activating... Please wait.")
            axios({ 
                method: 'POST',
                url: '../api/attendance/activateattendance',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    attendance_code: attcode,
                    user_code:"loggeduser",
                    time:new Date().toISOString().split(".")[0]
                }
            }).then(response => {
                console.log(response)
                context.myState.processRunning = false;
                if (response.data.response == 200){
                    console.log("Starting");
                    context.setState({
                        activated:true
                    })
                    
                    popAlert("Attendance Activated!")
                }else{
                    popAlert(response.data.Message)
                }            

            })
            .catch(error => console.error(error))
        
        }else{
            popAlert("Process is running, please wait...");
        }
        
    }


    queueNew(context){
        console.log('Closing');

        if (!context.myState.processRunning){
            context.myState.processRunning = true;
        }else{
            popAlert("Process is running!")
            return
        }
        let time = context.time_set

        let data = {
            attendance_code : "T1NE0", 
            user_code:"user_code",
            time:time
        }
        popAlert("Queuing new poll...");
        new Helper().sendRequests("/api/attendance/queue_new", data, (data)=>{
            context.myState.processRunning = false;
            if (data.passed){
                popAlert("Poll Queued!");
                context.setState({
                    closed:false,
                    activated:false,
                    status:0,
                })
            }
        })
        
    }

    unQueueCurrent(context){
        if (!context.myState.processRunning){
            context.myState.processRunning = true;
        }else{
            popAlert("Process is running!")
            return
        }
        let data = {
            attendance_code : "T1NE0", 
            user_code:"user_code"
        }
        if (context.status == 1){
            popAlert("Removing attendance poll...");
        }else{
            popAlert("Unqueing attendance poll..");
        }
        
        new Helper().sendRequests("/api/attendance/unqueue_current", data, (data)=>{
            console.log(data);
            context.myState.processRunning = false;
            if (data.passed){
                popAlert("Unsetting Operation successful!");
                context.setState({
                    closed:true,
                    status:2,
                    activated:false,
                })
            }
        })
    }

    closeCurrent(context){

        if (!context.myState.processRunning){
            context.myState.processRunning = true;
        }else{
            popAlert("Process is running!")
            return
        }
        
        let data = {
            attendance_code : "T1NE0", 
            user_code:"user_code",
            time:new Date().toISOString().split(".")[0]
        }
        popAlert("Closing attendance poll...");
        new Helper().sendRequests("/api/attendance/close_current", data, (data)=>{
            console.log(data);
            context.myState.processRunning = false;
            if (data.passed){
                popAlert("Attendance successfully closed!");

                context.setState({
                    closed:true,
                    status:2,
                    activated:false,
                })
            }
        })
    }

    delete_attendance(context){ 
        
        console.log("Gottic");
        // context.alertAsk(context.delete_attendance)
        // if (context.alertAsking)  return 

        

        if (!context.myState.processRunning){
            context.myState.processRunning = true;
        }else{
            popAlert("Process is running!")
            return
        }
        let data = {
            attendance_code : "T1NE0", 
            user_code:"user_code"
        }
        popAlert("Deleting Attendance...");

        
        // new Helper().sendRequests("/api/attendance/delete_attendance", data, (data)=>{
            
        //     console.log(data);
        //     context.myState.processRunning = false;
        //     // if (data.passed){
        //     //     window.location.href = window.location.origin + "/dashboard";
        //     // }else{
        //     //     popAlert(data.Message)
        //     // }
        // })
        
    }

    startQueue(){
        this.setState({
            startqueue:true
        })
    }
    cancelQueueCreate(){
        this.setState({
            startqueue:false
        })
    }
    proceedQueueCreate(){

       
        let time = $("#starttime").val()
        let delta = new Date(time) - (new Date()) ;        
        if (delta < 0){            
            popAlert("The set date can not be earlier than now")
            return
        }

        this.time_set = time;
        this.setState({startqueue:false});
        this.alertAsk({
            callback:this.queueNew,
            head:"Queue Attendance?",
            text:"This will close all peser"
        })

        
    }


    alertAsk(data){
        console.log("Fucker cvalled");
        let context = this;
        this.setState({
            alert: true,
            startqueue:false,
            alert_data:{
                head:data.head,
                text:data.text,
                callback:function(response, odata){
                    if (response == 1){
                        data.callback(context)
                    }
                    context.setState({
                        alert:false
                    })                    
                },
                otherdata:data.otherdata
            }
        })
    }


    
    
    render() {
        return (
            <section className="pending-due">
                    {
                        this.state.activated ?
                            <div className="qrsuperhold">
                                <div className="text">
                                    Click Generate a QR code to fetch a new set of codes. The other party only needs to capture the code for just a few moment. 
                                </div>
                        
                                <div className="qr-hold">
                                    <img id="qrcodeimage" src="" alt=""></img>
                                    <style>                            
                                        {/* Loads Gen Style */}
                                    </style>
                                </div>
                            </div>
                        :
                            ""
                    }       

                    

                <div className="createchannel initiateattendance" id="create" style={{justifyContent: "right"}}>
                    {/* 
                        Activate - Allows QR gens, toggles status = 1
                        View Data - To View Data
                        Delete - To delete row from Attd
                        Queue - Create and switch to new index Branch Shows up upcoming on student side. status = 0 
                        Unqueue - Remove current index branch from attd // Shows as Remove when activated
                        Close - No Longer shows up on the student side. status = 2 
                        Generate Code - Generate QR
                        Get Verified - Direct to verify                                       
                    */
                    }
                    
                    {
                        !this.state.activated && this.state.isOwner && !this.state.closed ?
                            <Control text="Activate" id="activate" action={this.alertAsk.bind(this, {
                                callback:this.activate_attendance,
                                head:"Activate Attendance?",
                                text:"Usre will now be signabe"
                            })}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        this.state.closed && this.state.isOwner?
                            // <Control text="Queue" id="queue" action={this.alertAsk.bind(this, {
                            //     callback:this.queueNew,
                            //     head:"Queue Attendance?",
                            //     text:"This will close all peser"
                            // })}>
                            //     <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 512 512"><path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z"/></svg>
                            // </Control>

                            <Control text="Queue" id="queue" action={this.startQueue.bind(this)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 512 512"><path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    
                    {
                        !this.state.user_verified?
                            <Control text="Get Verified" id="getverified" action={()=>{window.location.href = '../takeattendance'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}}  viewBox="0 0 512 512"><path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        this.state.activated && this.state.user_verified?
                            <Control text="Generate Code" id="generatecode" action={this.fetch_and_showqr.bind(this)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}}  viewBox="0 0 448 512"><path d="M0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM64 96v64h64V96H64zM0 336c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V336zm64 16v64h64V352H64zM304 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48zm80 64H320v64h64V96zM256 304c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16v96c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16v64c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V304zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        this.state.activated && this.state.isOwner?
                            <Control text="Close" id="close" action={this.alertAsk.bind(this, {
                                callback:this.closeCurrent,
                                head:"Closee Attendance?",
                                text:"No one will be abkle to submit"
                            })}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 512 512"><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V336c0 1.5 0 3.1 .1 4.6L67.6 283c-16-15.2-41.3-14.6-56.6 1.4s-14.6 41.3 1.4 56.6L124.8 448c43.1 41.1 100.4 64 160 64H304c97.2 0 176-78.8 176-176V128c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V240c0 8.8-7.2 16-16 16s-16-7.2-16-16V32z"/></svg>
                            </Control>
                        :
                            ""
                    }    

                    {
                        !this.state.closed && this.state.isOwner?
                            <Control color="white" b_color=" #3c3c3c" text={this.state.activated ? "Remove" : "UnQueue"} id="unqueue" action={this.alertAsk.bind(this, {
                                callback:this.unQueueCurrent,
                                head:"Unquue Attendance?",
                                text:"This Attendance brach data will be removed."
                            })}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"white", height:"13px"}} viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm88 200H296c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>
                            </Control>
                        :
                            ""
                    }                
                    
                    {
                        this.state.isOwner?

                            <Control text="View Data" id="viewdata" action={() =>{window.location.href = window.location.origin + "/attendance_data/"+this.state.attendance_code}}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    
                    {
                        
                        this.state.isOwner ?
                            <Control b_color="red" text="Delete Attendance" id="delete" color="white" action={this.alertAsk.bind(this, {
                                callback:this.delete_attendance,
                                head:"Delete Attendance?",
                                text:"The Attendance data will be removed."
                            })}>
                                <svg xmlns="http://www.w3.org/2000/svg"  style={{fill:"#fff", height:"13px"}} viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                            </Control>
                        :
                            ""
                    }


                    

                </div>

                {
                    this.state.alert? 
                        <Alert alert_data={this.state.alert_data}/>
                    :''
                } 
                {
                    this.state.startqueue ? 
                        <div className="datecollect-hold c-vert">
                            <div className="datecollect">
                                <div className="head">Set Start Time</div>
                                <div vals="starttime" className="texthold editbox ">
                                    <input className="collectible" min="2023-01-07T00:00"  defaultValue={this.time_set} type="datetime-local" id="starttime" 
                                        name="meeting-time" style={{
                                        padding: "10px",
                                        border: "none",
                                        backgroundColor:"white",
                                        outline: "none",
                                        "borderRadius": "5px 0",
                                    }}></input>       
                                    
                                                
                                </div>
                                <div className="control">
                                    <div className="cancel" onClick={this.cancelQueueCreate.bind(this)} >Cancel</div>
                                    <div className="proceed" onClick={this.proceedQueueCreate.bind(this)}> Proceed
                                    </div>
                                </div>
                            </div>
                        </div>
                    :''
                } 
            </section>
        )
        
        
    }
}



export default QrSuperGen;