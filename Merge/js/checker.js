var Checker = {
    GP: -1,
    WR:-1,
    JSON: {},
    isSave: false,
    getWarhouses: function (save) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 120;
        obj.data.Warehouse = -1;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Checker.JSON = JSON.parse(data);
                console.log(Checker.JSON);
                var arrLength = Checker.JSON.data.length;
                var options = '<option value=""></option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + Checker.JSON.data[i][0] + '">' + Checker.JSON.data[i][1] + '</option>';
                }
                $("#combobox").html(options);
                $("#combobox").combobox({
                    change: Checker.selectGroup
                });
                if (save === true) {
                    Checker.isSave = true;
                    //$("#combobox").val(Checker.GP);
                    $("#combobox").combobox('autocomplete', Checker.GP);
                    //Checker.selectGroup();
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectGroup: function () {
        Checker.GP = $(this).val();
        var obj = {};
        obj.data = {};
        obj.data.CodeGroupSupply = Checker.GP;
        obj.data.CodeData = 121;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Checker.JSON = JSON.parse(data);
                console.log(Checker.JSON);
                var arrLength = Checker.JSON.Brand.length;
               var list = '';
                for (var i = 0; i < arrLength; i++) {
                    list += '<li class="nav-item"><a class="nav-link" data-val="' + Checker.JSON.Brand[i][0] + '" href="javascript:void(0)">' + Checker.JSON.Brand[i][1] + '</a></li>';
                }
                $('#brand_menu').html(list);
                $('#sidebar .custom-combobox-input').blur();
                if (Checker.isSave) {
                    $('.nav-link[data-val="' + Checker.WR + '"]').click();
                    $('#overlay').css('display', 'none');
                    Checker.isSave = false;
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectBrand: function () {
        $('#tableContent').html('<div class"loader"></div>');
        if ($('.nav-link.checked').length > 0)
        $($('.nav-link.checked')[0]).removeClass('checked');
        var el = $(this);
        el.addClass('checked');
        Checker.WR = el.data('val');
        var arr = Checker.JSON.Wares;
        var arrLength = arr.length;
        var tBody = '';
        var tHead = '<tr>';

        tHead += '<th>Код товару</th>';
        tHead += '<th>Код бренду</th>';
        tHead += '<th>Назва</th>';
        tHead += '<th>Заблокувати<br/><div class="form-check"><lable for="select_all" class="form-check-label small"><input id="select_all" type="checkbox" class="form-check-input"/> Всі</lable></div></th>';
        tHead += '</tr>';

        var checked = 'checked';
        for (var i = 0; i < arrLength; i++) {
            if (arr[i][1] == Checker.WR) {
                tBody += '<tr>';
                tBody += '<td>' + arr[i][0] + '</td>';
                tBody += '<td>' + arr[i][1] + '</td>';
                tBody += '<td>' + arr[i][2] + '</td>';
                tBody += '<td><input data-old="' + arr[i][3] + '" type="checkbox" class="checkbox" ' + (parseInt(arr[i][3]) == 1 ? 'checked' : '') + ' value="' + arr[i][3] + '"/></td>';
                tBody += '</tr>';
                if (parseInt(arr[i][3]) != 1) {
                    checked = '';
                }
            }
        }
        tHead = tHead.replace(/id="select_all"/g, 'id="select_all" '+ checked);
        $('#tableContent').html('<table class="table-bordered table table-striped">' + tHead + tBody + '</table>');
        
    },
    changeStatus: function () {
        var el = $(this);
        var parRow = $(el.closest('tr'));

        if (el.prop('checked')) {
            el.val(1);
        } else {
            el.val(0);
        }

        if (el.data('old') != el.val()) {
            parRow.attr('is-change', true);
        } else {
            parRow.removeAttr('is-change');
        }
    },
    saveCheck: function () {
        var rows = $('tr[is-change="true"]');
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 122;
        obj.data.CodeGroupSupply = Checker.GP;
        obj.data.Data = [];

        var arrLength = rows.length;
        for (var i = 0; i < arrLength; i++) {
            obj.data.Data.push([$(rows[i]).find('td:first-child').text(),$(rows[i]).find('input').val()]);
        }
        obj.data = JSON.stringify(obj.data);
        $('#overlay').css('display','flex');
        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                result = JSON.parse(data);
                console.log(result);
                if (parseInt(result.Sate) != -1) {
                    Checker.getWarhouses(true);
                } else {
                    alert(result.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
                $('#overlay').css('display', 'none');
            }
        });
    },
    controlsInit: function () {
        $('#sidebar').on('click', '.custom-combobox-input', function () {
            $(this).val('');
        });
        $('#sidebar').on('click', '.nav-link', Checker.selectBrand);
        $('#tableContent').on('change', 'input:not([id="select_all"])', Checker.changeStatus);
        $('#save_cheked').click(Checker.saveCheck);
        $('#tableContent').on('change', 'input[id="select_all"]', function () {
            var checked = $(this).prop('checked');
            $('input:not([id="select_all"])').each(function () {
                $(this).prop('checked', checked).trigger('change');
            });
        });
    },
    init: function () {
        if (window.isLogin){
            Checker.getWarhouses();
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    Checker.init();
});