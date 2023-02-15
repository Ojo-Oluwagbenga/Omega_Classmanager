import React, {Component} from "react";



class Attendance_Super extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attendances : []
        }
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
    
    getAttendanceData(){
        console.log("Fessing");
        axios({
            method: 'POST',
            url: './api/attendance/fetchforhome',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                user_code:"loggeduser"
            }
        }).then(response => {
            response = response.data;
            if (response.passed){
                const data = response.attendances
                console.log(data);
                this.setState({attendances: data})
            }else{
                console.log('gg', response.passed);
            }
        })
        .catch(error => console.error(error))
    }

    componentDidMount(){
        console.log("Fessingdelta1");
        this.getAttendanceData()             
    }

    render() {
        return (

            <section className="pending-due"> 
                <div className="pending-head">
                    <div className="pending">
                        <b>Attendance</b>
                        <span className="c-vert">
                            <svg className="head-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M246.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L178.7 256 41.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>
                        </span>
                    </div>
                    <div className="seeall" id="addattendance" onClick={() => {window.location.href = "./createattendance"}}>
                        <svg style={{height: "15px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M240 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H176V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H240V80z"/></svg>                    
                    </div>
                </div>
                <div className="box-row">
                    {
                        this.state.attendances.map((attd, i) => {
                            return <div key={i} className="box one">
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
                        })
                    }

                </div>
            </section>
        )
        
        
    }
}



export default Attendance_Super;