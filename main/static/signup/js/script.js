const toggleButton = document.querySelectorAll(".page-toggle");

const handleToggle = (el) => {
    const parent = el.parentElement;
    const fields = parent.querySelector(".page-field");

    if (fields.type === "password") {
        fields.type = "text";
        el.src = "img/icon_show.svg";
    } else {
        fields.type = "password";
        el.src = "img/icon_hide.svg";
    }
}

toggleButton.forEach(button => {
    button.addEventListener("click", () => handleToggle(button));
});

let datapack = {
    member:{
        name:"",
        // matric:"",
        // classcode:"",
        email:"",
        password:"",
        password_again:"",
        bio:{
            head:"Sign up as a Class Member",
        }
    },
    rep:{
        name:"",
        // matric:"",
        // classcode:"",
        // repsecret:"",
        email:"",
        password:"",
        password_again:"",
        bio:{
            head:"Sign up as the class Lead",
        }
    },
    instructor:{
        name:"",
        email:"",
        password_again:"",
        password:"",
        bio:{
            head:"Sign up as an Instructor",
        }
    }
}
let submit_item = 0;
let errorpack = {}

// controls//
$(".usertype").click(function(){
    //This selects the user type first
    $("#select_complete").css({
        'background-color': "#6200EE"
    })
    // Take from the "datapack" the corresponding value of the user
    submit_item = datapack[$(this).attr('id')];
    submit_item['user_type'] = $(this).attr('id');
    submit_item.bio['headpath'] = $(this).attr('id');
    
    $(".usertype").css({
        'box-shadow':'0px 0px 0px black'
    })
    $(".usertype .login-upost-checkbox .round").css({
        'background-color': 'white'
    })    

    $(this).css({
        'box-shadow':'rgb(98 0 238) 0px 1px 8px -5px'
    })
    $(this).find(".login-upost-checkbox .round").css({
        'background-color': 'rgb(98 0 238)'
    })
})

$("#select_complete").click(function(){
    //This will set up the click collect object and the next page
    if (submit_item !== 0){
        $("#userdetails").css({
            'display':'block'        
        })
        $("#userdetails .page-image img").attr('src', "./static/signup/img/head_"+submit_item.bio.headpath+".svg")
        
        $("#userdetails .page-title").html(submit_item.bio.head)
        
        setTimeout(() => {
            $("#userdetails").css({
                'left':'0px'        
            })            
               
            $("#userdetails .page-col").each(function(){
                submit_item.hasOwnProperty($(this).attr('id')) ? $(this).css({"display":'block'}) : $(this).css({"display":'none'}); 
            })
            setTimeout(() => {                
                $("#userselect").css({
                    'display':'none'        
                })
                $("#userdetails .page-back").css("display", "flex");
            }, 300);
        }, 300);    

    }
})

$("#userdetails .page-back").click(function(){
    $(".errorpack").css("display","none");

    $(this).css("display", "none");
    $("#userselect").css({
        'display':'block'        
    })
    $("#userdetails").css({
        'left':'120%'        
    })   

    setTimeout(() => {              
        $("#userdetails").css({
            'display':'none'
        })
    }, 300);  
})

$(".page-col").click(function(){
    $(this).find(".errorpack").css("display","none");
})

$("#sign-up").click(function(){    
    $(".page-col .errorpack").remove();    
    errorpack = {}
    
    for(const key in submit_item){
        const val = $("#"+key + " input").val();
        console.log(key);
        if (typeof(val) !== 'undefined'){
            if (val == ""){
                errorpack[key] = "This entry cannot be empty"
            }
            submit_item[key] = val;
        }
    }
    if (submit_item['name'].length < 4 ){
        errorpack["name"] = "Name cannot be shorter than 4 characters"
    }
    if (submit_item['password'].length < 4 ){
        errorpack["password"] = "Password cannot be shorter than 4 characters"

    }
    if (submit_item['password_again'] !== submit_item['password'] ){
        errorpack["password_again"] = "This does not match the set password"
        
    }
    

    for(let key in errorpack){
        $("#"+key).append("<span class='errorpack' style='font-size: 13px;'>"+ errorpack[key] +"</span>");
    }
    
    console.log(submit_item);

    if (Object.keys(errorpack).length == 0){
        axios({
            method: 'POST',
            url: '../api/user/create',
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
                
                let user_data = {
                    name: submit_item.name,
                    email: submit_item.email,
                    user_type: submit_item.user_type,
                    user_code: submit_item.user_code,
                    accept_status:0,
                    class_data:{}
                }
                sessionStorage.clear();
                sessionStorage.setItem('user_data', JSON.stringify(user_data))
                console.log("redir");
                window.location.href = './dashboard';

            }else{
                console.log(response);
                let err = response.data.error;
                console.log(err);
                for(let key in err){
                    $("#"+key).append("<span class='errorpack' style='font-size: 13px;'>"+ err[key] +"</span>");
                }
            }
        }).catch(error => console.error(error))  
    }else{
        console.log(errorpack);
    }    


});

