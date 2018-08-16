var REQUEST = {
    getField: function (name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
};
var Monitoring = {
    codeDoc:0,
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
                
                Monitoring.renderDoc(result);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    renderDoc: function (result) {
        var tBody = "<tbody>";
        for (var i = 0; i < result.Wares.length; i++) {
            tBody += '<tr>';
            tBody += '<td>' + result.Wares[i][0] + '</td>';
            tBody += '<td>' + result.Wares[i][1] + '</td>';
            tBody += '</tr>';
        }
        tBody += "<tbody>";
        $('#tableContent').html('<table class="table table-bordered table-stripped">' + tBody + '</table>');
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
        obj.data.CodeDoc = Monitoring.codeDoc;
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
    getOrderWaresDocList: function () {
        $('#tableContent').html('<div class="loader"></div>');
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 31;
        obj.data.DateBegin = $('#date_from').val();
        obj.data.DateBegin = $('#date_to').val();

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
                console.log(result);

                var List = result.Data.Data;
                var ListLength = List.length;
                var tHead = "<thead><tr>";
                tHead += "<th>№</th>";
                tHead += "<th>Статус</th>";
                tHead += "<th>Склад</th>";
                tHead += "<th>Дата початку</th>";
                tHead += "<th>Кінцева дата</th>";
                tHead += "<th>Змінив</th>";
                tHead += "<th>Змінено</th>";
                tHead += "</thead></tr>";

                var tBody = '<tbody>';
                for (var i = 0; i < ListLength; i++) {
                    var link = '';
                    if (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == 0)
                        link = '<a href="index.html?code=' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '">' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '</a>';
                    else
                        link = List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')];
                    tBody += '<tr>';
                    tBody += '<td>' + link + '</td>';
                    tBody += '<td class="status"><div class="flex">' + List[i][result.Data.InfoColumn.indexOf('NAME_STATE_DOC')] + '<div class="' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == 9 ? 'checked' : '') + '" title="затвердити"><input data-number="' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '" ' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == 9 ? 'checked' : '') + ' name="status1" type="checkbox" class="checkbox" value="9"></div><div class="' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == -1 ? 'checked' : '') + '" title="відмовити"><input data-number="' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '" ' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == -1 ? 'checked' : '') + ' name="status1" type="checkbox" class="checkbox" value="-1"></div></div></td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('NAME_WAREHOUSE')] + '</td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('DATE_BEGIN')] + '</td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('DATE_END')] + '</td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('NAME_USER_CHANGE')] + '</td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('DATE_CHANGE')] + '</td>';
                    tBody += '</tr>';
                }
                tBody += '</tbody>';

                $('#tableContent').html('<table class="table table-bordered table-striped">' + tHead + tBody + '</table>');
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    changeStatus: function () {
        var el = $(this);
        if(parseInt(el.val()) == 9){
            if (!confirm('Ви впевнені що хочете затвердити документ №' + el.data('number') + '?')) { return; }
        }
        if (parseInt(el.val()) == -1) {
            if (!confirm('Ви впевнені що хочете відхилити документ №'+el.data('number')+'?')) { return; }
        }
        el.closest('.flex').find('div').removeClass('checked');
        el.parent().addClass('checked');

        var obj = {};
        obj.data = {};
        obj.data.CodeData = 36;
        obj.data.CodeDoc = el.data('number');
        obj.data.State = el.val();

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
                console.log(result);

                Monitoring.getOrderWaresDocList();
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });

    },
    getListByCode: function (code) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 34;
        obj.data.CodeDocWares  = code;

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
                $('#code_type_select').val(result.Head.CODECHAR);
                $('#warhouse_select').val(result.Head.CODEWAREHOUSE);
                $('#date_from').val(result.Head.DATEBEGIN.replace(/\./g,'-'));
                $('#date_to').val(result.Head.DATEEND.replace(/\./g, '-'));
                Monitoring.renderDoc(result);

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

        $('#load_list_doc_wares').click(Monitoring.getOrderWaresDocList);
        $('#tableContent').on('click', '.status .flex div', function () {
            var el = $(this);
            el.find('input').change();
        });
        $('#tableContent').on('change', '.status input', Monitoring.changeStatus);
    },
    init: function () {
        if (window.isLogin) {
            var code = REQUEST.getField('code');
            this.getListWares(true);
            if (typeof code != typeof undefined) {
                Monitoring.codeDoc = code;
                setTimeout(function () {
                    Monitoring.getListByCode(Monitoring.codeDoc);
                }, 120);
            }
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    Monitoring.init();
});