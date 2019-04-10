var Plane = {
    JSON:{},
    Data: {
        CodeWarehouse: -1,
        CodeGroupWares: -1,
        CodeMonth: -1,
        CodeData:102
    },
    getWarhouses: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 101;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = data;
                if (typeof result.Warehouse !== typeof undefined) {
                    var arrLength = result.Warehouse.Data.length;
                    var options = '<option value="-1">--Вибрати ТЗ--</option>';
                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + result.Warehouse.Data[i][0] + '">' + result.Warehouse.Data[i][1] + '</option>';
                    }
                    $("#warehouse").html(options);
                }

                arrLength = result.GroupWares.length;
                options = '<option value="-1">--Вибрати ГП--</option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + result.GroupWares[i][0] + '">' + result.GroupWares[i][1] + '</option>';
                }
                $("#waregroup").html(options);
                
                $("#tableContent").html('<h1 class="text-center">Виберіть торговий зал і групу постачання.</h1>');
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectWarehouse: function () {
        Plane.Data.CodeWarehouse = parseInt($("#warehouse").val());

        if (Plane.checkWaresSelected()) {
            Plane.getPlane();
        }
    },
    selectGP: function () {
        Plane.Data.CodeGroupWares = parseInt($("#waregroup").val());

        if (Plane.checkWaresSelected()) {
            Plane.getPlane();
        }
    },
    checkWaresSelected: function () {

        var dataArr = $('#date').val().split("-");
        Plane.Data.CodeMonth = dataArr[1] + '' + dataArr[0];

        if (Plane.Data.CodeWarehouse == -1 && Plane.Data.CodeGroupWares == -1) {
            $("#tableContent").html('<h1 class="text-center">Виберіть торговий зал і групу постачання.</h1>');
            return false;
        }

        if (Plane.Data.CodeWarehouse == -1) {
            $("#tableContent").html('<h1 class="text-center">Виберіть торговий зал.</h1>');
            return false;
        }

        if (Plane.Data.CodeGroupWares == -1) {
            $("#tableContent").html('<h1 class="text-center">Виберіть групу постачання.</h1>');
            return false;
        }

        return true;
    },
    getPlane: function () {
        $("#tableContent").html('<div class="loader"></div>');

        var obj = {};
        obj.data = JSON.stringify(Plane.Data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data:obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Plane.JSON = data;
                Plane.renderTable();
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    renderTable: function () {
        if (Plane.JSON.DataPlan.length == 0) {
            $("#tableContent").html('<h1 class="text-center">По даній групі товарів відсутні дані в АМ.</h1>');
            return;
        }
        var date = '01-' + $('#date').val();
        var dateArr = date.split("-");
        date = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
        var MonthMaxDays = moment(date).endOf('month').toDate().getDate();
        
        var table = '<table class="table table-responcive table-stripped table-bordered"><tr>';
        table += '<th>код</th>';
        table += '<th>назва</th>';
        table += '<th>буд.</th>';
        table += '<th class="table-success">вих.</th>';
        for (var i = 0; i < MonthMaxDays; i++) {
            var date = (i+1 < 10 ? ('0' + (i+1)) : (i+1)) + '-' + $('#date').val();
            var dateArr = date.split("-");
            date = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
            var classes = '';
            if (moment(date).isoWeekday() == 6 || moment(date).isoWeekday() == 7) {
                classes += 'table-success';
            }
            table += '<th class="' + classes + '">' + (i + 1) + '</th>';
        }
        table += '</tr>';
        for (var i = 0; i < Plane.JSON.DataPlan.length; i++) {
            table += '<tr class="dataRow">';
            for (var j = 0; j < MonthMaxDays + 2; j++) {
                if(j==2){
                    table += '<td><input data-day="today" col="0" class="form-control" value="0"/></td>';
                    table += '<td class="table-success"><input col="1" data-day="week" class="form-control" value="0"/></td>';
                }
                var dataDay = "none";
                var classes = '';
                if (j > 1){
                    var date = ((j - 1) < 10 ? ('0' + (j - 1)) : (j - 1)) + '-' + $('#date').val();
                    var dateArr = date.split("-");
                    date = dateArr[2] + '-' + dateArr[1] + '-' + dateArr[0];
                    if (moment(date).isoWeekday() == 6 || moment(date).isoWeekday() == 7) {
                        dataDay = "week";
                        classes += 'table-success';
                    } else {
                        dataDay = 'today';
                    };
                }
                if (Plane.JSON.DataPlan[i][j] == null && j > 1)
                    table += '<td class="' + classes + '"><input data-day="' + dataDay + '" col="' + (j + 2) + '" class="form-control" value="' + Number(Plane.JSON.DataPlan[i][j]) + '"/></td>';
                else
                    if (isNaN(Plane.JSON.DataPlan[i][j]) || j == 0)
                        table += '<td>' + Plane.JSON.DataPlan[i][j] + '</td>';
                    else
                        table += '<td class="' + classes + '"><input data-day="' + dataDay + '" col="' + (j + 2) + '" class="form-control" value="' + Number(Plane.JSON.DataPlan[i][j]) + '"/></td>';
            }
            table += '</tr>';
        }
        table += '</table>';

        $('#tableContent').html(table);
    },
    onBlur: function () {
        var el = $(this);
        var row = el.closest('.dataRow');
        row.removeClass('table-warning');
        if (el.attr('data-old') != el.val() && el.val() != '') {
            row.attr('data-is-change', 'true');
        } else {
            el.val(el.attr('data-old'));
        }
    },
    onFocus: function () {
        var el = $(this);
        if (el.val() != '' && !el.prop('readonly'))
            el.attr('data-old', el.val());
        var row = el.closest('.dataRow');
        row.addClass('table-warning');

        if (!el.prop('readonly'))
            el.val('');
    },
    onChange: function () {
        var el = $(this);
        var row = el.closest('.dataRow');
        var inputs = row.find('input[data-day="' + el.data('day') + '"]').not('input[col="0"],input[col="1"]');

        for (var i = 0; i < inputs.length; i++){
            $(inputs[i]).val(el.val());
        }
    },
    savePlane: function () {
        var JsonSend = {};
        var rows = $('.dataRow');
        var dateArr = $('#date').val().split('-');
        JsonSend.Data = [];
        JsonSend.CodeWarehouse = $('#warehouse').val();
        JsonSend.CodeMonth = dateArr[1] + '' + dateArr[0];


        console.log(rows.length);

        for (var i = 0; i < rows.length; i++) {
            JsonSend.Data[i] = [];
            JsonSend.Data[i].push($(rows[i]).find('td:first-child').html());
            var cols = $(rows[i]).find('input').not('input[col="0"],input[col="1"]');
            console.log(cols.length);
            for (var j = 0; j < cols.length; j++) {
                JsonSend.Data[i].push($(cols[j]).val());
            }
        }

        console.log(JsonSend);
        JsonSend.CodeData = 103;

        var obj = {};
        obj.data = JSON.stringify(JsonSend);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = data;
                if (result.TextError === "Ok") {
                    alert('Дані успінео збережені');
                }else {
                    alert(result.TextError);
                }
                console.log(result);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    init: function () {
        Plane.getWarhouses();

        $("#warehouse").change(Plane.selectWarehouse);
        $("#waregroup,#date").change(Plane.selectGP);

        $('#tableContent').on('focus','input',Plane.onFocus);
        $('#tableContent').on('blur', 'input', Plane.onBlur);
        $('#tableContent').on('change', 'input[col="0"],input[col="1"]', Plane.onChange);
        $('#saveplane').click(Plane.savePlane);
    }
}
Plane.init();