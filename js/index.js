var Index = {
    getMenuList: function () {
        var obj = {};
        obj.data = {};

        obj.data.CodeData = -1;
        obj.data = JSON.stringify(obj.data);

        console.log(obj);

        $.ajax({
            url: apiUrl,
            method: "POST",
            xhrFields: {
                withCredentials: true
            },
            data: obj,
            success: function (data) {
                var result = data;
                if (result.TextError === "Ok") {
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