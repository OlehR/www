var Monitoring = {
    codeDoc:0,
    getListWares: function (withRender) {
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

                if (withRender) {
                    Monitoring.getListByCode(Monitoring.codeDoc);
                }
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
        obj.data.Articl = $('#Articl').prop('checked') === true ? 1 : 0;
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
        obj.data.DateEnd = $('#date_to').val();
        obj.data.Articl = $('#Articl').prop('checked') === true ? 1 : 0;

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
                tHead += "<th>NAME_WARES_CHAR</th>";
                tHead += "<th>Дата початку</th>";
                tHead += "<th>Кінцева дата</th>";
                tHead += "<th>Змінив</th>";
                tHead += "<th>Змінено</th>";
                tHead += "</thead></tr>";

                var tBody = '<tbody>';
                for (var i = 0; i < ListLength; i++) {
                    var link = '';
                    
                        link = '<a href="add_doc.html?code=' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '">' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '</a>';
                    
                    tBody += '<tr>';
                    tBody += '<td>' + link + '</td>';
                    tBody += '<td class="status"><div class="flex">' + List[i][result.Data.InfoColumn.indexOf('NAME_STATE_DOC')] + '<div class="' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == 9 ? 'checked' : '') + '" title="затвердити"><input data-number="' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '" ' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == 9 ? 'checked' : '') + ' name="status1" type="checkbox" class="checkbox" value="9"></div><div class="' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == -1 ? 'checked' : '') + '" title="відмовити"><input data-number="' + List[i][result.Data.InfoColumn.indexOf('CODE_DOC_WARES')] + '" ' + (List[i][result.Data.InfoColumn.indexOf('STATE_DOC')] == -1 ? 'checked' : '') + ' name="status1" type="checkbox" class="checkbox" value="-1"></div></div></td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('NAME_WAREHOUSE')] + '</td>';
                    tBody += '<td>' + List[i][result.Data.InfoColumn.indexOf('NAME_WARES_CHAR')] + '</td>';
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

                if (parseInt(result.Head.STATEDOC) != 0) {
                    $('#import_xl, #save_doc_wares,#code_type_select, #warhouse_select, #date_from, #date_to').attr('disabled', 'disabled');
                }
              
               
                    $('#code_type_select').val(result.Head.CODECHAR);
                    $('#warhouse_select').val(result.Head.CODEWAREHOUSE);
                    $('#date_from').val(result.Head.DATEBEGIN.replace(/\./g, '-'));
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
        $('#concurents').change(Monitoring.getMonitoringList);
        $('#monitoring').change(Monitoring.getDataMonitoring);
        $('#filter_settings').click(function () {
            $('.form-wrapper').toggle();
        });
        $('#tableContent').on('focus', 'input', Monitoring.onFocus);
        $('#tableContent').on('blur', 'input', Monitoring.onBlur);
        $('#not_entered').change(Monitoring.changeDisplayMonitoringItems);
        $('#save_monitoring_data').click(Monitoring.saveMonitoringData);
    },
    init: function () {
        if (window.isLogin) {
            var code = REQUEST.getField('code');
            if (typeof code != typeof undefined) {
                Monitoring.codeDoc = code;
                Monitoring.getListWares(true);
            }
            else {
                this.getListWares();
            }
        }
        this.controlsInit();
    },
    getMonitoringList: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 131;
        obj.data.Concurrent = $('#concurents').val();
        $('#tableContent').html('');
        if (parseInt(obj.data.Concurrent) == -1) {
            $('#monitoring').val(-1).prop('disabled', true);
            return;
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
                console.log(result);

                var html = '<option value="-1">--Моніторинг--</option>';

                for (var i = 0; i < result.Concurent.length; i++) {
                    html += '<option value="' + result.Concurent[i][0] + '">' + result.Concurent[i][1] + '</option>';
                }

                $('#monitoring').html(html).prop('disabled', false);

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    getDataMonitoring: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 132;
        obj.data.Concurrent = $('#concurents').val();
        obj.data.Monitoring = $('#monitoring').val();

        if (parseInt(obj.data.Monitoring) == -1) {
            return;
        }

        obj.data = JSON.stringify(obj.data);
        $('#tableContent').html('<div class="loader"></div>');
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
                var arr = result.Data;
                var arrLen = arr.length;
                var html = '';

                for (var i = 0; i < arrLen; i++) {
                    html += '<div id="' + arr[i][0] + '" class="row dataRow" ' + (parseInt(arr[i][2]) != 0 && $('#not_entered').prop('checked') ? 'style="display: none;"' : '') + '>';
                    html += '<div class="col-8">' + arr[i][1] + '</div>';
                    html += '<div class="col-4"><input type="number" class="form-control" data-old="' + arr[i][2] + '" value="' + arr[i][2] + '"/></div>';
                    html += '</div>';
                }

                $('#tableContent').html(html);
                $('.form-wrapper').hide();

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    onFocus: function () {
        var el = $(this);
        el.select();
    },
    onBlur: function () {
        var el = $(this);
        if ($('#not_entered').prop('checked'))
            el.closest('.dataRow').css('display', 'none');
        else
            el.closest('.dataRow').css('display', 'flex');

        if (el.val() != el.attr('data-old')) {
            el.closest('.dataRow').attr('is-changed', 'true');
        }
    },
    changeDisplayMonitoringItems: function () {
        if (!$('#not_entered').prop('checked')) {
            $('#tableContent div[style="display: none;"]').css('display', 'flex');
        } else {
            $('#tableContent div[style="display: flex;"]').css('display', 'none');
        }
    },
    saveMonitoringData: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 133;
        obj.data.Concurrent = parseInt($('#concurents').val());
        obj.data.Monitoring = parseInt($('#monitoring').val());
        obj.data.Data = [];

        if (obj.data.Concurrent == -1) {
            alert('Не вибраний конкурент!');
            return;
        }

        if (obj.data.Concurrent == -1) {
            alert('Не вибраний моніторинг!');
            return;
        }

        var items = $('div[is-changed="true"]');
        if (items.length <= 0) {
            alert('Відсутні дані для збереження!');
            return;
        }

        items.each(function () {
            var el = $(this);
            obj.data.Data.push([el.attr('id'), el.find('input').val().replace(/,/g, '.')]);
        });

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

                if (parseInt(result.State) == 1) {
                    alert('Дані успішно збережено!');
                    Monitoring.getDataMonitoring();
                } else {
                    alert('Помилка: ' + result.TextError);
                }

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    mobileInit: function () {
        Monitoring.controlsInit();
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 130;

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

                var html = '<option value="-1">--Конкурент--</option>';

                for (var i = 0; i < result.Concurent.length; i++) {
                    html += '<option value="' + result.Concurent[i][0] + '">' + result.Concurent[i][1] + '</option>';
                }

                $('#concurents').html(html);

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    }
}

$(document).ready(function () {
    if ($('body').attr('data-page') != 'ConcurentsMonitoring')
    Monitoring.init();
});