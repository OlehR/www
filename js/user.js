var User = {
    login: function () {
        var apiUrl = window.apiUrl;
        var btn = $(this);
        
        btn.prop('disabled', true);
        btn.html('Зачекайте');
        
        $.ajax({
           /* url: apiUrl,
            contentType:"application/json; charset=utf-8",
            method: "POST",
            
            xhrFields: {
                withCredentials: true
            },
			crossDomain: true,
	        processData: false,
            dataType: 'json',*/
            data: JSON.stringify({CodeData:1,Login:$('#inputLogin').val(),PassWord : $('#inputPassword').val()}),
            success: function (data) {
                if (data.TextError === "Ok") {
                    Cookies.set('isLogin', 'true',{ expires: '' });
                    window.isLogin = true;
                    $('#loginForm').hide();
                    switch ($('body').data('page')) {
                        case "ZNP":
                            Table.init();
                            break;
                        case "AM":
                            AMatrix.init();
                            break;
                        case "ConfigZNP":
                            ZnpConfig.getAccessTab();
                            ZnpConfig.Run();
                            break;
                        case "Plan":
                            Plane.init();
                            break;
                        case "Report":
                            Report.init();
                            break;
                        case "Monitoring":
                            Monitoring.init();
                            break;
                        case "ConcurentsMonitoring":
                            Monitoring.mobileInit();
                            break;
                        case "Index":
                            Index.init();
                            $('.login_logout').html('<a id="index_logout_btn" class="nav-link" href="javascript:void(0)">Вихід</a>');
                            break;
                    }
                    btn.prop('disabled', false);
                    btn.html('Вхід');
                } else {
                    alert(data.TextError);
                    btn.prop('disabled', false);
                    btn.html('Вхід');
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Неправельний логін, або пароль.');
                btn.prop('disabled', false);
                btn.html('Вхід');
            }
        });
    },
    logout: function () {
        Cookies.remove('PHPSESSID');
        Cookies.remove('isLogin');
        document.location = 'index.html';
    },
    changePasswordStart: function () {
        $('#ChangePasswordModal').modal('show');
    },
    changePassword: function () {
        var pass1 = $('#change_password1').val();
        var pass2 = $('#change_password2').val();

        if (pass1 !== pass2) {
            alert('Паролі не співпадають!');
            return;
        }

        var data = {};
        data.CodeData = 2;
        data.NewPassWord = pass1;

        $.ajax({
            url: apiUrl,
            method: "POST",
            xhrFields: {
                withCredentials: true
            },
            data: data,
            success: function (data) {

                
                if (data.State === 0) {
                    alert('Пароль успішно змінено');
                    $('#ChangePasswordModal').modal('hide');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    init: function () {
        $('#loginButton').click(User.login);
        $('#logout').click(User.logout);
        $('#change_password').click(User.changePasswordStart);
        $('#change_password_accept').click(User.changePassword);
    }
};

$(document).ready(function () {
    User.init();
});