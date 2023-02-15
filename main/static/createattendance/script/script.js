$(document).ready(function(){
    
    let courses = [
        {
            title:"Introductory Criminology",        
            course_code:"CRM605",          
        },
        {
            title:"Introductory Math",        
            course_code:"MTH101",          
        },
        {
            title:"Master Chemistry",        
            course_code:"CHM201",          
        },
        {
            title:"Advanced Criminology",        
            course_code:"CRM305",          
        },
        {
            title:"Introductory Criminology",        
            course_code:"PRM605",          
        }, 
    ]
    let classes = [
        {
            name:"Apyherseos Criminology",        
            class_code:"CRM605",          
        },
        {
            name:"Helpme Math",        
            class_code:"MTH101",          
        },
        {
            name:"Medicine And suge",        
            class_code:"CHM201",          
        },
        {
            name:"Advanced Criminology",        
            class_code:"CRM305",          
        },
        {
            name:"Introductory Criminology",        
            class_code:"PRM605",          
        }, 
    ]

    let loadedcourses = {};

    courses.map(function(obj){
        loadedcourses[obj.course_code] = obj.title;
    });
    
    let selected_classes = {};
    let selected_course = '';
    let loadedclasses = {};
    classes.map(function(obj){
        loadedclasses[obj.class_code] = obj.name;
    });

    function load_dditem(pid){        
        loader = {}
        if (pid == "coursehold"){
            loader = loadedcourses
            if ((Object.keys(loader)).length == 0){
                courses.map(function(obj){
                    loadedcourses[obj.course_code] = obj.title;
                });
            }
        }

        if (pid == "classhold"){
            loader = loadedclasses
            if ((Object.keys(loader)).length == 0){
                classes.map(function(obj){
                    loadedclasses[obj.class_code] = obj.name;
                });
            }
        }
        
        let apstr = '';
        for (const key in loader) {
            apstr += `<div class="dditem" id="${key}">${loader[key]}</div>`;
        }
        $(`#${pid} .dropdownwrap .dropdown`).html(apstr);
    }
    
    function load_selected_classes(selected_classes){
        let apstr = ``;
        for (const key in selected_classes) {
            apstr += `<span class="selecteditems" id="${key}">
                    <span>${selected_classes[key]}</span>                        
                    <span class="remover">
                        <svg xmlns="http://www.w3.org/2000/svg" style="fill:#7c1010;  ; height:13px" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
                    </span>
                </span>`;

        }
        $(".selecteditems-hold").html(apstr);

        $(".selecteditems .remover").click(function(){
            delete selected_classes[$(this).parent().attr("id")];
            load_selected_classes(selected_classes);
        })
    }

    function closeDropDown(id){
        
        $("#"+id+" + .dropdownwrap .dropdown").css("height", "0px");
        $("#"+id+' span.svghold').css({'display':'none'});
        setTimeout(function(){
            $("#"+id+" + .dropdownwrap").css("display", "none");
            $("#"+id).attr("openstate", 0);
        }, 300);
    }

    $('.filterer span').click(function(){
        let pid = $(this).parent().parent().attr("id")
        let stext = $(`#${pid} .filterer input`).val();
        
        
        if (pid == 'coursehold'){
            loadedcourses = {};
            var rgxp = new RegExp(stext, "gi");

            courses.map(function(obj){
                if ((obj.title).match(rgxp) !== null){
                    loadedcourses[obj.course_code] = obj.title;
                }
            });
            
            if ((Object.keys(loadedcourses)).length == 0){
                popAlert('No Match Found!');
            }else{
                $(`#${pid} .ddhold`).click();
            }
        }
        if (pid == 'classhold'){
            loadedclasses = {};
            var rgxp = new RegExp(stext, "gi");

            classes.map(function(obj){
                if ((obj.name).match(rgxp) !== null){
                    loadedclasses[obj.class_code] = obj.name;
                }
            });

            if ((Object.keys(loadedclasses)).length == 0){
                popAlert('No Match Found!');
            }else{
                $(`#${pid} .ddhold`).click();
            }
            
        }

        
    });

    $(".ddhold").click(function(){       

        let ddId = $(this).attr("id");
        let ostate = $(this).attr("openstate");

        let pid = $(this).parent().attr('id');
        load_dditem(pid);
        $(`#${ddId} span.svghold`).css({'display':'block'});

        $(".ddhold").each(function(i){
            let id = $(this).attr("id");
            if (id != ddId){
                closeDropDown(id);
                $("#"+id+" + .dropdownwrap .dropdown").css("height", "0px");
                setTimeout(function(){
                    $("#"+id+" + .dropdownwrap").css("display", "none");
                    $("#"+id).attr("openstate", 0);
                }, 300);
            }
        });

        $(".dditem").click(function(){           
            $(`#${ddId} span.name`).text($(this).text());
            closeDropDown(ddId);    
            if (pid == "coursehold"){
                selected_course = $(this).attr("id");
                console.log(selected_course);
            }            
            if (pid == "classhold"){
                const thisid = $(this).attr("id");
                selected_classes[thisid] = loadedclasses[thisid];
                load_selected_classes(selected_classes);
            }
        });
        
        let ddobj = $("#"+ddId+" + .dropdownwrap .dropdown");
        if (ostate == 0){
            $("#"+ddId+" + .dropdownwrap").css("display", "flex");
            ddobj.css("height", "0px");
            $(`#${ddId} span.svghold`).css({'display':'block'});
            setTimeout(function(){
                ddobj.css("height", '300px');
                $("#"+ddId).attr("openstate", 1);
            }, 150);
        }

        if (ostate == 1){
            closeDropDown(ddId);
        }
        
    });

    $(".createattendance").click(function(){
        
        payload= {
            description:$(".description textarea").val(),
            time:$("#classtime").val(),
            creatorid:"loggeduser",
            course_code:selected_course,
            notify:$(this).attr("notify"),
        }
        console.log(payload.time);

        let error = 0
        let classes = Object.keys(selected_classes);

        if (selected_course == ""){
            popAlert("Select a course above please");
            error = 1;
        }        
        if (classes.length == 0){
            popAlert("Kindly select at least a class");
            error = 1;
        }
        payload["classes"] = classes;

        console.log(payload);

        if (error == 0){                   
            console.log("Sending");
            axios({
                method: 'POST',
                url: './api/attendance/create',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    payload: payload             
                }
            }).then(response => {console.log(response)})
            .catch(error => console.error(error))
        }

       
        //submit
    });
})