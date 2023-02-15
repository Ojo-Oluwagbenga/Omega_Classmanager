import React, {Component} from "react";
import './gen_style.css'
import Control from './Control'
import Helper from "../../generals/requesthelper";


class QrSuperGen extends Component {
    constructor(props) {
        super(props);
        let needed = JSON.parse($("meta[name='needed_data']").attr("content"));
        this.state = {
            activated: needed.status == 1,
            isOwner:true,//needed.owner
            attendance_code:needed.attendance_code,//needed.attendance_code
            user_verified:needed.user_verified
        }
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
                    this.swithImage(imageset, 1200, function(img64){
                        $("#qrcodeimage").attr("src", img64);
                    },{count:0},()=>{
                        popAlert('Handshake QRs Exhausted!');
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

    swithImage = (imageset, t_delta, callback, _data, finalFunc) => {
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
                this.swithImage(imageset, t_delta, callback, _data, finalFunc);
            }else{
                if (typeof(finalFunc) != 'undefined'){
                    finalFunc()
                }
            }
        }, t_delta);
    }

    activate_attendance(attcode){ 
        if (!this.myState.processRunning){
            this.myState.processRunning = true;
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
                    user_code:"user"
                }
            }).then(response => {
                console.log(response)

                if (response.data.response == 200){
                    console.log("Starting");
                    this.setState({
                        activated:true
                    })
                    this.myState.processRunning = false;
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

    delete_attendance(){ 
        /*Send request to activate attendace     
            Here
            ().then (
                redi fucking rect
            )  
        */
        if (!this.myState.processRunning){
            this.myState.processRunning = true;
        }else{
            popAlert("Process is running!")
        }
        
        
    }

    view_attendance(){ 
        /*Send request to activate attendace     
            Here
            ().then (
                redi fucking rect
            )  
        */
        
        
    }

    getAttendanceData(){
        console.log("Fessings");
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

    
    
    render() {
        return (
            <section className="pending-due">
                    {
                        this.state.activated ?
                            <div className="qrsuperhold">
                                <div className="text">
                                    Click Generate code to fetch a new set of codes. The other party only needs to capture the codes for just a few moment. 
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
                    {
                        !this.state.activated && this.state.isOwner ?
                            <Control text="Activate" id="activate" action={this.activate_attendance.bind(this, this.state.attendance_code)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 384 512"><path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        this.state.activated && this.state.user_verified?
                            <Control disabled={true} text="Generate Code" id="generatecode" action={this.fetch_and_showqr.bind(this)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        this.state.isOwner &&  this.state.activated?

                            <Control text="View Data" id="viewdata" action={this.view_attendance.bind(this)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                            </Control>
                        :
                            ""
                    }                    
                    {
                        this.state.isOwner ?
                            <Control b_color="red" text="Delete" id="delete" color="white" action={this.delete_attendance.bind(this)}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#fff", height:"13px"}} viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                            </Control>
                        :
                            ""
                    }
                    {
                        !this.state.user_verified?
                            <Control text="Get Verified" id="getverified" action={()=>{window.location.href = '../takeattendance'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{fill:"#3434b3", height:"13px"}} viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>
                            </Control>
                        :
                            ""
                    }


                    

                </div>
            </section>
        )
        
        
    }
}



export default QrSuperGen;