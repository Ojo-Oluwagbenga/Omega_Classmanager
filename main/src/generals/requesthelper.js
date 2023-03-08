export default class Helper {

    test(){
        alert("Hello");
        console.log("Testetd");
    }

    sendRequests(url, data, callback, ){
        axios({
            method: 'POST',
            url: window.location.origin +  url,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
            },
            data: data
        }).then(response => {
            callback(response.data)
        })
        .catch(error => console.error(error))
    }

    getLoggedUser(){
        // axios({ 
        //     method: 'POST',
        //     url: '../api/general/getauthuser',
        //     headers: {
        //         'Cache-Control': 'no-cache',
        //         'Pragma': 'no-cache',
        //         "X-CSRFToken" : $("input[name='csrfmiddlewaretoken']").val()
        //     },
        //     data: {
        //         payload: payload
        //     }
        // }).then(response => {
        //     console.log(response)

        //     if (response.data.response == 200){
        //         console.log("Starting");
        //         let imageset = response.data.image_set
        //         this.swithImage(imageset, 1200, function(img64){
        //             $("#qrcodeimage").attr("src", img64);
        //         })
        //     }
            

        // })
        // .catch(error => console.error(error))

        return {
            "name":"Ojo John",
            "name":"Ojo John",
            "name":"Ojo John",
            "name":"Ojo John",
            "name":"Ojo John",
        }
    }


    initiateListeners(){
        EMPIRICAL['listeners'] = {}
    }
    registerListener(addr, callback){
        EMPIRICAL.listeners[addr] = callback
    }
    sendParcel(addr, parcel){
        EMPIRICAL.listeners[addr].listener(parcel);
    }

}