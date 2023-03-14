import React, {Component} from "react";

class All_AttendanceSuper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attendances : [],
            togglestate:"all" //For All pages page
        }
    }  

    

    toggleScreen(to){
        console.log(to);
        this.setState({togglestate:to});
    }

    processTime(value) {
        
        let v_set = value.split("T");
        let time = v_set[1];
        let mdate = v_set[0];
        var timeSplit = time.split(':'),
          hours,
          minutes,
          meridian;
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
        return mdate + " at " +(hours + ':' + minutes + ' ' + meridian);
    }


    
    componentDidMount(){ 
        axios({
            method: 'POST',
            url: './api/attendance/fetchforhome',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                class_code:"MTH101"// The user class_code not mth101 ;)
            }
        }).then(response => {
            console.log(response);
            response = response.data;
            if (response.passed){
                const data = response.attendances
                this.setState({attendances: data})
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
                        <li onClick={()=>this.toggleScreen("all")} className={this.state.togglestate=="all"? "active" : ""}>All Attendance</li>
                        <li onClick={()=>this.toggleScreen("1")} className={this.state.togglestate=="1"? "active" : ""}>Active</li>
                        <li onClick={()=>this.toggleScreen("0")} className={this.state.togglestate=="0"? "active" : ""}>Queuing</li>
                        <li onClick={()=>this.toggleScreen("2")} className={this.state.togglestate=="2"? "active" : ""}>Closed</li>
                    </ul>
                </div>
                {/* // <!-- Announcement details --> */}        

                <div className="details-hold" style={{"padding":"40px 0px 0px 0px "}}>
                    {
                        this.state.attendances.map((attd, i) =>{
                            const ss = this.state.togglestate;
                            return (ss == attd.status || ss == "all") ? 
                                <div key={i} className="box one" style={{"margin": "15px auto", "width":"90%"}}>
                                    <div className="inner-boxtwo" onClick={() => {window.location.href = `./initiateattendance/${attd.attendance_code}`}}>
                                        <h4>{attd.course_code}</h4>
                                        <h4 className="hspace">
                                            {this.processTime(attd.time)}</h4>
                                        <h5 className="status">
                                            status: <span className="sta">
                                                {attd.status == 1 ? <span className="s1">Active</span> : (attd.status==2 ? <span className="s2">Closed</span>  : <span className="s0">Queuing</span> )}
                                            </span>
                                        </h5>
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
export default All_AttendanceSuper;
