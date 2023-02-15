import React, {Component} from "react";
import Appsed from './test'



class PendingDue_Super extends Component {
  constructor(props) {
    super(props);
  }  

  render() {
    return (
 
    <section className="pending-due">
        <div className="pending-head">
            <div className="pending"><b>Pending Dues</b> (9)</div>
            <div className="seeall">See All</div>
        </div>
        <div className="box-row">
        <div className="box one">
            <div className="inner-box">
                <p>Due in 24hrs</p>
                <h5>CTE 121 Practical Manual</h5>
                <h4 className="amount"><img src="../static/dashboard/img/naira.png"></img> 1500</h4>
                <p className="pay-box">
                    <a className="pay-btn" href="">Pay Now</a>
                </p>
            </div>
            </div>
            <div className="box two">
                <div className="inner-box">
                    <p>Due in 1 day</p>
                    <h5>COM 121 Handout</h5>
                    <h4 className="amount"><img src="../static/dashboard/img/naira.png"></img> 1000</h4>
                <p className="pay-box">
                    <a className="pay-btn" href="">Pay Now</a>
                </p>
                </div>
            </div>
            <div className="box three">
                <div className="inner-box">
                    <p>Due in 3 day</p>
                    <h5>MTH 111 Handout</h5>
                    <h4 className="amount"><img src="../static/dashboard/img/naira.png"></img> 800</h4>
                <p className="pay-box">
                    <a className="pay-btn" href="">Pay Now</a>
                </p>
                </div>
            </div>
        </div>
    </section> 
    )
    
    
  }
}



export default PendingDue_Super;