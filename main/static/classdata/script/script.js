
$(document).ready(function(){
    $('.swipe-control').click(function(){
        $('html, body').animate({
            scrollTop: '0'
        }, 200);
    })
   
    $(document).scroll(function() {
        var y = $(this).scrollTop();
        if (y > 150) {
            $('.swipe-control').css({"opacity": 1});
        } else {
            $('.swipe-control').css({"opacity": 0});
        }
    });
})