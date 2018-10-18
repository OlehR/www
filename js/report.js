var Report = {
    CurRP: -1,
    Param:[],
    JSON: {},
    getReports: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 20;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Report.JSON = JSON.parse(data);
                console.log(Report.JSON);

                var options = '<option value="-1">--Виберіть звіт--</option>';
                var arr = Report.JSON.Report;
                var arrLen = arr.length;

                for (var i = 0; i < arrLen; i++) {
                    options += '<option value="' + arr[i][0] + '">' + arr[i][1] + '</option>';
                }
                $('#reports_select').html(options);

                Report.JSON.Report.__proto__.findReportById = function (id) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i][0] == parseInt(id)) {
                            return this[i];
                        }
                    }
                    return -1;
                };
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectReport: function () {
        $('#export_to_csv').css('display', 'none');
        var el = $(this);
        var val = parseInt(el.val());
        Report.CurRP = val;
        if (val == -1) {
            $('#reports_date_begin_container, #reports_date_end_container, #reports_list_select_container, #run_container').css('display', 'none');
        } else {
            var report = Report.JSON.Report.findReportById(val);
            switch (report[2]) {
                case "":
                    Report.noParamReport();
                    break;
                case "code_firm":
                    Report.getListReport();
                    break;
                case "date_begin,date_end":
                    Report.getDateReport();
                    break;
            }
            $('#run_container').css('display', 'block');
        }
    },
    noParamReport: function () {
        $('#reports_date_begin_container, #reports_date_end_container, #reports_list_select_container').css('display', 'none');
        $('#run').prop('disabled', false);
    },
    getListReport: function () {
        if (parseInt($('#reports_list_select').val()) == -1)
            $('#run').prop('disabled', true);
        $('#reports_date_begin_container, #reports_date_end_container').css('display', 'none');
        Report.getParamList();
    },
    getDateReport: function () {
        $('#reports_list_select_container').css('display', 'none');
        $('#reports_date_begin_container, #reports_date_end_container').css('display', 'block');
        $('#run').prop('disabled', false);
    },
    getParamList: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 21;
        obj.data.ParamName = "code_firm";
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var rJSON = JSON.parse(data);
                console.log(rJSON);

                var options = '<option value="-1">--Пошук--</option>';
                var arr = rJSON.LispParam;
                var arrLen = arr.length;

                for (var i = 0; i < arrLen; i++) {
                    options += '<option value="' + arr[i][0] + '">' + arr[i][1] + '</option>';
                }
                $('#reports_list_select').html(options);
                $("#reports_list_select").combobox({
                    change: Report.selectGP
                });
                $('#reports_list_select_container').css('display', 'block');
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    executeReports: function () {
        if ($('#reports_list_select_container').css('display') != 'none')
            Report.Param = [[$('#reports_list_select').attr('name'), $('#reports_list_select').val()]];
        if ($('#reports_date_begin_container').css('display') != 'none' && $('#reports_date_end_container').css('display') != 'none')
            Report.Param = [['date_begin', $('#reports_date_begin').val()], ['date_end', $('#reports_date_end').val()]];
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 22;
        obj.data.CodeReport = Report.CurRP;
        obj.data.Parameters = Report.Param;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var rJSON = JSON.parse(data);
                
                if (parseInt(rJSON.State) != -1){
                    Report.renderTable(rJSON.data);
                } else {
                    alert(rJSON.TextError);
                }

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectGP: function () {
        var val = $(this).val();
        console.log(val);
        if(parseInt(val) != -1){
            $('#run').prop('disabled', false);
        } else {
            $('#run').prop('disabled', true);
        }
    },
    renderTable: function (data) {
        var arr = data.InfoColumn;
        var arrLen = arr.length;
        var tHead = '<thead>';
        var tBody = '<tbody>';

        tHead += '<tr>';
        for (var i = 0; i < arrLen; i++) {
            tHead += '<th title="' + arr[i] + '">' + arr[i] + '<div>' + arr[i] + '</div></th>';
        }  
        tHead += '</tr>';
        tHead += '</thead>';

        arr = data.Data;
        arrLen = arr.length;

        for (var i = 0; i < arrLen; i++) {
            tBody += '<tr>';
            for (var j = 0; j < arr[i].length; j++) {
                tBody += '<td title="' + arr[i][j] + '">' + arr[i][j] + '</td>';
            }
            tBody += '</tr>';
        }

        var table = '<table class="table table-bordered table-stripped">' + tHead + tBody + '</table>';
        $('#tableContent').html(table);
        $('#export_to_csv').css('display','block');
    },
    controlsInit: function () {
        $('#reports_select').change(Report.selectReport);
        $('#reports_list_select_container').on('focus', '.custom-combobox-input', function () {
            var el = $(this);
            if (parseInt($('#reports_list_select').val()) == -1)
            el.val('');
        });
        $('#run').click(function () {
            $('#tableContent').html('<div class="loader"></div>');
            if (!$(this).prop('disabled')) {
                Report.executeReports();
            }
        });
        $('#export_to_csv').click(function () {
            var $table = $('#tableContent table');
            var csv = $table.table2CSV({
                delivery: 'value'
            });
            var uri = 'data:text/csv;charset=UTF-8,%EF%BB%BF'
            + encodeURIComponent(csv);
            downloadURI(uri, 'request_' + new Date()+'.csv');
        });
    },
    init: function () {
        if (window.isLogin){
            Report.getReports();
        }
        this.controlsInit();
    }
}
function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}
$(document).ready(function () {
    Report.init();
});