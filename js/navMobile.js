let navMobile = false;
$(window).on('mousemove', function () {
    if ($(window).width() < '600') {
        mobile = true;
    } else {
        mobile = false;
        navMobile = false;
        $(".iconBar").css('display', 'flex');
        $(".search").css('display', 'flex');
    }
})


$('#navBar').on("mouseup", function () {
    if (mobile == true) {
        if (navMobile == false) {
            $(".iconBar").fadeIn(1000);
            $(".search").fadeIn(1000);
            navMobile = true;
        } else {
            $(".iconBar").fadeOut(1000);
            $(".search").fadeOut(1000);
            navMobile = false;
        }
    }
})
