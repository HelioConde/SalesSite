let navItens = false;
$("#navHotItens").on("mouseup", function () {
    console.log(navItens)
    if (navItens == false) {
        $("#itensList").fadeIn(500);
        navItens = true;
    } else {
        $("#itensList").fadeOut(500);
        navItens = false;
    }
});
$('main').on("mouseup", function () {
    if (navItens == true) {
        $("#itensList").fadeOut(500);
        navItens = false;
    }
});

$('.box').on("mouseup", function () {
    this.submit();
});

$.ajax({
    url: "./view/showItens.html",
    data: {"type":"mVendidos"},
    method: "GET",
    beforeSend: function () {
        $('#carregando').show();
    },
    success: function (result) {
        $(".mVendidos #view").html(result);
        console.log(result)
    }
});

$.ajax({
    url: "./view/showItens.html",
    data: {"type":"promocao"},
    method: "GET",
    beforeSend: function () {
        $('#carregando').show();
    },
    success: function (result) {
        $(".promocao #view").html(result);
        console.log(result)
    }
});

$.ajax({
    url: "./view/showItens.html",
    data: {"type":"novidades"},
    method: "GET",
    beforeSend: function () {
        $('#carregando').show();
    },
    success: function (result) {
        $(".novidade #view").html(result);
        console.log(result)
    }
});