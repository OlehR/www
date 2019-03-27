var User = {
    login: function () {
        var apiUrl = window.apiUrl;
        var btn = $(this);
        var loginData = {};
        loginData.data = {};

        btn.prop('disabled', true);
        btn.html('Зачекайте');

        loginData.data.Login = $('#inputLogin').val();
        loginData.data.PassWord = $('#inputPassword').val();
        loginData.data.CodeData = 1;
        loginData.data = JSON.stringify(loginData.data);

        if (typeof window.loginUrl != typeof undefined) {
            apiUrl = loginUrl;
        }

        $.ajax({
            url: apiUrl,
            method: "POST",
            xhrFields: {
                withCredentials: true
            },
            data: loginData,
            success: function (data) {
                if (IsJsonString(data)) {
                    data = JSON.parse(data);
                }
                if (data.TextError == "Ok") {
                    Cookies.set('isLogin', 'true');
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
                            Plane.init();
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
                    alert(JSON.parse(data).TextError);
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
                if (IsJsonString(data)) {
                    data = JSON.parse(data);
                }

                
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

function IsJsonString(str) {
    if (typeof str !== "string") {
        return false;
    }
    try {
        JSON.parse(str);
        return true;
    }
    catch (error) {
        return false;
    }
}