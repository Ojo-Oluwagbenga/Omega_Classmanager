import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import ReactDOM from "react-dom/client";

import PendingDue_Super from './components/_PendingDue/PendingDue_Super'
import Attendance_Super from './components/_Attendance_D/Attendance_Super'
import QrSuperGen from './components/_Qrgenerate/QrSuperGen'



//Note all your react control element must carry a class reactport 
//And attr 'for' based on what we are loading. Must definitely bear a unique id too
 


const Mycomponents = {  
    PendingDue_Super:PendingDue_Super,
    QrSuperGen:QrSuperGen,
    Attendance_Super:Attendance_Super,
}

// console.log(MyComponents);
let rmodule = $('.reactport');
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

