$(document).ready(function(){
    let user_data = JSON.parse(sessionStorage.getItem("user_data"));
    let user_class_data = user_data.class_data;
    console.log(user_class_data);
    function pageSetup(){
        if (user_data.has_face == 0){
            $(".change-face-auth .t-hold").text("Register Face Auth")
        }
        if (user_data.accept_status != 1){
            $(".unsigned").css("display", "block");
            $(".class_data.others").css("display", "none");
        }
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");   
            if ($(this).attr("type") == 'text'){
                $(this).val(user_data[toload]);
                return;
            }         
            if (toload == 'role'){
                $(this).text(user_data['user_type'] == 'rep' ? "Class Lead" : 'Memeber');
                return;
            }
            $(this).text(user_data[toload])
        })
        $(".__class_to_load").each(function(){
            const toload  = $(this).attr("item");   
            if ($(this).attr("type") == 'text'){
                $(this).val(user_data[toload]);
                return;
            }      
            $(this).text(user_class_data[toload])
        })
    }
    pageSetup();

    $(".leave").click(function(){
        // popAlert("Leave the fucking classs");
        let data = {
            head:"Leave class?",
            text:'You will be removed from this class and no longer receive activities partaining to them',
            positiveCallback:leaveClass,
            negativeCallback:()=>{},
        }
        confirmChoice(data);
    })

    function leaveClass(){
        popAlert("Removing user from class")
        axios({
            method: 'POST',
            url: '../api/user/removeclass',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                payload: submit_item
            }
        }).then(response => {
            console.log(response);
            if (response.data.passed){
                window.location.href = '../dashboard'
            }else{
                console.log(response);
                let err = response.data.error
                console.log(err);
                for(let key in err){
                    $("#"+key).append("<span class='errorpack' style='font-size: 13px;'>"+ err[key] +"</span>");
                }
            }
        }).catch(error => console.error(error))  
    }

    $(".profileEdit .cancel").click(function(){
        popAlert("Operation Cancelled");
        $(".profileEdit-super").css("display", "none");
    })
    $(".profileEdit .proceed").click(function(){
        let data = {
            head:"Edit profile?",
            text:"Are you sure you want to save all changes?",
            negativeCallback:()=>{},
            positiveCallback:saveEditProfile
        }
        confirmChoice(data)
    })
    function saveEditProfile(){
        popAlert("Checking password...");
        let upds = {};
        $("#profile-Update .entries input").each(function(){
            if ($(this).val() != ""){
                upds[$(this).attr("id")] = $(this).val();
            }
        });
        if (!upds['old_password']){
            popAlert("Enter old password to proceed with updates");
            return;
        }
        if (!upds['old_email']){
            popAlert("Enter the old email address to proceed.");
            return;
        }

        console.log(upds);
        axios({
            method: 'POST',
            url: '../api/user/update',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: {
                validation_set:{
                    password: upds.old_password,
                    uniqueid: upds.old_email,
                },
                updates:{
                    ...upds
                },
                fetchpair:{
                    email:upds.old_email
                },
            }
        }).then(response => {
            response = response.data;
            console.log(response);

            if (response.passed){
                popAlert("Details updated successfully!")
                location.reload();
            }else{
                popAlert(response.Message)
            }
        }).catch(error => console.error(error))  
        
    }

    $("#joinclass").click(function(){
        window.location.href = './joinclass';
    })
    $("#editprofile").click(function(){
        $(".profileEdit-super").css({
            'display':"block",
        })
    })
    $("#tellafriend").click(function(){
        popAlert("Sending the the invite");
    })

    $("#promotions").click(function(){
        popAlert("Redircecing to promo");
    })
    $("#logout").click(function(){        
        confirmChoice({
            head:"Log Out",
            text:"Are you sure you want clear cache and log out?",
            negativeCallback:()=>{},
            positiveCallback:logout
        })
    })
    function logout(){
        popAlert("Logging out..."); 
    }
    $(".change-face-auth").click(function(){        
        popAlert("Redirecting");
        window.location.href = "./changeface"
    })
})