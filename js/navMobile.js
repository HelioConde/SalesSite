let navMobile = false;
$(window).on('mousemove', function () {
    if ($(window).width() < '600') {
        mobile = true;
        $(window).scroll(function (event) {
            if ($(document).scrollTop() <= "0") {
                $(".animScroll1").removeClass("animClass");
            } else if ($(document).scrollTop() >= "70") {
                $(".animScroll1").addClass("animClass");
            }

            if ($(document).scrollTop() <= "150") {
                $(".animScroll2").removeClass("animClass");
            } else if ($(document).scrollTop() >= "276") {
                $(".animScroll2").addClass("animClass");
            }

            if ($(document).scrollTop() <= "650") {
                $(".animScroll3").removeClass("animClass");
            } else if ($(document).scrollTop() >= "770") {
                $(".animScroll3").addClass("animClass");
            }
        });
    } else {
        mobile = false;
        navMobile = false;
        $(".iconBar").css('display', 'flex');
        $(".search").css('display', 'flex');
        $(window).scroll(function (event) {
            if ($(document).scrollTop() <= "0") {
                $(".animScroll1").removeClass("animClass");
            } else if ($(document).scrollTop() >= "200") {
                $(".animScroll1").addClass("animClass");
            }

            if ($(document).scrollTop() <= "579") {
                $(".animScroll2").removeClass("animClass");
            } else if ($(document).scrollTop() >= "700") {
                $(".animScroll2").addClass("animClass");
            }

            if ($(document).scrollTop() <= "1260") {
                $(".animScroll3").removeClass("animClass");
            } else if ($(document).scrollTop() >= "1260") {
                $(".animScroll3").addClass("animClass");
            }
        });
    }
})

$(window).on('touchmove', function () {
    if ($(window).width() < '600') {
        mobile = true;
        $(window).scroll(function (event) {
            if ($(document).scrollTop() <= "0") {
                $(".animScroll1").removeClass("animClass");
            } else if ($(document).scrollTop() >= "70") {
                $(".animScroll1").addClass("animClass");
            }

            if ($(document).scrollTop() <= "150") {
                $(".animScroll2").removeClass("animClass");
            } else if ($(document).scrollTop() >= "276") {
                $(".animScroll2").addClass("animClass");
            }

            if ($(document).scrollTop() <= "650") {
                $(".animScroll3").removeClass("animClass");
            } else if ($(document).scrollTop() >= "770") {
                $(".animScroll3").addClass("animClass");
            }
        });
    } else {
        mobile = false;
        navMobile = false;
        $(".iconBar").css('display', 'flex');
        $(".search").css('display', 'flex');
        $(window).scroll(function (event) {
            if ($(document).scrollTop() <= "0") {
                $(".animScroll1").removeClass("animClass");
            } else if ($(document).scrollTop() >= "200") {
                $(".animScroll1").addClass("animClass");
            }

            if ($(document).scrollTop() <= "579") {
                $(".animScroll2").removeClass("animClass");
            } else if ($(document).scrollTop() >= "700") {
                $(".animScroll2").addClass("animClass");
            }

            if ($(document).scrollTop() <= "1260") {
                $(".animScroll3").removeClass("animClass");
            } else if ($(document).scrollTop() >= "1260") {
                $(".animScroll3").addClass("animClass");
            }
        });
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

$("#view").on("mousedown", function () {
    console.log('teste');
})