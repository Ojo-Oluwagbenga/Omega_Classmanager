$(document).ready(function(){

    $("#create").click(function(){
        let payload = {
            "name":"",
            "price":"",
            "description":"",
            "has_deadline":"",
            "deadline_text":"unset",
            "deadline_digit":"--",
            "imageset":"",
        }    
        let error = 0 

        for (key in payload){
            if (key == 'name'){
                const name = $("#name").val();
                if (name.length > 4){
                    payload['name'] = name;
                }else{
                    popAlert("Name cannot be shorter than 4 character");
                    error = 1;                    
                    break;
                }
            }
            if (key == 'price'){
                const name = $("#price").val();
                if (name > 0){
                    payload['price'] = name;
                }else{
                    popAlert("Price cannot be negative");
                    error = 1;                    
                    break;
                }
            }
            if (key == 'description'){
                payload['description'] = $("#mpEditorCont #editor .ql-editor").html();
            }
            if (key == 'has_deadline'){
                payload['has_deadline'] = $("#activatetime").is(":checked") ? "1" : "0";
            }
            if (key == 'deadline_text'){
                payload['deadline_text'] = $("#deadline").val();
            }
            if (key == 'imageset'){
                payload['imageset'] = selstate; // Defined in the html doc
            }
            
        }

        console.log(payload);
        if (error == 0){           
            
                        
            axios({
                method: 'POST',
                url: './api/paychannel/create',
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