var Index = {
    getMenuList: function () {
        var apiUrl = "http://znp.vopak.local/api/api_v1.php";
        var obj = {};
        obj.data = {};

        obj.data.CodeData = -1;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            xhrFields: {
                withCredentials: true
            },
            data: obj,
            success: function (data) {
                var result = JSON.parse(data);
                console.log(result);
                if (result.TextError == "Ok") {
                    var list = '<ul class="site-menu">';
                    for (var i = 0; i < result.Sites.length; i++) {
                        list += '<li><a href="' + result.Sites[i][1] + '">' + result.Sites[i][0] + '</a></li>';
                    }
                    $('#menuBox').html(list);
                } else {
                    alert(JSON.parse(data).TextError);
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
        Index.getMenuList();
        Index.controlsInit();
    }
};

$(document).ready(function () {
    Index.init();
});