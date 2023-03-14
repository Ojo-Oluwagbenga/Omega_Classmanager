$(document).ready(function(){

    let user_data = JSON.parse(sessionStorage.getItem("user_data"));
    let user_class_data = user_data.class_data

    console.log(user_class_data);
    
    let classes = [
        {
            name:"Mechanical Engineering",        
            class_code:"ShlDW",    
        },
        {
            name:"Introductory Math",        
            class_code:"MTH101",          
        },
        {
            name:"Master Chemistry",        
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
    let loadedclasses = {};

    classes.map(function(obj){
        loadedclasses[obj.class_code] = obj.name;
    });
    
    let selected_class = '';
    let selected_level = '';
    let user_type = '';
    let hasrep = true;
    

    function load_dditem(pid){        
        loader = {}
        if (pid == "coursehold"){
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
    
    function closeDropDown(id){
        
        $("#"+id+" + .dropdownwrap .dropdown").css("height", "0px");
        $("#"+id+' span.svghold').css({'display':'none'});
        setTimeout(function(){
            $("#"+id+" + .dropdownwrap").css("display", "none");
            $("#"+id).attr("openstate", 0);
        }, 300);
    }

    function setPage_Rep_member(type){
        // 0 for member 1 for rep
        if (type == "member"){
            user_type = 'member';            
            $(".join-type .head").text("Joining as a Member");
            $("#coursehold").css({
                "display":"block"
            })
            $("#classname").css("opacity", 0.8);
            $("#classname input").attr("readonly", true).val("");
            $("#classnick").css({
                'display':"none"
            })
            $(".join-type .text").text("Can't find your class? Only the rep can start a class");
            $(".join-type #toggle-join").text("Join as the rep");
            
            $(".join-type #raise-issue").text("Invite rep");
            $(".join-type #raise-issue").css({
                'display':"inline"
            })
            
        }
        if (type == 'rep'){
            user_type = 'rep';
            $(".join-type .head").text("Joining as the class Rep");
            $("#coursehold").css({
                "display":"none"
            })
            $("#classnick").css({
                'display':"block"
            })
            $("#classname").css("opacity", 1);
            $("#classname input").removeAttr("readonly").val("");
            $(".join-type #raise-issue").css({
                'display':"none"
            })
            
            $(".join-type .text").text("The class rep is required to start an be the first in the class.");
            $(".join-type #toggle-join").text("Join as a member");

            
        }
        
    }

    setPage_Rep_member(user_data.user_type);

    $('.filterer span').click(function(){
        let pid = $(this).parent().parent().attr("id")
        let stext = $(`#${pid} .filterer input`).val();
        
        
        if (pid == 'coursehold'){
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
            $("#classname input").val($(this).text());
            closeDropDown(ddId);    
            if (pid == "coursehold"){
                selected_class = $(this).attr("id");
                console.log(selected_class);
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

    $(".radiobutton").click(function(){
        $(".radiobutton").removeClass("selected");
        $(this).addClass("selected");
        $("#userlevel input").val($(this).find(".text").text())
        selected_level = $(this).addClass("selected").attr("value");
        console.log(selected_level);
    })

    $("#toggle-join").click(function(){
        console.log("togling");
        if (user_type == 'rep'){
            setPage_Rep_member('member')
        }else{
            setPage_Rep_member("rep")
        }
    })

    $("#raise-issue").click(function(){
        if (user_type == 'rep'){
            popAlert("Sending a fvking mail")
            //Send fvking email against to us to resolve
        }
        if (user_type == 'member'){
            data = {
                entryset:[
                    {name:"Student mail of the Rep", required:true, keyname:"email"},
                ],
                positiveCallback:(data)=>{
                    console.log(data);
                    popAlert("The rep will be notified!");
                    //Send the fucker a mail
                },
                negativeCallback:()=>{},
                head:"Invite Class Rep",
            }            
            dataCollect(data)
        }
    })

    $(".createattendance .hold").click(function(){
                
        let payload= {
            class_code:selected_class,  
            class_name:loadedclasses[selected_class],          
            user_type:user_type,
            matric:$("#matric input").val(),
            level:selected_level,
        }
        let create_payload = {
            name:$("#classname input").val(),
            nick_name:$("#classnick input").val(),
            level:selected_level,
            university:"OAU"
        }
        if (payload.class_code == '' && user_type == 'member'){
            popAlert("Kindly select the class from the tab above");return
        }
        if (create_payload.name == '' && user_type == 'rep'){
            popAlert("Enter your class name above as a text to create it");return
        }
        if (payload.matric == ''){
            popAlert("Kindly enter your matric id above");return
        }
        if (create_payload.level == ''){
            popAlert("Kindly check a level above");return
        }

        let req_data = {
            ...payload,
            create_payload:{...create_payload}            
        }
        console.log(req_data);

        let data = {
            head:user_type == "rep" ? "Join as Rep?" : "Join as Member?",
            text:user_type == "rep" ? "You will be the first member of the new class that will be created" : "You will be added as a member of the class that has been selected",
            positiveCallback:()=>{
                popAlert(user_type == "rep" ? "Creating class..." : "Joining class...")
                axios({
                    method: 'POST',
                    url: './api/user/add_join_class',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                    },
                    data: req_data,
                }).then(response => {                    
                    response = response.data;
                    console.log(response)
                    if (response.passed){
                        user_data['class_code'] = response.class_code;
                        user_data['matric'] = payload.matric;
                        user_data['accept_status'] = 1;
                        user_data.class_data['name'] = response.class_name;
                        user_data.class_data['nick_name'] = response.class_nick_name;
                        user_data.class_data['level'] = response.class_level;
                        user_data.class_data['rep_code'] = response.class_rep_code;

                        sessionStorage.setItem("user_data", JSON.stringify(user_data));
                        
                        popAlert("You are ready to go!");
                        setTimeout(() => {
                            window.location.href = './dashboard';
                        }, 1000);
                    }else{
                        popAlert(response.Message)
                    }
                })
                .catch(error => console.error(error))
            },
            negativeCallback:()=>{}
        }

        confirmChoice(data)
        
       
        //submit
    });
    
})