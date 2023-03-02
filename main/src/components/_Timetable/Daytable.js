import React, {Component} from "react";
import Dayrow from "./Dayrow";
import Alert from "../Utils/alert";


class Daytable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataset : [...this.props.day_set],
            showalert:false,
            alert_data:{

            }
        }
    }  
    

    addRow = () => {
        this.setState({
            dataset:[...this.state.dataset, {status:"1"}]
        })
    }

    proceed_delete = (data, otherdata) =>{

        console.log(otherdata);

        this.setState({showalert:false});
        if (data == 1){
            const ind = otherdata.value;
            let ini_set = this.state.dataset;
            ini_set.splice(ind, 1);
                                
            this.setState({
                dataset:[...ini_set]
            })
        }

    }

    catcher(type, value, thisClass){
        switch (type) {
            case 'action':
                if (value[0] == 0){
                    thisClass.state.alert_data = {
                        head:"Remove class?",
                        text:"Are you sure you want to remove the selected class from "+ thisClass.props.head,
                        callback:thisClass.proceed_delete,
                        otherdata:{
                            value:value[1]
                        }
                    }
                    thisClass.setState({showalert:true});

                }
                break;
        
            default:
                break;
        }
    }

    render() {
        return (
            <div className="namesuper editbox" tab={this.props.head}>
                <h3 className="ed-name big">{this.props.head}</h3>
                <div className="contenthold">
                    <div className="shadower"></div>
                    <div className="addnew" onClick={() => this.addRow()}>
                        <svg style={{height: "18px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M240 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H176V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H240V80z"/></svg>
                    </div>

                    <div className="row">
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Status</h3>                             
                        </div>
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Code</h3>                             
                        </div>
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Name</h3>                             
                        </div> 
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Venue</h3>                             
                        </div>
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Start Time</h3>                             
                        </div>
                        <div className="namesuper editbox">
                            <h3 className="ed-name">End Time</h3>                             
                        </div>
                        <div className="namesuper editbox">
                            <h3 className="ed-name">Extra Info</h3>                             
                        </div>
                    </div>

                    {
                        this.state.dataset.map((row, i)=>{
                            row.daycl_code = typeof(row.daycl_code) == "undefined" ?  i : row.daycl_code
                            return <Dayrow super={this} catcher={this.catcher} index={i} key={i} rowdata={row} />
                        })
                    }
                         
                </div>
                {
                    this.state.showalert ? <Alert alert_data={this.state.alert_data}/> : ''
                }
            </div>
        );
    }
}

export default Daytable;
