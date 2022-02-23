$(function () {
    $.ajax({
        url: "https://www.postman.com/collections/63f6202751f61498ebdf",
        dataType: 'json',
        beforeSend: function () {
            $('#carregando').show()
        },
        success: function (arrLivros) {
            data = JSON.parse(arrLivros.item[0].response[0].body)[0];
            let result = localStorage.getItem('view').split(" ")
            let result1 = result[1];
            console.log(result[0])
            if (result[0] == "mVendidos") {
                console.log(data.mVendidos[result1]);
                $("main").append(`
                <form action="view.html" class="box"
                    method="get">
                    <div class="titleItens" title="`+ data.mVendidos[result1].nome + `">` + data.mVendidos[result1].nome + `</div>
                    <div class="boxImg"><img src="./`+ data.mVendidos[result1].img + `" alt=""></div>
                    <div class="preco1">`+ data.mVendidos[result1].preco1 + `</div>
                    <div class="preco2">`+ data.mVendidos[result1].preco2 + `</div>
                    <div class="button">
                        <button>COMPRAR</button>
                    </div>
                </form>`);
            }
        },
        error: function () {
            console.log('Ocorreu um erro ao retornar os livros da Saraiva!');
        }
    })
})