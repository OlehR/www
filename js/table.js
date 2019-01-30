var Table = {
    StateOrder: -1,
    globalCurrentRow: -1,
    JSON: {},
    OriginalTableJSON: "",
    sortByColumn: 0,
    sort: 'weeks',
    seeBrands: true,
    prevBrand: '',
    isSuppplier: false,
    renderSettings: [],
    getData: function (withRender, sendMail) {
        var type = $('#tableContent').attr("data-type");
        var data = {};
        var coockieHouse = Cookies.get('Warehouse');
        var Date_From = Cookies.get('Date_From');
        var Date_To = Cookies.get('Date_To');
        if (type == "orders") {
            data.warehouse = $('#warehouse').val();
            if (typeof coockieHouse != typeof undefined)
                data.warehouse = coockieHouse;
            data.CodeData = 5;
            data.date_to = $('#date_to').val();
            if (typeof Date_To != typeof undefined) {
                data.date_to = Date_To;
                $('#date_to').val(Date_To);
            }
                
            data.date_from = $('#date_from').val();
            if (typeof Date_From != typeof undefined) {
                data.date_from = Date_From;
                $('#date_from').val(Date_From);
            }
                
        } else {
            data.CodeData = 6;
            data.NumberOrder = REQUEST.getField('order');
        }

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Table.JSON = JSON.parse(data);
                Table.sortByColumn = Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND');
                Table.OriginalTableJSON = data;
                if ((typeof Table.JSON.OrderHead != typeof undefined)) {
                    var d = DateHelper.formatJsDate(Table.JSON.OrderHead.DELIVERY);
                    $('#status').attr('is-change', 'false');
                    if (Table.JSON.OrderHead.TIME == "00") {
                        $('#status').val("-1");
                    } else {
                        $('#status').val(Table.JSON.OrderHead.TIME);
                    }
                    $('#status').attr('is-change', 'true');
                    $('#delivery_date').attr('is-change', 'false');
                    $('#delivery_date').datepicker("update", d);
                    $('#delivery_date').attr('is-change', 'true');
                    if (Table.JSON.OrderHead.STATE_ORDER == 1) { 
                        $('#delivery_date').prop('disabled', false);
                    }
                    if (Table.JSON.OrderHead.STATE_ORDER != 0) {
                        $('#print_doc').css('display','block');
                    }
                }
                if (typeof Table.JSON.Is_Supplier != typeof undefined) {
                    if (Table.JSON.Is_Supplier == 1) {
                        Table.isSuppplier = true;
                        $('#warehouse, #logistic').hide();
                    } else {
                        Table.isSuppplier = false;
                        $('#warehouse, #logistic').show();
                    }
                }
                if (typeof Table.JSON.StateOrder != typeof undefined) {
                    var arrLength = Table.JSON.StateOrder.length;
                    Table.StateOrder = Table.JSON.OrderHead.STATE_ORDER;
                    var options = '';
                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + Table.JSON.StateOrder[i].CODE + '" ' + (Table.JSON.OrderHead.STATE_ORDER === Table.JSON.StateOrder[i].CODE ? 'selected="selected"' : '') + '>' + Table.JSON.StateOrder[i].NAME + '</option>';
                    }
                    $('#stateOrder').html(options);
                    if (Table.JSON.OrderHead.STATE_ORDER != 0) {
                        $('#send_mail_start').css('display', 'block');
                    }
                    $('#stateOrderWrapper').show();
                }
                if (typeof Table.JSON.Warehouse != typeof undefined) {
                    var arrLength = Table.JSON.Warehouse.Data.length;
                    var warehouse = Cookies.get('Warehouse');
                    var wareControl = $('#warehouse');
                    wareControl.html();
                    var options = '';
                    Table.JSON.Warehouse.Data.__proto__.indexOfW = function (search) {
                        for (var i = 0; i < this.length; i++) {
                            var index = this[i].indexOf(search);
                            if (index > -1) {
                                return [i, index];
                            }
                        }
                    };
                    if (typeof warehouse == typeof undefined || Table.JSON.Warehouse.Data.indexOfW(warehouse) == -1) {
                        options = '<option value="-1">-Не вибрано-</option>';
                        warehouse = -1;
                    }
                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + Table.JSON.Warehouse.Data[i][0] + '">' + Table.JSON.Warehouse.Data[i][1] + '</option>'
                    }
                    wareControl.html(options);
                    wareControl.val(warehouse);
                }
                if (Table.sortByColumn != Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')) {
                    Table.seeBrands = false;
                    Table.JSON.OrderDetail.Data = naturalSort(Table.JSON.OrderDetail.Data, Table.sortByColumn);
                } else {
                    Table.seeBrands = true;
                }
                console.log(Table.JSON);
                var sortState = Cookies.get('Sort_State');
                if (typeof sortState != typeof undefined && type != 'order') {
                    $('#state').val(sortState);
                    Table.sortByState();
                    return;
                }
                Table.JSON.OrderDetail.Data.__proto__.indexOfType = function (search) {
                    for (var i = 0; i < this.length; i++) {
                        var type = this[i][Table.JSON.OrderDetail.InfoColumn.indexOf('TYPE')] === search;
                        if (type) {
                            return true;
                        }
                        this[i][this[i].length + 1] = i;
                    }
                    return false;
                };
                Table.JSON.OrderDetail.Data.__proto__.GetByType = function (search, aprove) {
                    var result = [];
                    for (var i = 0; i < this.length; i++) {
                        var type = this[i][Table.JSON.OrderDetail.InfoColumn.indexOf('TYPE')] === search;
                        if ((typeof aprove != typeof undefined) && !type) {
                            type = this[i][Table.JSON.OrderDetail.InfoColumn.indexOf('TYPE')] === aprove;
                        }
                        if (type) {
                            this[i][this[i].length + 1] = i;
                            result.push(this[i]);
                        }
                    }
                    return result;
                };
                if (sendMail) {
                    Table.sendMail(true);
                }
                if (type == "orders")
                Table.sortByLogistic();
                if (withRender) {
                    Table.renderTable();
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
        if (parseInt(el.attr('data-field-code')) == Table.JSON.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1 && parseInt(el.val()) != 1) {
            var nextEl = $('.rnd_setting_control[data-field-code="' + (Table.JSON.OrderDetail.InfoColumn.indexOf("PACK") + 1) + '"]:checked');
            if (nextEl.val() != 1) {
                $('.rnd_setting_control[data-field-code="' + (Table.JSON.OrderDetail.InfoColumn.indexOf("PACK") + 1) + '"][value="1"]').change();
            }
        }
        if (parseInt(el.attr('data-field-code')) == Table.JSON.OrderDetail.InfoColumn.indexOf("PACK") + 1 && parseInt(el.val()) != 1) {
            var prevEl = $('.rnd_setting_control[data-field-code="' + (Table.JSON.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1) + '"]:checked');
            if (prevEl.val() != 1) {
                $('.rnd_setting_control[data-field-code="' + (Table.JSON.OrderDetail.InfoColumn.indexOf("PACK_SUPPLY") + 1) + '"][value="1"]').change();
            }
        }
        Table.renderTable();
    },
    SettingsRender: function () {
        var settings = '';
        var arrLength = Table.renderSettings.length;
        for (var i = 0; i < arrLength; i++) {
            settings += '<tr>';
            settings += '<td>' + Table.JSON.OrderField.Data[Table.renderSettings[i][Table.JSON.OrderField.InfoColumn.indexOf("CODE")] - 1][Table.JSON.OrderField.InfoColumn.indexOf("TRANSLATE")] + '</td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] +'" value="1"  ' + (Table.renderSettings[i][1] == 1 ? 'checked' : '') + '/></td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] +'" value="2"  ' + (Table.renderSettings[i][1] == 2 ? 'checked' : '') + '/></td>';
            settings += '<td><input data-field-code="' + Table.renderSettings[i][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + Table.renderSettings[i][0] +'" value="0"  ' + (Table.renderSettings[i][1] == 0 ? 'checked' : '') + '/></td>';
            settings += '</tr>';
        }
        $('#render_settings_bar tbody').html(settings);
    },
    orderResort: function () {
        if (Table.sortByColumn != Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')) {
            Table.seeBrands = false;
            Table.JSON.OrderDetail.Data = naturalSort(Table.JSON.OrderDetail.Data, Table.sortByColumn);
        } else {
            Table.seeBrands = true;
            Table.JSON.OrderDetail.Data = naturalSort(Table.JSON.OrderDetail.Data, Table.sortByColumn);
        }
        Table.renderTable();
    },
    getDataFromFile: function () {
        Table.JSON = Table1;
        console.log(Table.JSON);
    },
    setJSON: function (json) {
        Table.JSON = json;
    },
    renderTable: function () {
        var type = $('#tableContent').attr("data-type");
        if (type == "orders") {
            if (window.innerWidth < 960) {
                Table.renderMobileOrders();
            } else {
                Table.renderDesctopOrders();
            }
            if (typeof REQUEST.getField('last_order') != typeof undefined) {
                $("html, body").animate({
                    scrollTop: ($('#' + REQUEST.getField('last_order')).offset().top - 110) + "px"
                }, {
                    duration: 500,
                    easing: "swing"
                });
            }
        } else {

            var renderSettings = Cookies.get('renderSettings');
            Table.JSON.OrderField = JSON.parse(Table.OriginalTableJSON).OrderField;
            /*
            Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "PPACK", "заказ упаковок", "заказ уп.", 1, 3, "", ""]);
            Table.JSON.OrderField.Data.push([Table.JSON.OrderField.Data.length + 1, "LPACK", "логістична к-сть пакування", "логістична к-сть п.", 1, 3, "", ""]);
            */
            if (typeof renderSettings == typeof undefined || JSON.parse(renderSettings).length != Table.JSON.OrderField.Data.length) {
                if (typeof Table.JSON.OrderField != typeof undefined) {
                    var arrlength = Table.JSON.OrderField.Data.length;
                    var arr = Table.JSON.OrderField.Data;
                    renderSettings = [];
                    for (var i = 0; i < arrlength; i++) {
                        renderSettings.push([arr[i][Table.JSON.OrderField.InfoColumn.indexOf("CODE")], arr[i][Table.JSON.OrderField.InfoColumn.indexOf("STATE")]]);
                    }
                    Cookies.set('renderSettings', renderSettings, { expires: 99999 });
                    renderSettings = JSON.stringify(renderSettings);
                }
            }
            Table.renderSettings = JSON.parse(renderSettings);
            Table.SettingsRender();
            if (window.innerWidth < 960) {
                Table.renderMobileOrder();
            } else {
                Table.renderDesctopOrder();
            }
        }
    },
    renderMobileOrders: function () {
        var arrLength = Table.JSON.OrderDetail.Data.length;
        var arr = Table.JSON.OrderDetail.Data;
        var table = '';
        for (var i = 0; i < arrLength; i += 1) {
            table += '<div class="row clickable-row ' + (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')] == 2 ? 'table-warning' : '') + '" data-href="order.html?order=' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '" data-order="' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '">';
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')]) {
                case 0:
                    mark = "*";
                    break;
                case 1:
                    mark = "?";
                    break;
                default:
                    mark = "";
            }
            if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('SENDMAILTOSUPPLIER')] == 1) {
                mark = '<i class="fas fa-envelope"></i>';
            }
            table += '<div class="col-12 history">' + mark + '</div>';
            table += '<div class="col-4">номер:</div>';
            table += '<div class="col-8">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '</div>';
            table += '<div class="col-4">дата:</div>';
            table += '<div class="col-8">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('DATE_ORDER')] + '</div>';
            table += '<div class="col-4">постачальник:</div>';
            table += '<div class="col-8"><a href="order.html?order=' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME')] + '</a></div>';
            table += '<div class="col-4">група поставки:</div>';
            table += '<div class="col-8">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('GROUP_NAME')] + '</div>';
            table += '<div class="col-4">автор:</div>';
            table += '<div class="col-8"></div>';
            if (Table.isSuppplier) {
                table += '<div class="col-4">Торговий зал:</div>';
                table += '<div class="col-8">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WAREHOUSE')] + '</div>';
            }
            table += '<div class="col-4">сума:</div>';
            table += '<div class="col-8">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('SUMM')] + '</div>';
            table += '</div>';
        }
        $('#tableContent').html(table);
    },
    renderDesctopOrders: function () {
        var arrLength = Table.JSON.OrderDetail.Data.length;
        var arr = Table.JSON.OrderDetail.Data;
        var mark = "";
        var table = '<table class="table table-bordered table-striped table-responsive table-hover">';
        table += '<thead>';
        table += '<tr>';
        table += '<th></th>';
        table += '<th>номер</th>';
        table += '<th>дата</th>';
        table += '<th>постачальник</th>';
        table += '<th>група поставки</th>';
        table += '<th>автор</th>';
        if (Table.isSuppplier) {
            table += '<th>Торговий зал</th>';
        }
        table += '<th>сума</th>';
        table += '</tr>';
        table += '</thead>';
        table += '<tbody>';
        for (var i = 0; i < arrLength; i += 1){
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')]) {
                case 0:
                    mark = "*";
                    break;
                case 1:
                    mark = "?";
                    break;
                default:
                    mark = "";
            }
            if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('SENDMAILTOSUPPLIER')] == 1) {
                mark = '<i class="fas fa-envelope"></i>';
            }
            table += '<tr id="' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '" class="clickable-row ' + (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')] == 2 ? 'table-warning' : '') + '" data-href="order.html?order=' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '" data-order="' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '">';
            table += '<td class="history">' + mark + '</td>';
            table += '<td>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '</td>';
            table += '<td>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('DATE_ORDER')] + '</td>';
            table += '<td><a href="order.html?order=' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NUMBER_ORDER_SUPPLY')] + '">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME')] + '</a></td>';
            table += '<td>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('GROUP_NAME')] + '</td>';
            table += '<td></td>';
            if (Table.isSuppplier) {
                table += '<td>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WAREHOUSE')] + '</td>';
            }
            table += '<td>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('SUMM')] + '</td>';
            table += '</tr>';
        }
        table += '</tbody>';
        table += '</table>';
        $('#tableContent').html(table);
    },
    sortByState: function () {
        var state = parseInt($('#state').val());
        Table.JSON = JSON.parse(Table.OriginalTableJSON);
        if (state != -1) {
            var newArr = [];
            for (var i = 0; i < Table.JSON.OrderDetail.Data.length; i++) {
                if (Table.JSON.OrderDetail.Data[i][Table.JSON.OrderDetail.InfoColumn.indexOf('STATE_ID')] == state)
                    newArr.push(Table.JSON.OrderDetail.Data[i]);
            }
            Table.JSON.OrderDetail.Data = newArr;
        }
        Table.renderTable();
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
        Table.JSON = JSON.parse(Table.OriginalTableJSON);
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
        Table.renderTable();
    },
    renderMobileOrder: function () {
        var arrLength = Table.JSON.OrderDetail.Data.length;
        var title = 'день';

        if (Table.sort != 'days') {
            title = 'тиждень';
        }
        $('#orderHeader').html('№ ' + Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY + ', ' + this.JSON.OrderHead.NAME + ', ' + this.JSON.OrderHead.GROUP_NAME + '(' + this.JSON.OrderHead.CODE_GROUP_SUPPLY + ')');
        var arr = this.JSON.OrderDetail.Data;
        var table = '';
        if (arr.indexOfType(2)) {
            var arrType2 = arr.GetByType(2);
            var arrType2Length = arrType2.length;
            table += Table.renderRawMob(arrType2Length, arrType2, title);
            table += '<div class="row dataRow"><div class="col-12 text-danger">Позиції які не потрапили в автозамовлення!</div></div>';
            var arrTypeOther = arr.GetByType(0, 1);
            var arrTypeOtherLength = arrTypeOther.length;
            if (arrTypeOtherLength > 0) {
                table += Table.renderRawMob(arrTypeOtherLength, arrTypeOther, title);
            }
        } else {
            table += Table.renderRawMob(arrLength, arr, title);
        }
        $('#tableContent').html(table);
        $('#tableContent').after('<div id="info" class="mobileInfo bg-primary"><div class="container"><div></div>');
    },
    renderDesctopOrder: function () {
    var arrLength = this.JSON.OrderDetail.Data.length;
    var title = 'день';

    if (Table.sort != 'days') {
        title = 'тиждень';
    }
    $('#orderHeader').html('№ ' + this.JSON.OrderHead.NUMBER_ORDER_SUPPLY + ', ' + this.JSON.OrderHead.NAME + ', ' + this.JSON.OrderHead.GROUP_NAME + '(' + this.JSON.OrderHead.CODE_GROUP_SUPPLY + ')');
    var arr = this.JSON.OrderDetail.Data;
    var table = '<table class="table table-bordered table-striped table-responsive detail" style="margin-top:15px">';
    table += '<thead>';
    table += '<tr>';

    Table.renderSettings.colspan = 0;
    for (var i = 0; i < Table.renderSettings.length; i++) {
        if (Table.renderSettings[i][1] == 1) {
            Table.renderSettings.colspan++;
            switch (i) {
                case Table.JSON.OrderDetail.InfoColumn.indexOf('CODEWARES'):
                    table += '<th id="sort_by_brand">' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                    table += '<th id="sort_by_title">' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    table += '<th>заказ уп.</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    table += '<th>логістична к-сть п.</th>';
                    break;
                default:
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
            }
        }
    }

    table += '</tr>';
    table += '</thead>';
    table += '<tbody>';

    if (arr.indexOfType(2)) {
        var arrType2 = arr.GetByType(2);
        var arrType2Length = arrType2.length;
        table += Table.renderRawDsc(arrType2Length, arrType2, title);
        table += '<tr><td colspan="' + Table.renderSettings.colspan + '" class="text-danger">Позиції які не потрапили в автозамовлення!</td></tr>';
        var arrTypeOther = arr.GetByType(0, 1);
        var arrTypeOtherLength = arrTypeOther.length;
        if (arrTypeOtherLength > 0) {
            table += Table.renderRawDsc(arrTypeOtherLength, arrTypeOther, title);
        }
    } else {
        table += Table.renderRawDsc(arrLength, arr, title);
    }
    table += '</tbody>';
    table += '</table>';

    $('#tableContent').html(table);
    $('#tableContent').after('<div id="info" class="desctopInfo bg-primary"><div class="container"><div></div>');
},
    renderRawMob: function (arrLength, arr, title) {
    var isEdit = Table.JSON.OrderHead.ISEDIT;
    var table = '';
    for (var i = 0; i < arrLength; i += 1) {
        table += '<div rowIndex="' + arr[i][arr[i].length - 1] + '" class="row dataRow';
        if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')] != "") {
            table += ' no_bg_style';
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')]) {
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
        if (Table.seeBrands && (Table.prevBrand !== arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')])) {
            table += '<div class="col-12 brand_name font-weight-bold text-center border border-top-0 border-left-0 border-right-0 border-dark"><h5>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')] + '</h5></div>';
        }
        Table.prevBrand = arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')];

        for (var j = 0; j < Table.renderSettings.length; j++) {
            if (Table.renderSettings[j][1] == 1) {

                var classes = [];

                if (Table.JSON.OrderField.Data[j][6] == "b") {
                    classes.push("font-weight-bold");
                }

                switch (Table.JSON.OrderField.Data[j][7]) {
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
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('CODEWARES'):
                        table += '<div id="sort_by_brand" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                        table += '<div id="sort_by_title" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY'):
                        classes.push('orderCount');
                        table += '<div id="sort_by_title" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + '  class="form-control quantyty" data-field-type="quantyty" type="number" value="' + arr[i][j] + '"/></div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                        table += '<div class="col-4">заказ уп.:</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control pack" data-field-type="pack" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')])) + '" /></div>';
                        table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        table += '<div class="col-4">логістична к-сть п.:</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control logistic" data-field-type="logistic" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) * parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')])) + '" /></div>';
                        break;
                    default:
                        table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                }
            }
        }
        table += '</div>';
    }
    return table;
},
    renderRawDsc: function (arrLength, arr, title) {
    var table = '';
    var isEdit = this.JSON.OrderHead.ISEDIT;
    for (var i = 0; i < arrLength; i += 1) {
        if (Table.seeBrands && (Table.prevBrand !== arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')])) {
            table += '<tr>';
            table += '<td colspan="15" class="font-weight-bold">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')] + '</td>';
            table += '</tr>';
        }
        Table.prevBrand = arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')];
        table += '<tr rowIndex="' + arr[i][arr[i].length - 1] + '" class="dataRow';
        if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')] != "") {
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')]) {
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

        for (var j = 0; j < Table.renderSettings.length; j++) {
            if (Table.renderSettings[j][1] == 1) {
                var classes = [];

                if (Table.JSON.OrderField.Data[j][6] == "b") {
                    classes.push("font-weight-bold");
                }

                switch (Table.JSON.OrderField.Data[j][7]) {
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
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY'):
                        classes.push('orderCount');
                        table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '><input ' + (!isEdit ? 'readonly' : '') + '  class="form-control quantyty" data-field-type="quantyty" type="number" value="' + arr[i][j] + '"/></td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                        if(Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                        if (Table.sort != 'days')
                            table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                        if (Table.sort != 'days')
                            table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                        table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control pack" data-field-type="pack" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')])) + '" /></td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                        table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control logistic" data-field-type="logistic" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')])) + '" /></td>';
                        break;
                    default:
                        table += '<td '+(classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '')+'>' + arr[i][j] + '</td>';
                        break;
                }
            }
        }
        table += '</tr>';
    }

    return table;
},
    packCalculate: function (val) {
        var maxedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')];

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
    },
    logisticCalculate: function (val) {
        var maxedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')];

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
    },
    quantytyCalculate: function (val) {
        var maxedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MAX_EDIT')];
        var minedit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('MIN_EDIT')];
        var unit = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('UNIT')];

        var old = $(".dataRow[rowIndex='" + this.globalCurrentRow + "']").find('.orderCount input').val();

        var ppack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')];
        var lpack = this.JSON.OrderDetail.Data[this.globalCurrentRow][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')];

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
                contenrRows.push(Table.JSON.OrderField.Data[i][3] + ':' + Table.JSON.OrderDetail.Data[rowIndex][i]);
        }
    }
    infoContent += contenrRows.join(', ');
    infoContent += '</span>';
    infoContent += '</div></div>';
    if (!el.prop('readonly'))
        el.select();
    $('#info .container').html(infoContent);
    $('#info').css('display','block');
},
    onBlur: function () {
        var el = $(this);
        var row = el.closest('.dataRow');
        row.removeClass('table-info');
        if (el.attr('data-old') != el.val() && el.val() != '') {
            row.attr('data-is-change', 'true');
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
        }
        if (el.hasClass('logistic')) {
            Table.logisticCalculate(el.val());
        }
        if (el.hasClass('quantyty')) {
            Table.quantytyCalculate(el.val());
        }
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
        html += '<td>'+FullName+'</td>';
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
        var data = {};
        var html = '<body>';
        html += '<style> body,table{font:12px Helvetica}@media screen{#page{width:800px}}@media print{#page{width:100%}}*{margin:0;padding:0}body{margin:10px}td.right{text-align:right}td.left{text-align:left}td.center{text-align:center}table{width:100%}td.caption{text-align:right;padding-right:8px}table.detail,table.detail td,table.detail th{border:1px solid #000;border-collapse:collapse;padding:2px 3px;font-size:11px}table.summary,table.summary td{border:1px solid #fff;border-collapse:collapse;padding:3px;text-align:right}h3,h4{display:block;text-align:center}h4{font:14px Tahoma;font-weight:700;margin-top:5px;margin-bottom:5px}h3{font:18px Tahoma;font-weight:700;margin-top:10px;margin-bottom:25px}strong{font:16px Tahoma}';
        html += '</style>';
        html += Table.renderOrderDoc() + '</body>';
        data.CodeData = 9;
        data.NumberOrder = Table.JSON.OrderHead.NUMBER_ORDER_SUPPLY;
        data.EMail = $('#send_mail_addr').val();
        data.Boby = html;

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (!save) {
                    if (JSON.parse(data).State == 0) {
                        alert('Дані успішно відправлено.');
                        $('#SendMailModal').modal('hide');
                    } else {
                        alert(JSON.parse(data).TextError);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' +xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    saveOrder: function () {

        var rows = $('div.dataRow[data-is-change="true"]');
        var isMobile = true;
        var items = [];
        var item = [];
        var Data = {};
        Data.data = {};
        var date = new Date();
        date.setDate(date.getDate() + 1);

        if (rows.length == 0) {
            rows = $('tr.dataRow[data-is-change="true"]');
            isMobile = false;
        }

        for (var i = 0; i < rows.length; i++){
            item = [];
            if (isMobile) {
                item.push($($(rows[i]).find('div:first-child + div')[0]).html());
                item.push($($(rows[i]).find('div.orderCount input')[0]).val());
            } else {
                item.push($($(rows[i]).find('td')[0]).html());
                item.push($($(rows[i]).find('td.orderCount input')[0]).val());
            }

            items.push(item);
        }

        Data.data.DATA = items;
        Data.CodeData = 7;
        Data.data.Order = REQUEST.getField('order');
        Data.data.StateOrder = 1;
        if ($('#stateOrderWrapper').is(':visible')) {
            Data.data.StateOrder = $('#stateOrder').val();
        }
        var d = DateHelper.formatJsDate($('#delivery_date').val());

        Data.data.DateDelivery = d.getFullYear() + "-" + ((d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" + (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + " " + $("#status").val() + ":00";

        if ($("#status").val() == -1) {
            delete Data.data.DateDelivery;
        }
		
        Data.data = JSON.stringify(Data.data);

        $('#tableContent').html('<div class="loader"></div>');
        $.ajax({
            url: apiUrl,
            method: "POST",
            data: Data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (JSON.parse(data).TextError == "Ok") {
                    alert('Дані успішно збережено.');

                    console.log(parseInt($('#stateOrder').val()));
                    if (parseInt($('#stateOrder').val()) == -1) {
                        location.href = '/znp/';
                        return;
                    }

                    $('#send_mail_addr').val(Table.JSON.OrderHead.GROUP_EMAIL);
                    var sendmail = false;
                    if (Table.StateOrder == 0 && parseInt($('#stateOrder').val()) == 1) {
                        sendmail = true;
                    }

                    Table.getData(true, sendmail);

                } else {
                    alert(JSON.parse(data).TextError);
                    Table.getData(true);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' +xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
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
        $('#warehouse').change(function () {
                Cookies.set('Warehouse', $(this).val(), { expires: 99999 });
                Table.getData(true);
        });
        /*$('#status, #delivery_date').change(function () {
            if ($(this).attr('is-change') !== 'false') {
                Table.saveOrder();
            }
            return;
        });*/
        $('#save_order').click(Table.saveOrder);
        $('#tableContent').on('click', '#sort_by_title', function () {
            Table.sortByColumn = Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES');
            Table.orderResort();
        });
        $('#tableContent').on('click', '#sort_by_brand', function () {
            Table.sortByColumn = Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND');
            Table.orderResort();
        });
        $('#render_settings_bar').on('change', '.rnd_setting_control', Table.changeRndSetting);
        $('#state').change(function () {
            Cookies.set('Sort_State', $(this).val());
            Table.sortByState();
        });
        $('#render_settings, .close_render_settings').click(function () {
            $('#render_settings_bar').toggle(300);
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
        if (window.isLogin){
            this.getData(true);
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    Table.init();
});