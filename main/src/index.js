import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import ReactDOM from "react-dom";
import PendingDue_Super from './components/_PendingDue/PendingDue_Super'



//Note all your react control element must carry a class reactport 
//And attr 'for' based on what we are loading. Must definitely bear a unique id too



const Mycomponents = {  
    PendingDue_Super:PendingDue_Super,
}

let rmodule = $('.reactport');
rmodule.each(function(){

    let rmod = $(this);

    //Note, this has to be in start Caps
    let Compo = Mycomponents[rmod.attr('for')]
    console.log(Compo);
    ReactDOM.render(
      <React.StrictMode>
        <Compo/>        
      </React.StrictMode>,
      document.getElementById(rmod.attr('id'))  
    );

})

