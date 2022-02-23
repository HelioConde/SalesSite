let navItens = false;
var mVendidosLenght = 0;
var soma = 0;
var limit = false;


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

let mVNext = 5;
function boxSubmit() {
    $('.box').on("mouseup", function () {
        localStorage.setItem('view', $(this).attr('alt'));
        this.submit();
    });
    $('.angle').on("mouseup", function () {
        if ($(this).attr('alt').split(" ")[0] == 'mVendidos') {
            if ($(this).attr('alt').split(" ")[1] == 'left') {
                if (limit == false) {
                    soma = parseFloat(soma + 4);
                    mVendidosLenght = soma;
                    $(".mVendidos #view").html("")
                    mVendidos();
                }
            } else {
                if (soma == 0) {
                } else {
                    soma = parseFloat(soma - 4);
                    mVendidosLenght = soma;
                    $(".mVendidos #view").html("")
                    limit = false;
                    mVendidos();
                }
            }
        }
    });
}
/*
$.ajax({
    url: "./view/showItens.html",
    data: { "type": "mVendidos" },
    method: "GET",
    beforeSend: function () {
        $('#carregando').show();
    },
    success: function (result) {
        $(".mVendidos #view").html(result);
        console.log(result)
    }
});
*/
let data;
$(function () {
    $.ajax({
        url: "https://www.postman.com/collections/63f6202751f61498ebdf",
        dataType: 'json',
        beforeSend: function () {
            $('#carregando').show()
        },
        success: function (arrLivros) {
            data = JSON.parse(arrLivros.item[0].response[0].body)[0];
            mVendidosLenght = 0;
            mVendidos();
            boxSubmit();
        },
        error: function () {
            console.log('Ocorreu um erro ao retornar os livros da Saraiva!');
        }
    })
})

function mVendidos() {
    console.log(mVendidosLenght);
    console.log(parseFloat(soma + 3));
    if (mVendidosLenght <= parseFloat(soma + 3)) {
        if (data.mVendidos[mVendidosLenght] == undefined) {
            mVendidosLenght++;
            limit = true;
            mVendidos(data);
        } else {
            $(".mVendidos #view").append(`
            <form action="view.html" class="box" alt="mVendidos `+ mVendidosLenght + `"
                method="get">
                <div class="titleItens" title="`+ data.mVendidos[mVendidosLenght].nome + `">` + data.mVendidos[mVendidosLenght].nome + `</div>
                <div class="boxImg"><img src="./`+ data.mVendidos[mVendidosLenght].img + `" alt=""></div>
                <div class="preco1">`+ data.mVendidos[mVendidosLenght].preco1 + `</div>
                <div class="preco2">`+ data.mVendidos[mVendidosLenght].preco2 + `</div>
                <div class="button">
                    <button>COMPRAR</button>
                </div>
            </form>`).fadeIn(500);
            $(".promocao #view").append(`
            <form action="view.html" class="box" alt="mVendidos `+ mVendidosLenght + `"
                method="get">
                <div class="titleItens" title="`+ data.mVendidos[mVendidosLenght].nome + `">` + data.mVendidos[mVendidosLenght].nome + `</div>
                <div class="boxImg"><img src="./`+ data.mVendidos[mVendidosLenght].img + `" alt=""></div>
                <div class="preco1">`+ data.mVendidos[mVendidosLenght].preco1 + `</div>
                <div class="preco2">`+ data.mVendidos[mVendidosLenght].preco2 + `</div>
                <div class="button">
                    <button>COMPRAR</button>
                </div>
            </form>`).fadeIn(500);
            $(".novidade #view").append(`
            <form action="view.html" class="box" alt="mVendidos `+ mVendidosLenght + `"
                method="get">
                <div class="titleItens" title="`+ data.mVendidos[mVendidosLenght].nome + `">` + data.mVendidos[mVendidosLenght].nome + `</div>
                <div class="boxImg"><img src="./`+ data.mVendidos[mVendidosLenght].img + `" alt=""></div>
                <div class="preco1">`+ data.mVendidos[mVendidosLenght].preco1 + `</div>
                <div class="preco2">`+ data.mVendidos[mVendidosLenght].preco2 + `</div>
                <div class="button">
                    <button>COMPRAR</button>
                </div>
            </form>`).fadeIn(500);
            console.log(mVendidosLenght);
            mVendidosLenght++;
            mVendidos(data);
        }
    }
}
