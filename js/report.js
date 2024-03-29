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
			contentType:"application/json; charset=utf-8",
            processData: false,
            dataType: 'json',
            data: obj.data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Report.JSON = data;

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
                Report.JSON.ReportParam.__proto__.findParamByParName = function (name) {
                    for (var i = 0; i < this.length; i++) {
                        if (this[i][1] == name) {
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
    renderListParam: function (param) {
        var lable = '<label for="'+param[1]+'" class="col-sm-4">'+param[3]+':</label>';
        var list = '<div class="col-sm-8"><select id="' + param[1] + '" name="' + param[1] + '" class="form-control param-list"></select></div>';
        $('#param_container').before('<div class="col-sm-3 col-xs-12"><div class="form-group"><div class="row">' + lable + list + '</div></div></div>');
        Report.getParamList(param);
    },
    renderDateParam: function (param) {
        var label = '<label for="' + param[1] + '" class="col-sm-4">' + param[3] + ':</label>';
        var input = '<div class="col-sm-8"><input id="' + param[1] + '" name="' + param[1] + '" class="form-control param-date" /></div>';
        $('#param_container').before('<div class="col-sm-3 col-xs-12"><div class="form-group"><div class="row">' + label + input + '</div></div></div>');
        $('#' + param[1]).datepicker({
            format: 'dd-mm-yyyy',
            language: 'uk',
            autoclose: true
        });
        $('#' + param[1]).datepicker("update", new Date());

        var reportCoockie = Cookies.get('reportCoockie');

        if (typeof reportCoockie !== typeof undefined) {
            reportCoockie = JSON.parse(reportCoockie);
        } else {
            reportCoockie = [];
        }

        for (var i = 0; i < reportCoockie.length; i++) {
            if (reportCoockie[i][0] == Report.CurRP) {
                var curValues = reportCoockie[i][1];
                for (var j = 0; j < curValues.length; j++) {
                    var el = $('#' + curValues[j][0]);
                    el.val(curValues[j][1]);
                    if (el.hasClass('param-date')) {
                        el.datepicker("update", curValues[j][1]);
                    }
                }
            }
        }
    },
    renderParam: function (paramArr) {
        var arrLen = paramArr.length;
        for (var i = 0; i < arrLen; i++) {
            
            var par = Report.JSON.ReportParam.findParamByParName(paramArr[i]);
            switch (par[2]) {
                case 'list':
                    Report.renderListParam(par);
                    break;
                case 'date':
                    Report.renderDateParam(par);
                    break;
                default:
                    break;
            }
        }

    },
    selectReport: function () {
        $('.param-list, .param-date').closest('.col-sm-3').remove();
        $('#tableContent').html('');
        $('#export_to_csv').css('display', 'none');
        var el = $(this);
        var val = parseInt(el.val());
        Report.CurRP = val;

        if (val == -1) {
            $('#run_container').css('display', 'none');
        } else {
            var report = Report.JSON.Report.findReportById(val);
            if (report[2] == "") {
                Report.noParamReport();
            } else {
                var repArr = report[2].split(',');
                Report.renderParam(repArr);
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
    getParamList: function (param) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 21;
        obj.data.ParamName = param[1];
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
			contentType:"application/json; charset=utf-8",
            processData: false,
            dataType: 'json',
            data: obj.data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var rJSON = data;

                var options = '<option value="-1"></option>';
                var arr = rJSON.LispParam;
                var arrLen = arr.length;

                for (var i = 0; i < arrLen; i++) {
                    options += '<option value="' + arr[i][0] + '">' + arr[i][1] + '</option>';
                }
                $('#'+param[1]).html(options);
                $('#' + param[1]).combobox({
                    change: Report.selectGP
                });

                var reportCoockie = Cookies.get('reportCoockie');

                if (typeof reportCoockie !== typeof undefined) {
                    reportCoockie = JSON.parse(reportCoockie);
                } else {
                    reportCoockie = [];
                }

                for (var i = 0; i < reportCoockie.length; i++) {
                    if (reportCoockie[i][0] == Report.CurRP) {
                        var curValues = reportCoockie[i][1];
                        for (var j = 0; j < curValues.length; j++) {
                            var el = $('#' + curValues[j][0]);
                            el.val(curValues[j][1]);
                            if (el.hasClass('param-list')) {
                                var input = el.next('span').find('input');
                                input.val(el.find('option:selected').text());
                                input.focus(function () {
                                    input.val('');
                                });
                            }
                        }
                    }
                }
                
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    executeReports: function () {
        Report.Param = [];
        $('.param-list, .param-date').each(function () {
            var el = $(this);
            Report.Param.push([el.attr('id'), el.val()]);
        });

        var reportCoockie = Cookies.get('reportCoockie');

        if (typeof reportCoockie !== typeof undefined) {
            reportCoockie = JSON.parse(reportCoockie);
        } else {
            reportCoockie = [];
        }

        var coockieExists = false;
        for (var i = 0; i < reportCoockie.length; i++) {
            if (reportCoockie[i][0] == Report.CurRP) {
                reportCoockie[i] = [Report.CurRP, Report.Param];
                coockieExists = true;
            }
        }
        if (!coockieExists) {
            reportCoockie.push([Report.CurRP, Report.Param]);
        }
        Cookies.set('reportCoockie', reportCoockie, { expires: 99999 });

        var obj = {};
        obj.data = {};
        obj.data.CodeData = 22;
        obj.data.CodeReport = Report.CurRP;
        obj.data.Parameters = Report.Param;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
			contentType:"application/json; charset=utf-8",
            processData: false,
            dataType: 'json',
            data: obj.data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var rJSON = data;
                
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