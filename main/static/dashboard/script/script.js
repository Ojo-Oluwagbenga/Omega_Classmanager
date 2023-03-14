$(document).ready(function(){
    let user_data = JSON.parse(sessionStorage.getItem("user_data"));
    function pageSetup(){
        if (user_data.accept_status != 1){
            $(".unsigned").css("display", "block");
        }
        $(".__to_load").each(function(){
            const toload  = $(this).attr("item");
            $(this).text(user_data[toload])
        })
    }
    pageSetup();

    let recallcount = 0
    t_out = () => {
        setTimeout(() => {
            let k = $(".today .innerscroll .container");
            if (!k.attr("loaded")){
                console.log('calling again');
                if (recallcount < 10){
                    recallcount += 1;
                    // popAlert("Recalling")
                    t_out()
                }                
            }else{
                init();
            }
        }, 500);
    }
    user_data.accept_status == 1 ? t_out() : null;

    function init(){
        $(".open-desc").click(function(){
            let opener = $(this);
            let item = opener.parent();
            let desc = item.find(".description");
            let ostate = opener.attr("opened");
    
            if (ostate == 0){
                desc.css({
                    "display": "block",
                    "height":"max-content"
                })
                let ini_h = desc.outerHeight();
                desc.css({
                    "display": "block",
                    "height": "0px",
                })
    
                setTimeout(() => {
                    desc.css({
                        "height": ini_h,
                    })
                    opener.css({
                        "transform": "rotateZ(180deg)"
                    })
                }, 200);
                opener.attr("opened", 1);
            }else{
                desc.css({
                    "height": "0px",
                })
                opener.css({
                    "transform": "rotateZ(0deg)"
                })
    
                setTimeout(() => {
                    desc.css({
                        "display": "none",
                    })
                    
                }, 300);
                opener.attr("opened", 0);
            }
    
    
        })
    }    

    $("#joinclass").click(function(){
        window.location.href = './joinclass';
    })
    
})