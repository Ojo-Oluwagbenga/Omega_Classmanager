$(document).ready(function(){
    let recallcount = 0
    tout = () => {
        setTimeout(() => {
            let k = $(".today .innerscroll .container");
            if (!k.attr("loaded")){
                console.log('calling again');
                if (recallcount < 10){
                    recallcount += 1;
                    // popAlert("Recalling")
                    tout()
                }                
            }else{
                init();
            }
        }, 500);
    }
    tout();

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
})