var RightsEditor = {

    getData: function () {
       
        $.ajax({            
            data: JSON.stringify({ CodeData: 400}),
            success: function (data) {
                RightsEditor.usersTable(data.Users);
                RightsEditor.usersSelector(data.Users);
                RightsEditor.createTree(data.Accees);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    createTree: function (data) {

        var firstLevel = [];
        var i = 0;
        while (data[i][0] == -1) {
            firstLevel[i] = data[i][1];
            i++;
        }

        var currentEl = [i+1];


        var result = '<ul>';

        for (var j = 0; j < firstLevel.length; j++) {
            result += '<li role="presentation" class="have-child" value="' + data[j][1] + '" id="0_' + data[j][1] + '"> <input type="checkbox" value="' + data[j][1] + '">' + ' <b><a role="menuitem" data-toggle="collapse">' + data[j][3] + '</a></b>';
            result += RightsEditor.fillTree(data, firstLevel[j], currentEl)
            result += '</li>';
        }

        result += '</ul>';

        $('#rightTree').html(result);
       
    },
    fillTree: function (data, parent, begin) {
        var result = '<ul class="tree collapse panel-collapse">';

        var i = begin[0];
        while (i < data.length && data[i][0] == parent) {
            result += '<li value="' + data[i][1] + '"> <input type="checkbox" value="' + data[i][1] + '" id="' + parent + '_' + data[i][1]+ '"   >' + ' <a class="last_child_warhause"> ' + data[i][3] + '</a></li>';
            i++;
        }

        result += '</ul>';
        begin[0] = i;
        return result;
    },
    addUser: function () {
        var ident = true;
        var data = {};
        data.CodeData = 401;

        data.Login = $("#log").val();
        if (!data.Login) ident = false;

        data.PassWord = $("#pas").val();
        if (!data.PassWord) ident = false;

        data.Name = $("#uname").val();
        if (!data.Name) ident = false;

        if (ident) {
            $.ajax({
                data: JSON.stringify(data),
                success: function (data) {
                    if (data.State === 0) {
                        alert('Користувача створено.');
                    } else {
                        alert(data.TextError);
                    }
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
                }
            });
        } else {
            alert('Перевірте введені дані.');
            ident = true;
        }
    },
    usersTable: function (data) {
        var table = '<table class="table table-bordered table-striped table-responsive detail" style="margin-top:15px">';
        table += '<thead>';
        table += '<tr>';

        table += '<th ></th>'
        table += '<th>Код користувача</th>'
        table += '<th>Тип користувача</th>'
        table += '<th>Логін</th>'
        table += '<th>Ім`я</th>'

        table += '</tr>';
        table += '</thead>';
        table += '<tbody>';

        for (var i = 0; i < data.length; i += 1) {
            table += '<tr id="' + data[i][0] + 'user" class="us">';
            table += '<td abbr="block"><img src="../img/b_block.png" width="20" height = "20" id="' + data[i][0] + 'block" class="blockImg" ></td>';
            table += '<td abbr="id" >' + data[i][0] + '</td>';
            table += '<td abbr="type">' + data[i][1] + '</td>';
            table += '<td abbr="login">' + data[i][2] + '</td>';
            table += '<td abbr="name">' + data[i][3] + '</td>';
            table += '</tr>';
        }

        table += '</tbody>';
        table += '</table>';

        $('#usersTable').html(table);
    },
    userProfile: function (v) {
        var result = '<table border="1"><tr><th>Користувач: ' + $('#' + v + 'user td[abbr="name"]').text() + '</th></tr >';

        $('input:checkbox:checked').each(function () {
            result += '<tr><td>' + $(this).next('a').html() + '</td></tr>';
        });

        result += '</table>';

        $('#profile').html(result);
    },
    usersSelector: function (data) {
        var options = '<select id="UsersSelector" class="js-selectize" placeholder="Вибір користувача"> \n <option value=""></option>';
        for (var i = 0; i < data.length; i += 1) {
            options += '<option value="' + data[i][0] + '"> <a role="u">' + data[i][2] + '  ' + data[i][3] +'</a></option>';

        }
        
        options += '</select >';
        $('#users').html(options);

        $('.js-selectize').selectize();
    },
    selectUser: function (v) {
        $.ajax({
            data: JSON.stringify({ CodeData: 403, CodeUser: v}),
            success: function (data) {
                RightsEditor.userRightsShow(data.Accees);
                RightsEditor.userProfile(v);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    blockUser: function (v) {
        $.ajax({
            data: JSON.stringify({ CodeData: 402, CodeUser: v}),
            success: function (data) {
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    userRightsShow: function (data) {
        $('body input:checkbox').prop('checked', false);

        for (var i = 0; i < data.length; i++) {
            try {
                var str = '#' +  data[i][0] + '_' + data[i][1];
                $(str).prop('checked', true);
            } catch (e) {}
        }
    },
    userRightsWrite: function (v) {
        var data = {};
        data.CodeData = 404;
        data.CodeUser = v;

        data.Accees = [];
        $('input:checkbox:checked').each(function () {
            var level = parseInt(this.id);
            data.Accees.push([level, parseInt($(this).val())]);
        });

        $.ajax({
            data: JSON.stringify(data),
            success: function (data) {
                if (data.State!=0)
                    alert('Підчас виконання запиту сталася помилка:' + data.State + '- ' + data.TextError);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $(document).on('click', 'a[data-toggle="collapse"]', function (event) {
            $(event.target).parent().next("ul").toggleClass("show");
        });
        $(document).on('change', '#UsersSelector', function () {
            var value = parseInt($(this).val());
            RightsEditor.selectUser(value);
        });
        $('#saveUserRights').click(function () {
            var value = parseInt($('#UsersSelector').val());
            if (!isNaN(value)) RightsEditor.userRightsWrite(value);
        });
        $('#cancelUserRights').click(function () {
            var value = parseInt($('#UsersSelector').val());
            if (!isNaN(value)) RightsEditor.selectUser(value);
        });
        $(document).on('click', 'td[abbr="type"],td[abbr="id"],td[abbr="login"],td[abbr="name"]', function () {
            RightsEditor.selectUser(parseInt(this.parentElement.id));
            $('#myTab a[href="#RightsEditor"]').tab('show');
        });
        $(document).on('click', 'img[class="blockImg"]', function () {
            if (confirm("Бажаєте заблокувати користувача: " + $(this).parent().next('td').next('td').next('td').next('td').text())) {
                RightsEditor.blockUser(parseInt(this.id));
            };
        });
    },
    init: function () {
        if (window.isLogin) {
            this.getData(true);
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    RightsEditor.init();
});