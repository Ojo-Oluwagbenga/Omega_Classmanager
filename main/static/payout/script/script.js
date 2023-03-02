
//Script for the gallery scrolling behavoiur
let childnum = $(".gallerysuper .slideitemhold").children().length
$(".gallerysuper .sliderhold .slider").css({'width':(100*childnum)+"%"})
let holdwidth = 0
let propor = 0
let leftkeep = {}
let spacing = 0;
let clength = 0;
if (childnum > 1){
    spacing =  (5/(childnum-1)) 
}else{
    spacing = 0
} 

function calc(){
    setTimeout(() => {
        clength = ($(".gallerysuper .slideitemhold").width())
        holdwidth = clength*(childnum-1)

        propor = 5/holdwidth
        $(".gallerysuper .slideitemhold .slideitem").each(function(i){
            let scale = 1-(spacing/20)*i;//This is the starting scale of each
            $(this).css({'margin-left': 10+spacing*(i) + "%", 'z-index':-i, 'transform': 'scaleY('+scale+')'}).attr('c-index', i);
            const min = clength* (i)
            const max = clength*(i + 1)
            leftkeep[i] = [(parseFloat($(this).css('margin-left'))/$(this).parent().width())*100, scale, [min,max]];

        })
    }, 300);

}

let active = 0
let activeindex = 0
let scmin = 0;
let scmax = clength+1;
let popped = 0;

function arrange(scrollLeft){
    $(".gallerysuper .slideitemhold .slideitem").each(function(i){
        const data = leftkeep[i]
        const mleft = data[0]
        let mscale = data[1]
        const min = data[2][0]
        const max = data[2][1]
        const range = max-min
        let zind = -1*i;

        if (scrollLeft > (min - range/2) && scrollLeft < (min + range/2)){
            zind = i
            active = min
            activeindex = i;
        }else{
            zind = -i
        }
        if (scrollLeft > min){
            mscale = 1 - (propor*(scrollLeft - min)/20)
            zind = i;
        }else{
            mscale = mscale+propor*scrollLeft/20
        }

        $(this).css({'margin-left': (mleft-propor*scrollLeft)+"%", 'transform': 'scaleY('+(mscale)+')', 'z-index':zind})
    })

}

function set_to_pos(active){
    // This will help move the closest to the top when sliding
    if (active >= 0 && active < clength*childnum ){
        arrange(active);
        $(".gallerysuper .sliderhold").scrollLeft(active)
        let bound = parseInt(active/clength);
        scmin = clength * (bound - 1);
        scmax = clength * (bound + 1);
        clearTimeout(t);
    }else{
        console.log("NEG| " + active);
    }
}

function popout(){
    clearTimeout(t);
    let obj = $(".gallerysuper .slideitemhold > :nth-child("+(activeindex+1)+")");
    let parobjH = $(".gallerysuper").height();
    let parobjW = $(".gallerysuper").width();

    if (popped == 0){
        // Opening the object
        popped = 1;
        $(".gallerysuper .dir").css({
            'display':'none'
        })
        obj.css({
            'height': parobjH,
            'width':parobjW,
            'margin-left':'0px',
            'top':'calc(-5% - 3px)',
            'transition': 'transform 0.3s ease, height 0.4s ease, width 0.3s ease, top 0.5s ease',
        })
    }else{
        // closing the obj in
        popped = 0;
        $(".gallerysuper .dir").css({
            'display':'flex'
        });
        obj.css({
            'height': '100%',
            'width':'80%',
            'top':'0',
            'transition': 'margin 0.1s ease',
            'margin-left':'10%',
        });
        // setTimeout(() => {
        //     obj.css({
        //         'transition': 'inherit',
        //     });                            
        // }, 200);
    }
    
}

calc();                    

// This t is used to instanciate the time variable that's used in different functio
let t = setTimeout(() => {}, 500);

$(".gallerysuper .sliderhold").click(function(){
    popout();
})

$(".gallerysuper .sliderhold").on('scroll', function(e){
    if (popped == 0){
        let scrollLeft = $(this).scrollLeft()
        arrange(scrollLeft);
        clearTimeout(t);
        if (e.originalEvent){
            t = setTimeout(() => {
                set_to_pos(active)
            }, 1000);
        }
    }
})

$(window).resize(function(){
    calc();
})

$(".gallerysuper .dir").click(function(){
    let sign = 1;
    if ($(this).attr('dir') == 'left'){
        sign = -1;
    }
    set_to_pos(active + sign*clength);
})

$(".gallerysuper .enlarge").click(function(){
    popout();
})


function setPageUp(){
    console.log('setting up');
    let has_d = $(".deadline_data .head").attr("bio");
    console.log(has_d);
    if (has_d == 1){
        let vhold = $(".deadline_data .value");
        let tdata = vhold.attr("bio");
        tdata = new Date(tdata).toGMTString();
        vhold.text(tdata);        
    }
    
}
setPageUp();

function toggleswipe(){
    
    if ($(".swipe-control").attr('status') == 0){    
        $(".itembiosuper").css({
            "top":"20vh",
            "height":"80vh"
        })
        // $('html, body').animate({
        //     scrollTop: '1000'
        // }, 200);
          
        $(".swipe-control").css({
            "transform": "rotate(180deg)"
        }).attr("status", 1);
    }else{
        $(".itembiosuper").css({
            "top":"75vh",
            "height":"25vh"
        })
        // $('html, body').animate({
        //     scrollTop: '0'
        // }, 200);
        $(".swipe-control").css({
            "transform": "rotate(0deg)"
        }).attr("status", 0);
    }
}
$(".swipe-control").click(function(){
    toggleswipe();
})
