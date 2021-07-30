var Index = {
    getMenuList: function () {
       
        $.ajax({
            url: apiUrl,
            method: "POST",
            xhrFields: {withCredentials: true},
			contentType:"application/json; charset=utf-8",
            processData: false,
            dataType: 'json',
			crossDomain: true,

            data:  JSON.stringify({CodeData :-1}),
            success: function (data) {
                var result = data;
                if (result.TextError == "Ok") {
                    var list = '<ul class="site-menu">';
                    for (var i = 0; i < result.Sites.length; i++) {
                        list += '<li><a href="' + result.Sites[i][1] + '">' + result.Sites[i][0] + '</a></li>';
                    }
                    $('#menuBox').html(list);
                } else {
                    alert(data.TextError);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Неправельний логін, або пароль.');
            }
        });
    },
    controlsInit: function () {

    },
    init: function () {
        if (window.isLogin) {
        Index.getMenuList();
        Index.controlsInit();
        }
    }
};

$(document).ready(function () {
    Index.init();
});