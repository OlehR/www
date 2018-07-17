var Monitoring = {
    getListWares: function () {
        var obj = {};
        obj.data = {}
        obj.data.CodeData = 32;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = JSON.parse(data);
                var html = '<option value="-1">--Виберіть кодування--</option>';

                for (var i = 0; i < result.CodeChar.length; i++) {
                    html += '<option value="' + result.CodeChar[i][0] + '">' + result.CodeChar[i][1] + '</option>';
                }

                $('#code_type_select').html(html);

                html = '<option value="0">Усі склади</option>';

                for (var i = 0; i < result.Warehouse.length; i++) {
                    html += '<option value="' + result.Warehouse[i][0] + '">' + result.Warehouse[i][1] + '</option>';
                }

                $('#warhouse_select').html(html);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    getList: function (csv) {
        var obj = {};
        obj.data = {}
        obj.data.CodeData = 33;
        obj.data.ImportXls = csv;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = JSON.parse(data);
                
                var tBody = "<tbody>";
                for (var i = 0; i < result.Wares.length; i++) {
                    tBody += '<tr>';
                    tBody += '<td>' + result.Wares[i][0] + '</td>';
                    tBody += '<td>' + result.Wares[i][1] + '</td>';
                    tBody += '</tr>';
                }
                tBody += "<tbody>";
                $('#tableContent').html('<table class="table table-bordered table-stripped">' + tBody + '</table>');
                console.log(result);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    importXl: function () {
        $input = $(this);
        var inputFiles = this.files;
        if (inputFiles == undefined || inputFiles.length == 0) return;
        var inputFile = inputFiles[0];

        var reader = new FileReader();
        reader.onloadstart = function (event) {
        };
        reader.onload = function (event) {
            Monitoring.getList(event.target.result);
        };
        reader.onerror = function (event) {
            alert("Сталася помилка: " + event.target.error.code);
        };
        reader.readAsText(inputFile);
    },
    saveWares: function () {
        if (parseInt($('#code_type_select').val()) == -1) {
            alert('Виберіть кодування.');
            return;
        }

        var obj = {};
        var cells = $('tr > td:first-child');
        obj.data = {}
        obj.data.CodeData = 35;
        obj.data.CodeDoc = 0;
        obj.data.CodeWarehouse = $('#warhouse_select').val();
        obj.data.CodeChar = $('#code_type_select').val();
        obj.data.DateBegin = $('#date_from').val();
        obj.data.DateEnd = $('#date_to').val();
        obj.data.Wares = [];
        for (var i = 0; i < cells.length; i++) {
            obj.data.Wares.push($(cells[i]).text());
        }
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = JSON.parse(data);
                if (result.TextError == "Ok")
                    alert('Дані успішно збережено.');
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $('#import_xl').click(function () {
            $('#file-upload').click();
        });
        $('#file-upload').change(Monitoring.importXl);

        $('#save_doc_wares').click(Monitoring.saveWares);
    },
    init: function () {
        if (window.isLogin) {
            this.getListWares(true);
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    Monitoring.init();
});