var Table = {
    StateOrder: -1,
    globalCurrentRow: -1,
    JSON: {},
    Data: {},
    WaresList: [],
    OriginalTableJSON: {},
    sortByColumn: 0,
    sort: 'weeks',
    seeBrands: true,
    prevBrand: '',
    isSuppplier: false,
    renderSettings: [],
    warehouseSettings: [],
    Warehouse: [],
    JSON_warehouse: [],
    old_id: "",
    Quantity: 0,
    ArrChange: [],
    OrderList: [],
    parseGetParams: function () {
        var $_GET = {};
        var __GET = window.location.search.substring(1).split("&");
        for (var i = 0; i < __GET.length; i++) {
            var getVar = __GET[i].split("=");
            $_GET[getVar[0]] = typeof (getVar[1]) == "undefined" ? "" : getVar[1];
        }
        return $_GET;
    },
    tableWares: function (data) {
        var arrLength = data.length;
        var sum = 0;        
        var indexCW = Table.Data.OrderDetail.InfoColumn.indexOf('CODEWARES');
        var indexQ = Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY');
        var table = '<table class="table table-bordered table-striped table-hover">';
        if (arrLength > 0) {
            table += '<thead>';
            table += '<tr>';
            table += '<th id="sort_by_brand">Код</th>';
            table += '<th id="sort_by_title">Товар</th>';
            table += '<th>Загальна кількість</th>';
            table += '</tr>';
            table += '</thead>';
            table += '<tbody id="Tbody">';

            data = naturalSort(data, 3);

            for (var i = 0; i < arrLength; i += 1) {
                if (Table.seeBrands && (Table.prevBrand !== data[i][3])) {
                    table += '<tr>';
                    table += '<td colspan="15" class="font-weight-bold">' + data[i][3] + '</td>';
                    table += '</tr>';
                }
                Table.prevBrand = data[i][3];

                var sumArr = [];
                var tempArr = [];

                tempArr = Table.Data.OrderDetail.Data.filter(el => el[indexCW] == data[i][0]);
                if (tempArr.length > 0) {
                    for (var j = 0; j < tempArr.length; j += 1) {
                        sumArr.push(tempArr[j][indexQ]);
                    }
                    sum = sumArr.reduce((accumulator, currentValue) => accumulator + currentValue);
                }
                table += '<tr id="' + data[i][0] + '" class="clickable-row ' + '" onclick="Table.tableWarehouse(this.id)">';
                table += '<td>' + data[i][0] + '</td>';
                table += '<td>' + data[i][1] + '</td>';
                table += '<td>' + sum + '</td>';

            }
            table += '</tbody>';
            table += '</table>';
            $('#tableWaresScroll').html(table);
        }
    },
    tableWarehouse: function (data) {

        $(Table.old_id).removeClass('table-warning').addClass('table-success');

        var new_id = "#" + data.toString();
        $(new_id).addClass('table-warning').removeClass('table-success');
        Table.old_id = new_id;

        var Arr = Table.Data.OrderDetail.Data;

        Table.WaresList = Arr.filter(id => id[0] == data);

        Table.RenderSettingsCokies();
    },
    getData: function (withRender, sendMail) {
        var type = $('#tableContent').attr("data-type");
        var obj = {};
        obj.data = {};
        var coockieHouse = Cookies.get('Warehouse');
        var Date_From = Cookies.get('Date_From');
        var Date_To = Cookies.get('Date_To');
        if (type === "orders") {
            obj.data.CodeWarehouse = $('#warehouse').val();
            if (typeof coockieHouse !== typeof undefined)
                obj.data.CodeWarehouse = coockieHouse;
            obj.data.CodeData = 5;
            obj.data.DateEnd = $('#date_to').val();
            if (typeof Date_To !== typeof undefined) {
                obj.data.DateEnd = Date_To;
                $('#date_to').val(Date_To);
            }

            obj.data.DateBegin = $('#date_from').val();
            if (typeof Date_From !== typeof undefined) {
                obj.data.DateBegin = Date_From;
                $('#date_from').val(Date_From);
            }

        } else {
            obj.data.CodeData = 12;
            var GetArr = Table.parseGetParams();

            if (GetArr.CodeGroupWares)
                obj.data.CodeGroupWares = REQUEST.getField('CodeGroupWares');
            if (GetArr.CodeGroupSupply)
                obj.data.CodeGroupSupply = REQUEST.getField('CodeGroupSupply');
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
                Table.Data = data;
                var arr = Table.Data.OrderDetail.Data;
                var j = Table.Data.OrderDetail.InfoColumn.indexOf("NUMBER_ORDER_SUPPLY");
                var ident = -1;
                for (var i = 0; i < Table.Data.OrderDetail.Data.length; i++) {
                    if (arr[i][j] != ident) {
                        Table.OrderList.push(arr[i][j]);
                        ident = arr[i][j];
                    }
                }

                for (var i = 0; i < Table.Data.OrderDetail.Data.length; i++) {
                    Table.Data.OrderDetail.Data[i].push(i);
                }
                Table.renderSettings = data.OrderField.Data;
                Table.RenderSettingsCokies();
                Table.SettingsRender();

                var Name = data.Name;
                $('#orderHeader').html(Name);
                Table.tableWares(data.Wares);

                if (typeof Table.Data.StateOrder !== typeof undefined) {
                    var arrLength = Table.Data.StateOrder.length;
                    Table.StateOrder = 0;
                    var options = '';
                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + Table.Data.StateOrder[i].CODE + '" ' + (Table.StateOrder === Table.Data.StateOrder[i].CODE ? 'selected="selected"' : '') + '>' + Table.Data.StateOrder[i].NAME + '</option>';
                    }
                    $('#stateOrder').html(options);
                   
                    $('#stateOrderWrapper').show();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    changeRndSetting: function () {
        var el = $(this);

        Table.renderSettings.__proto__.indexOfW = function (search) {
            for (var i = 0; i < this.length; i++) {
                if (parseInt(this[i][0]) == parseInt(search)) {
                    return i;
                }
            }
        }
        Table.renderSettings[Table.renderSettings.indexOfW(el.attr('data-field-code'))][1] = parseInt(el.val());
        Cookies.set('renderSettings', Table.renderSettings, { expires: 99999 });
        if (parseInt(el.attr('data-field-code')) == Table.Data.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1 && parseInt(el.val()) != 1) {
            var nextEl = $('.rnd_setting_control[data-field-code="' + (Table.Data.OrderDetail.InfoColumn.indexOf("PACK") + 1) + '"]:checked');
            if (nextEl.val() != 1) {
                $('.rnd_setting_control[data-field-code="' + (Table.Data.OrderDetail.InfoColumn.indexOf("PACK") + 1) + '"][value="1"]').change();
            }
        }
        if (parseInt(el.attr('data-field-code')) == Table.Data.OrderDetail.InfoColumn.indexOf("PACK") + 1 && parseInt(el.val()) != 1) {
            var prevEl = $('.rnd_setting_control[data-field-code="' + (Table.Data.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1) + '"]:checked');
            if (prevEl.val() != 1) {
                $('.rnd_setting_control[data-field-code="' + (Table.Data.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1) + '"][value="1"]').change();
            }
        }
        Table.RenderSettingsCokies();
    },
    changeWarehouseSetting: function () {

        var el = $(this);

        Table.warehouseSettings.__proto__.indexOfW = function (search) {
            for (var i = 0; i < this.length; i++) {
                if (parseInt(this[i][0]) == parseInt(search)) {
                    return i;
                }
            }
        }

        Table.warehouseSettings[Table.warehouseSettings.indexOfW(el.attr('data-field-code'))][1] = parseInt(el.val());
        Cookies.set('warehouseSettings', Table.warehouseSettings, { expires: 99999 });

        Table.RenderSettingsCokies();
    },
    SettingsRender: function () {
        var settings = '';
        var arrLength = Table.renderSettings.length;


        for (var i = 0; i < arrLength; i++) {
            settings += '<tr>';
            settings += '<td>' + Table.Data.OrderField.Data[Table.renderSettings[i][Table.Data.OrderField.InfoColumn.indexOf("CODE")] - 1][Table.Data.OrderField.InfoColumn.indexOf("TRANSLATE")] + '</td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] + '" value="1"  ' + (Table.renderSettings[i][1] == 1 ? 'checked' : '') + '/></td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] + '" value="2"  ' + (Table.renderSettings[i][1] == 2 ? 'checked' : '') + '/></td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] + '" value="0"  ' + (Table.renderSettings[i][1] == 0 ? 'checked' : '') + '/></td>';
            settings += '</tr>';
        }
        $('#render_settings_bar tbody').html(settings);
    },

    //редагувати для верхньої таблиці
    orderResort: function () {
        if (Table.sortByColumn != 3) {
            Table.seeBrands = false;
            Table.Data.Wares = naturalSort(Table.Data.Wares, Table.sortByColumn);
        } else {
            Table.seeBrands = true;
            Table.Data.Wares = naturalSort(Table.Data.Wares, Table.sortByColumn);
        }
        Table.tableWares(Table.Data.Wares);
    },
    getDataFromFile: function () {
        Table.JSON = Table1;
        console.log(Table.JSON);
    },
    setJSON: function (json) {
        Table.JSON = json;
    },
    RenderSettingsCokies: function () {

        var renderSettings = Cookies.get('renderSettings');
        /*
        Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "PPACK", "заказ упаковок", "заказ уп.", 1, 3, "", ""]);
        Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "LPACK", "логістична к-сть пакування", "логістична к-сть п.", 1, 3, "", ""]);
        */
        if (typeof renderSettings == typeof undefined || JSON.parse(renderSettings).length != Table.Data.OrderField.Data.length) {
            if (typeof Table.Data.OrderField != typeof undefined) {
                var arrlength = Table.Data.OrderField.Data.length;
                var arr = Table.Data.OrderField.Data;
                renderSettings = [];
                for (var i = 0; i < arrlength; i++) {
                    renderSettings.push([arr[i][Table.Data.OrderField.InfoColumn.indexOf("CODE")], arr[i][Table.Data.OrderField.InfoColumn.indexOf("STATE")]]);
                }
                Cookies.set('renderSettings', renderSettings, { expires: 99999 });
                renderSettings = JSON.stringify(renderSettings);
            }
        }
        Table.renderSettings = JSON.parse(renderSettings);
        Table.SettingsRender();
        Table.renderDesctopOrder();
    },
    WarehouseCokies: function () {

        var warehouseSettings = Cookies.get('warehouseSettings');
        Table.JSON_warehouse = Table.Warehouse;
        /*
        Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "PPACK", "заказ упаковок", "заказ уп.", 1, 3, "", ""]);
        Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "LPACK", "логістична к-сть пакування", "логістична к-сть п.", 1, 3, "", ""]);
        */
        if (typeof warehouseSettings == typeof undefined || JSON.parse(warehouseSettings).length != Table.JSON_warehouse.length) {
            if (typeof Table.JSON_warehouse != typeof undefined) {
                var arrlength = Table.JSON_warehouse.length;
                var arr = Table.JSON_warehouse;
                warehouseSettings = [];
                for (var i = 0; i < arrlength; i++) {
                    warehouseSettings.push([arr[i][0], 1]);
                }
                Cookies.set('warehouseSettings', warehouseSettings, { expires: 99999 });
                warehouseSettings = JSON.stringify(warehouseSettings);
            }
        }
        Table.warehouseSettings = JSON.parse(warehouseSettings);

    },
    sortByState: function () {
        var state = parseInt($('#state').val());
        Table.JSON = JSON.parse(JSON.stringify(Table.OriginalTableJSON));
        console.log();
        if (state !== -1) {
            var newArr = [];
            for (var i = 0; i < Table.JSON.OrderDetail.Data.length; i++) {
                if (Table.JSON.OrderDetail.Data[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')] === state)
                    newArr.push(Table.JSON.OrderDetail.Data[i]);
            }
            Table.JSON.OrderDetail.Data = newArr;
        }
        Table.RenderSettingsCokies();
    },
    sortByLogistic: function () {
        var isLogistic = Cookies.get('isLogistick');
        if (typeof isLogistic == typeof undefined) {
            isLogistic = false;
            $('#logistic').prop('checked', false);
        } else {
            isLogistic = true;
            $('#logistic').prop('checked', true);
        }
        Table.JSON = JSON.parse(JSON.stringify(Table.OriginalTableJSON));
        if (isLogistic) {
            var newArr = [];
            for (var i = 0; i < Table.JSON.OrderDetail.Data.length; i++) {
                if (Table.JSON.OrderDetail.Data[i][Table.JSON.OrderDetail.InfoColumn.indexOf('ISLC')] == 1)
                    newArr.push(Table.JSON.OrderDetail.Data[i]);
            }
            Table.JSON.OrderDetail.Data = newArr;
        } else {
            var newArr = [];
            for (var i = 0; i < Table.JSON.OrderDetail.Data.length; i++) {
                if (Table.JSON.OrderDetail.Data[i][Table.JSON.OrderDetail.InfoColumn.indexOf('ISLC')] == 0)
                    newArr.push(Table.JSON.OrderDetail.Data[i]);
            }
            Table.JSON.OrderDetail.Data = newArr;
        }
        Table.RenderSettingsCokies();
    },
    renderDesctopOrder: function () {
        var title = 'день';

        if (Table.sort != 'days') {
            title = 'тиждень';
        }
        var arr = this.WaresList;
        var table = '<table class="table table-bordered table-striped table-responsive detail" style="margin-top:15px">';
        if (Table.WaresList.length>0) {
            table += '<thead>';
            table += '<tr>';

            Table.renderSettings.colspan = 0;
            for (var i = 0; i < Table.renderSettings.length; i++) {
                if (Table.renderSettings[i][1] == 1) {
                    Table.renderSettings.colspan++;
                    switch (i) {
                        case Table.Data.OrderDetail.InfoColumn.indexOf('CODEWARES'):
                            table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                            table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                            if (Table.sort == 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                            if (Table.sort == 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                            if (Table.sort == 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                            if (Table.sort == 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                            if (Table.sort == 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                            if (Table.sort != 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                            if (Table.sort != 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                            if (Table.sort != 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                            if (Table.sort != 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                            if (Table.sort != 'days')
                                table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                            table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            table += '<th>заказ уп.</th>';
                            break;
                        case Table.Data.OrderDetail.InfoColumn.indexOf('PACK'):
                            table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            table += '<th>логістична к-сть п.</th>';
                            break;
                        default:
                            table += '<th>' + Table.Data.OrderField.Data[i][3] + '</th>';
                            break;
                    }
                }
            }

            table += '</tr>';
            table += '</thead>';
            table += '<tbody>';

            table += Table.renderRawDsc(this.WaresList.length, arr, title);

            table += '</tbody>';
            table += '</table>';

            $('#tableContent').html(table);
        }
        $('#tableContent').after('<div id="info" class="desctopInfo bg-primary"><div class="container"><div></div>');
    },
    renderRawDsc: function (arrLength, arr, title) {
        var table = '';
        var isEdit = true;
        for (var i = 0; i < arrLength; i += 1) {            
            
            table += '<tr rowIndex="' + arr[i][arr[i].length - 1] + '" class="dataRow';
            if (arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('COLOR_WARES')] != "") {
                switch (arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('COLOR_WARES')]) {
                    case 'y':
                        table += ' table-warning';
                        break;
                    case 'r':
                        table += ' table-danger';
                        break;
                    case 'g':
                        table += ' table-success';
                        break;
                }
            }
            table += '">';

            var ind = Table.warehouseSettings.find(function (element) { return element[0] == arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('CODE_WAREHOUSE')]; });
            if (ind[1] == 1) {
                for (var j = 0; j < Table.renderSettings.length; j++) {
                    if (Table.renderSettings[j][1] == 1) {
                        var classes = [];

                        if (Table.Data.OrderField.Data[j][6] == "b") {
                            classes.push("font-weight-bold");
                        }

                        switch (Table.Data.OrderField.Data[j][7]) {
                            case "i":
                                classes.push("text-info");
                                break;
                            case "w":
                                classes.push("text-warning");
                                break;
                            case "d":
                                classes.push("text-danger");
                                break;
                            case "s":
                                classes.push("text-success");
                                break;
                        }
                        switch (j) {
                            case Table.Data.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                                var temp = Table.Data.Warehouse.find(function (element) { return element[0] == arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('CODE_WAREHOUSE')]; });
                                table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + temp[1] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                                if (Table.sort == 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                                if (Table.sort == 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                                if (Table.sort == 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                                if (Table.sort == 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                                if (Table.sort == 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                                if (Table.sort != 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                                if (Table.sort != 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                                if (Table.sort != 'days')
                                    table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                                if (Table.sort != 'days')
                                    table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                                if (Table.sort != 'days')
                                    table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY'):
                                classes.push('orderCount');
                                table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '><input ' + (!isEdit ? 'readonly' : '') + '  class="form-control quantyty" data-field-type="quantyty" type="number" value="' + arr[i][j] + '"' + (arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('STATE_ORDER')] == 0 ? '' : ' disabled') + '/></td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                                table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control pack" data-field-type="pack" type="number" value="' + (parseFloat(arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')])) + '"' + (arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('STATE_ORDER')] == 0 ? '' : ' disabled') + ' /></td>';
                                break;
                            case Table.Data.OrderDetail.InfoColumn.indexOf('PACK'):
                                table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control logistic" data-field-type="logistic" type="number" value="' + (parseFloat(arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('PACK')])) + '"' + (arr[i][Table.Data.OrderDetail.InfoColumn.indexOf('STATE_ORDER')] == 0 ? '' : ' disabled') + ' /></td>';
                                break;
                            default:
                                table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                                break;
                        }
                    }
                }

            }
            table += '</tr>';
        }

        return table;
    },
    packCalculate: function (val) {
        var maxedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK')];

        var u = parseFloat(val) * parseFloat(ppack);

        if (!maxedit == '') {
            if (u > maxedit) {
                u = old;
            }
        }

        if (!minedit == '') {
            if (u < minedit) {
                u = old;
            }
        }
        u = parseFloat(u).toFixed(3);
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val(u)

        p = parseFloat(u) / parseFloat(ppack);
        l = parseFloat(u) / parseFloat(lpack);
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.pack').val(parseFloat(p.toFixed(3)));
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.logistic').val(parseFloat(l.toFixed(3)));
        Table.Quantity = u;
    },
    logisticCalculate: function (val) {
        var maxedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK')];

        var u = parseFloat(val) * parseFloat(lpack);

        if (!maxedit == '') {
            if (u > maxedit) {
                u = old;
            }
        }

        if (!minedit == '') {
            if (u < minedit) {
                u = old;
            }
        }

        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val(u);

        p = parseFloat(u) / parseFloat(ppack);
        l = parseFloat(u) / parseFloat(lpack);
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.pack').val(parseFloat(p.toFixed(3)));
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.logistic').val(parseFloat(l.toFixed(3)));
        Table.Quantity = u;
    },
    quantytyCalculate: function (val) {
        var maxedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];
        var unit = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('UNIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.Data.OrderDetail.Data[this.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('PACK')];

        var u = parseFloat(val);

        if (lpack != 1)
            u = Math.round(parseFloat(val) / parseFloat(lpack)) * parseFloat(lpack);

        if (val != u) {
            $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').addClass('text-danger bg-warning font-weight-bold');
        } else {
            $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').removeClass('text-danger bg-warning font-weight-bold');
        }

        if (!maxedit == '') {
            if (u > maxedit) {
                u = old;
            }
        }

        if (!minedit == '') {
            if (u < minedit) {
                u = old;
            }
        }
        if (unit == "шт") {
            u = u.toFixed(0);
        }
        else {
            u = parseFloat(u.toFixed(3));
        }
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val(u);

        p = parseFloat(u) / parseFloat(ppack);
        l = parseFloat(u) / parseFloat(lpack);
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.pack').val(parseFloat(p.toFixed(2)));
        $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.logistic').val(parseFloat(l.toFixed(2)));
        Table.Quantity = u;
    },
    onFocus: function () {
        var el = $(this);
        if (el.val() != '' && !el.prop('readonly'))
            el.attr('data-old', el.val());
        var row = el.closest('.dataRow');
        row.addClass('table-info');
        var rowIndex = parseInt(row.attr('rowIndex'));
        Table.globalCurrentRow = rowIndex;
        var infoContent = '<div class="row"><div class="col-12">';
        infoContent += '<span>';

        var contenrRows = [];
        for (var i = 0; i < Table.renderSettings.length; i++) {
            if (Table.renderSettings[i][1] == 2) {
                contenrRows.push(Table.Data.OrderField.Data[i][3] + ':' + Table.Data.OrderDetail.Data[rowIndex][i]);
            }
        }
        infoContent += contenrRows.join(', ');
        infoContent += '</span>';
        infoContent += '</div></div>';
        if (!el.prop('readonly'))
            el.select();
        $('#info .container').html(infoContent);
        $('#info').css('display', 'block');
    },
    onBlur: function () {
        var el = $(this);
        var row = el.closest('.dataRow');
        row.removeClass('table-info');
        if (el.attr('data-old') != el.val() && el.val() != '') {
            row.attr('data-is-change', 'true');
            var data = Table.Data.OrderDetail.Data;
            Table.ArrChange[Table.globalCurrentRow] =[data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')],data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('CODEWARES')],data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')]];

        } else {
            el.val(el.attr('data-old'));
        }
        $('#info').css('display', 'none');
        Table.globalCurrentRow = -1;
    },
    onChange: function () {
        if (Table.globalCurrentRow == -1) return;
        var el = $(this);
        if (el.hasClass('pack')) {
            Table.packCalculate(el.val());
            Table.Data.OrderDetail.Data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')] = parseFloat(Table.Quantity);
        }
        if (el.hasClass('logistic')) {
            Table.logisticCalculate(el.val());
            Table.Data.OrderDetail.Data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')] = parseFloat(Table.Quantity);
        }
        if (el.hasClass('quantyty')) {
            Table.quantytyCalculate(el.val());
            Table.Data.OrderDetail.Data[Table.globalCurrentRow][Table.Data.OrderDetail.InfoColumn.indexOf('QUANTITY')] = parseFloat(Table.Quantity);
        }
        Table.tableWares(Table.Data.Wares);
    },
    changeStateOrder: function () {
        if ($('#stateOrder').val() == 1 && $('#status').val() == -1) {
            $('#status').val('08');
        }
        if ($('#stateOrder').val() == 0 && $('#status').val() != -1) {
            $('#status').val(-1);
        }
    },
    changeStateStatus: function () {
        if ($('#stateOrder').val() == 0 && $('#status').val() != -1) {
            $('#stateOrder').val(1);
        }
        if ($('#stateOrder option[value="0"]').length > 0 && $('#stateOrder').val() != 0 && $('#status').val() == -1) {
            $('#stateOrder').val(0);
        }
    },
    printForm: function () {
        var table = $('#tableContent');
        table.find('td[colspan="15"]').parent('tr').remove();
        table.find('input').each(function () {
            var el = $(this);
            el.after(el.val());
            el.remove();
        });
        var html = '<div id="page"><table class="info"><tbody><tr><td><b>№' + Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY + '</b>, ' + Table.JSON.OrderHead.NAME + '</td></tr></tbody></table>';
        html += table.html() + '</div>';
        printData(html);
    },
    printDoc: function () {
        var html = Table.renderOrderDoc();
        printData(html);
    },
    renderOrderDoc: function () {
        var FullAdres = Table.JSON.OrderHead.ADDRESS_WAREHOUSE_THROUGH;
        var FullName = Table.JSON.OrderHead.NAME_WAREHOUSE_THROUGH + '.' + Table.JSON.OrderHead.NAME_WAREHOUSE;
        if (Table.JSON.OrderHead.NAME_WAREHOUSE_THROUGH.length == 0) {
            FullAdres = Table.JSON.OrderHead.ADDRESS_WAREHOUSE;
            FullName = Table.JSON.OrderHead.NAME_WAREHOUSE;
        }
        var totalCount = 0;
        var totalSum = 0.0;
        var html = '';
        html += Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY + '<div id="page">';
        html += '<u>Компанія</u>&nbsp;&nbsp;&nbsp;' + Table.JSON.OrderHead.NAME;
        html += '<h3>Замовлення на придбання товару №&nbsp;<strong> ' + Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY + ' </strong><br>від&nbsp;<strong>' + Table.JSON.OrderHead.DELIVERY + '</strong></h3>';
        html += '<table class="gtm info">';
        html += '<tbody><tr>';
        html += '<td class="gtm caption" width="120"><b>Постачальник:</b></td>';
        html += '<td>' + Table.JSON.OrderHead.NAME + '</td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>№ договору:</b></td>';
        html += '<td></td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>Телефон:</b></td>';
        html += '<td></td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>Факс:</b></td>';
        html += '<td></td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>Дата поставки:</b></td>';
        html += '<td>' + Table.JSON.OrderHead.DELIVERY + ' ' + Table.JSON.OrderHead.TIME + ':' + Table.JSON.OrderHead.TIME_MI + '</td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>Склад постачання:</b></td>';
        html += '<td>' + FullName + '</td>';
        html += '</tr><tr>';
        html += '</tr><tr>';
        html += '<td class="gtm caption"><b>Адреса постачання:</b></td>';
        html += '<td>' + FullAdres + '</td>';
        html += '</tr><tr>';
        html += '</tr></tbody></table>';
        html += '<table class="gtm detail" style="margin-top:15px">';
        html += '<thead>';
        html += '<tr><th width="20">№ п/п</th>';
        html += '<th width="50">Код</th>';
        html += '<th width="100">Штрих-код</th>';
        html += '<th>Найменування</th>';
        html += '<th width="45">Кіл-сть</th>';
        html += '<th width="40">Од.<br> вим.</th>';
        html += '<th width="60">Ціна<br> з ПДВ</th>';
        html += '<th width="60">Сумма<br> з ПДВ</th>';
        html += '</tr></thead>';
        html += '<tbody>';
        var dataArr = Table.JSON.OrderDetail.Data;
        var arrLength = dataArr.length;
        Table.seeBrands = true;
        Table.prevBrand = '';
        for (var i = 0; i < arrLength; i++) {
            if (dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')] > 0) {
                if (Table.seeBrands && (Table.prevBrand !== dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')])) {
                    html += '<tr>';
                    html += '<td colspan="8" class="gtm font-weight-bold">' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')] + '</td>';
                    html += '</tr>';
                }
                Table.prevBrand = dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')];
                html += '<tr>';
                html += '<td>' + (i + 1) + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('CODEWARES')] + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('TOUCH_CODE')] + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES')] + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')] + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('UNIT')] + '</td>';
                html += '<td>' + dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PRICE')] + '</td>';
                html += '<td>' + (parseFloat(dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PRICE')]) * parseFloat(dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')])).toFixed(2) + '</td>';
                html += '</tr>';
                totalCount += parseInt(dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]);
                totalSum += parseFloat(dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PRICE')]) * parseFloat(dataArr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]);
            }
        }
        html += '</tbody>';
        html += '</table>';
        html += '<table class="gtm summary">';
        html += '<tbody><tr>';
        html += '<td>Всього кіл-сть:</td>';
        html += '<td width="45">' + totalCount + '</td>';
        html += '<td width="40">&nbsp;</td>';
        html += '<td width="60">&nbsp;</td>';
        html += '<td width="60">&nbsp;</td>';
        html += '</tr>';
        html += '<tr height="5">';
        html += '<td colspan="5"></td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td colspan="4"><b>Сумма без ПДВ (грн.):</b></td>';
        html += '<td><b>' + totalSum.toFixed(2) + '</b></td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td colspan="4"><b>ПДВ (грн.):</b></td>';
        html += '<td><b>0</b></td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td colspan="4"><b>Всього (грн.):</b></td>';
        html += '<td><b>' + totalSum.toFixed(2) + '</b></td>';
        html += '</tr>';
        html += '</tbody></table>';
        html += '<table style="margin-top:25px">';
        html += '<tbody><tr>';
        html += '<td width="30">&nbsp;</td>';
        html += '<td width="350">Покупець:  ____________________</td>';
        html += '<td width="350">Постачальник:  ____________________</td>';
        html += '<td>&nbsp;</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td width="30">&nbsp;</td>';
        html += '<td width="350">Підготував: ' + Table.JSON.OrderHead.CURUSER + '</td>';
        html += '<td></td>';
        html += '<td></td>';
        html += '</tr>';
        html += '</tbody></table>';
        return html;
    },
    startSendMail: function () {
        $('#send_mail_addr').val(Table.JSON.OrderHead.GROUP_EMAIL);
        $('#SendMailModal').modal('show');
    },
    sendMail: function (save) {
        var obj = {};
        var data = {};
        var html = '<body>';
        html += '<style> body,table{font:12px Helvetica}@media screen{#page{width:800px}}@media print{#page{width:100%}}*{margin:0;padding:0}body{margin:10px}td.right{text-align:right}td.left{text-align:left}td.center{text-align:center}table{width:100%}td.caption{text-align:right;padding-right:8px}table.detail,table.detail td,table.detail th{border:1px solid #000;border-collapse:collapse;padding:2px 3px;font-size:11px}table.summary,table.summary td{border:1px solid #fff;border-collapse:collapse;padding:3px;text-align:right}h3,h4{display:block;text-align:center}h4{font:14px Tahoma;font-weight:700;margin-top:5px;margin-bottom:5px}h3{font:18px Tahoma;font-weight:700;margin-top:10px;margin-bottom:25px}strong{font:16px Tahoma}';
        html += '</style>';
        html += Table.renderOrderDoc() + '</body>';
        data.CodeData = 9;
        data.NumberOrder = Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY;
        data.EMail = $('#send_mail_addr').val();
        data.Boby = html;

        obj.data = JSON.stringify(data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (!save) {
                    if (data.State === 0) {
                        alert('Дані успішно відправлено.');
                        $('#SendMailModal').modal('hide');
                    } else {
                        alert(data.TextError);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    saveOrder: function () {

        var rows = $('tr.dataRow[data-is-change="true"]');
        var items = [];
        var item = [];
        var num_items = [];
        var Data = {};
        var date = new Date();
        date.setDate(date.getDate() + 1);

        Table.ArrChange.forEach(function (el) {
            items.push(el);
        });

        Data.DATA = items;
        Data.CodeData = 13;
        Data.StateOrder = 0;
        if ($('#stateOrderWrapper').is(':visible')) {
            Data.StateOrder = $('#stateOrder').val();
            Data.Orders = Table.OrderList;
        }
        var d = DateHelper.formatJsDate($('#delivery_date').val());

        Data.DateDelivery = d.getFullYear() + "-" + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + " " + $("#status").val() + ":00";

        if ($("#status").val() == -1) {
            delete Data.DateDelivery;
        }

        //Data.data = JSON.stringify(Data.data);

        var obj = {};
        obj.data = JSON.stringify(Data);

        $('#tableContent').html('<div class="loader"></div>');
        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (data.TextError === "Ok") {
                    alert('Дані успішно збережено.');

                    console.log(parseInt($('#stateOrder').val()));
                    if (parseInt($('#stateOrder').val()) == -1) {
                        location.href = '/znp/';
                        return;
                    }
                    Table.init();
                    
                } else {
                    alert(data.TextError);
                    Table.getData(true);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
                Table.getData(true);
            }
        });
    },
    changeLogistic: function () {
        if ($('#logistic').prop('checked')) {
            Cookies.set('isLogistick', true);
        } else {
            Cookies.remove('isLogistick');
        }

        Table.sortByLogistic();
    },
    controlsInit: function () {
        $(document).on('focus', '#tableContent input', Table.onFocus);
        $(document).on('change', '#tableContent input', Table.onChange);
        $(document).on('blur', '#tableContent input', Table.onBlur);
        $('#date_from').change(function () {
            Cookies.set('Date_From', $(this).val());
            Table.getData(true);
        });
        $('#date_to').change(function () {
            Cookies.set('Date_To', $(this).val());
            Table.getData(true);
        });
        $('#save_order').click(Table.saveOrder);
        $('#tableWaresScroll').on('click', '#sort_by_title', function () {
            Table.sortByColumn = 1;
            Table.orderResort();
        });
        $('#tableWaresScroll').on('click', '#sort_by_brand', function () {
            Table.sortByColumn = 3;
            Table.orderResort();
        });
        $('#render_settings_bar').on('change', '.rnd_setting_control', Table.changeRndSetting);
        $('#warehouse_settings_bar').on('change', '.rnd_setting_control', Table.changeWarehouseSetting);
        $('#state').change(function () {
            Cookies.set('Sort_State', $(this).val());
            Table.sortByState();
        });
        $('#render_settings, .close_render_settings').click(function () {
            $('#render_settings_bar').toggle(300);
        });
        $('#warehouse_settings, .close_warehouse_settings').click(function () {
            $('#warehouse_settings_bar').toggle(300);
        });
        $('#filter_settings').click(function () {
            if ($('#TopMenu').hasClass('show')) {
                $('#filters').toggleClass('hidden-sm-down');
            }
            $('#TopMenu').collapse('hide');
            $('#filters').toggleClass('hidden-sm-down');
        });
        $('#logistic').change(Table.changeLogistic);
        $('#stateOrder').change(Table.changeStateOrder);
        $('#status').change(Table.changeStateStatus);
        $('#print_form').click(Table.printForm);
        $('#print_doc').click(Table.printDoc);
        $('#send_mail_start').click(Table.startSendMail);
        $('#send_mail').click(function () { Table.sendMail(false); });
        $('#orders_log').click(function () {
            location.href = "index.html?last_order=" + Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY;
        });
    },
    init: function () {
        if (window.isLogin) {
            this.getData(true);
            this.getWarhouses();
        }
        this.controlsInit();
    },
    getWarhouses: function () {
        var data = {};
        data.CodeData = 5;

        var obj = {};
        obj.data = JSON.stringify(data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = data;
                var arrLength = result.Warehouse.Data.length;
                var settings = '';

                Table.Warehouse = result.Warehouse.Data;

                Table.WarehouseCokies();

                for (var i = 0; i < arrLength; i++) {
                    settings += '<tr>';
                    settings += '<td>' + result.Warehouse.Data[i][1] + '</td>';

                    settings += '<td><input data-field-code="' + Table.Warehouse[i][0] + '" class="rnd_setting_control" type="radio" name="warehouse_setting_' + Table.warehouseSettings[i][0] + '" value="1"  ' + (Table.warehouseSettings[i][1] == 1 ? 'checked' : '') + '/></td>';
                    settings += '<td><input data-field-code="' + Table.Warehouse[i][0] + '" class="rnd_setting_control" type="radio" name="warehouse_setting_' + Table.warehouseSettings[i][0] + '" value="0"  ' + (Table.warehouseSettings[i][1] == 0 ? 'checked' : '') + '/></td>';

                    //     settings += '<td><input data-field-code="' + Table.warehouseSettings[i][0] + '" class="rnd_setting_control" type="radio" name="warehouse_setting_' + Table.warehouseSettings[i][0] + '" value="0"  ' + (Table.warehouseSettings[i][1] == 0 ? 'checked' : '') + '/></td>';
                    //     settings += '<td><input data-field-code="' + Table.warehouseSettings[i][0] + '" class="rnd_setting_control" type="radio" name="warehouse_setting_' + Table.warehouseSettings[i][0] + '" value="1"  ' + (Table.warehouseSettings[i][1] == 1 ? 'checked' : '') + '/></td>';

                    settings += '</tr>';
                }

                $('#warehouse_settings_bar tbody').html(settings);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
}

$(document).ready(function () {
    Table.init();
});