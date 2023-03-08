$(document).ready(function(){
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
    }

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