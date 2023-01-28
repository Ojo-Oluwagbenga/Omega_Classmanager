import React, {Component} from "react";
import Appsed from './test'



class PendingDue_Super extends Component {
  constructor(props) {
    super(props);
  }  

  render() {
    return (

    <section class="pending-due">
        <div class="pending-head">
            <div class="pending"><b>Pending Dues</b> (4)</div>
            <div class="seeall">See All</div>
        </div>
        <div class="box-row">
        <div class="box one">
            <div class="inner-box">
                <p>Due in 24hrs</p>
                <h5>CTE 121 Practical Manual</h5>
                <h4 class="amount"><img src="../static/dashboard/img/naira.png"></img> 1500</h4>
                <p class="pay-box">
                    <a class="pay-btn" href="">Pay Now</a>
                </p>
            </div>
            </div>
            <div class="box two">
                <div class="inner-box">
                    <p>Due in 1 day</p>
                    <h5>COM 121 Handout</h5>
                    <h4 class="amount"><img src="../static/dashboard/img/naira.png"></img> 1000</h4>
                <p class="pay-box">
                    <a class="pay-btn" href="">Pay Now</a>
                </p>
                </div>
            </div>
            <div class="box three">
                <div class="inner-box">
                    <p>Due in 3 day</p>
                    <h5>MTH 111 Handout</h5>
                    <h4 class="amount"><img src="../static/dashboard/img/naira.png"></img> 800</h4>
                <p class="pay-box">
                    <a class="pay-btn" href="">Pay Now</a>
                </p>
                </div>
            </div>
        </div>
    </section> 
    )
    
    
  }
}



export default PendingDue_Super;