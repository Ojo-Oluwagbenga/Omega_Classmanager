$(document).ready(function(){

    $(".initiateattendance #fetchqr").click(function(){
        let payload = {
            "attendance_code":"ShlDW",
            "user_code":"swg",
        }    
        let error = 0 

        
        if (error == 0){  
            
            console.log("Sending");
            axios({ 
                method: 'POST',
                url: '../api/attendance/fetchqr',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
                },
                data: {
                    payload: payload
                }
            }).then(response => {
                console.log(response)

                if (response.data.response == 200){
                    console.log("Starting");
                    const imageset = response.data.image_set;
                    switchImage(imageset, 1200, function(img64){
                        $("#qrcodeimage").attr("src", img64);
                    })
                }
                

            })
            .catch(error => console.error(error))
        }

        //submit
    }); 


    function switchImage(imageset, t_delta, callback, _data){
        if (typeof(_data) == 'undefined'){
            _data = {
                count:0
            }
        }

        setTimeout(() => {
            const ct = _data['count'];
            callback(imageset[ct])                       
            if (imageset.length > ct){
                _data['count'] = ct+1; 
                switchImage(imageset, t_delta, callback, _data);
            }
        }, t_delta);
    }

    
})
