import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import ReactDOM from "react-dom/client";

import PendingDue_Super from './components/_PendingDue_D/PendingDue_Super'
import Attendance_Super from './components/_Attendance_D/Attendance_Super'
import QrSuperGen from './components/_Qrgenerate/QrSuperGen'
import Tablesuper from './components/_Timetable/Tablesuper';
import TodayclassSuper from './components/_Timetable/TodayclassSuper';
import PageSingleSuper from './components/_Timetable/PageSingleSuper';
import NotificationSuper from './components/_Notifications/NotificationSuper';
import AttendanceTablesuper from './components/_Attendancetable/AttendanceTablesuper';

//Note all your react control element must carry a class reactport 
//And attr 'for' based on what we are loading. Must definitely bear a unique id too
 


const Mycomponents = {  
    PendingDue_Super:PendingDue_Super,
    QrSuperGen:QrSuperGen,
    Attendance_Super:Attendance_Super,
    Tablesuper:Tablesuper,
    TodayclassSuper:TodayclassSuper,
    PageSingleSuper:PageSingleSuper,
    NotificationSuper:NotificationSuper,
    AttendanceTablesuper:AttendanceTablesuper,
}

// console.log(MyComponents);
let rmodule = $('.reactport');
function disbuss(){
  
}
rmodule.each(function(){

    let rmod = $(this);

    //Note, this has to be in start Caps
    let Compo = Mycomponents[rmod.attr('for')]

    // console.log(Compo);
    const root = ReactDOM.createRoot(document.getElementById(rmod.attr('id')));
    root.render(
      <Compo/>
    ); 
    
})

