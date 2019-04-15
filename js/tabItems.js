var Checker = {
    GP: -1,
    WR: -1,
    contextKey: '',
    JSON: {},
    isSave: false,
    getWarhouses: function (save) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 302;
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
                Checker.JSON = data;
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
        //Checker.GP = $(this).val();
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
                Checker.JSON = data;
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
        $('#tableContentChecker').html('<div class"loader"></div>');
        if ($('.nav-link.checked').length > 0)
            $($('.nav-link.checked')[0]).removeClass('checked');
        var el = $(this);
        el.addClass('checked');
        Checker.WR = el.data('val');
        var arr = Checker.JSON.Wares;
        var arrLength = arr.length;
        var readOnly = $('#Cheker').hasClass('ReadOnly') ? 'readonly onclick="return false;"' : '';
        var tBody = '';
        var tHead = '<tr>';

        tHead += '<th>Код товару</th>';
        tHead += '<th>Код бренду</th>';
        tHead += '<th>Назва</th>';
        tHead += '<th>Заблокувати<br/><div class="form-check"><lable for="select_all" class="form-check-label small"><input ' + readOnly + ' id="select_all" type="checkbox" class="form-check-input"/> Всі</lable></div></th>';
        tHead += '</tr>';

        var checked = 'checked';
        for (var i = 0; i < arrLength; i++) {
            if (arr[i][1] == Checker.WR) {
                tBody += '<tr>';
                tBody += '<td>' + arr[i][0] + '</td>';
                tBody += '<td>' + arr[i][1] + '</td>';
                tBody += '<td>' + arr[i][2] + '</td>';
                tBody += '<td><input ' + readOnly + ' data-old="' + arr[i][3] + '" type="checkbox" class="checkbox" ' + (parseInt(arr[i][3]) == 1 ? 'checked' : '') + ' value="' + arr[i][3] + '"/></td>';
                tBody += '</tr>';
                if (parseInt(arr[i][3]) != 1) {
                    checked = '';
                }
            }
        }
        tHead = tHead.replace(/id="select_all"/g, 'id="select_all" ' + checked);
        $('#tableContentChecker').html('<table class="table-bordered table table-striped">' + tHead + tBody + '</table>');

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
        var rows = $('#GPSwares tr[is-change="true"]');
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 122;
        obj.data.CodeGroupSupply = Checker.GP;
        obj.data.Data = [];

        var arrLength = rows.length;
        for (var i = 0; i < arrLength; i++) {
            obj.data.Data.push([$(rows[i]).find('td:first-child').text(), $(rows[i]).find('input').val()]);
        }
        obj.data = JSON.stringify(obj.data);
        $('#overlay').css('display', 'flex');
        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                result = data;
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
        $('#tableContentChecker').on('change', 'input:not([id="select_all"])', Checker.changeStatus);
        $('#save_cheked').click(Checker.saveCheck);
        $('#tableContentChecker').on('change', 'input[id="select_all"]', function () {
            var checked = $(this).prop('checked');
            $('input:not([id="select_all"])').each(function () {
                $(this).prop('checked', checked).trigger('change');
            });
        });
    },
    init: function () {
        /*if (window.isLogin) {
            Checker.getWarhouses();
        }*/
        this.controlsInit();
    }
};

var Delivery = {
    contextKey: '',
    JSON: {},
    getStartPageDeliverySchedule: function (save) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 210;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var json = data;

                var warehouse = $('#Delivery .Warehouse');
                var arrLength = json.Warehouse.length;
                var options = '<option value="-1">--Виберіть склад--</option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + json.Warehouse[i][0] + '">' + json.Warehouse[i][1] + '</option>';
                }
                warehouse.html(options);

                //Route
                var route = $('#Delivery .Route');
                arrLength = json.Direction.length;
                options = '<option value="-1">--Напрямок--</option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + json.Direction[i][0] + '">' + json.Direction[i][1] + '</option>';
                }
                route.html(options);

                //Type
                var type = $('#Delivery .Type');
                arrLength = json.TypePrognosisOrder.length;
                options = '<option value="-1">--Прогноз замовлення--</option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + json.TypePrognosisOrder[i][0] + '">' + json.TypePrognosisOrder[i][1] + '</option>';
                }
                type.html(options);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    getDeliverySchedule: function (e) {
        e.stopPropagation();
        $('#Delivery .Route').val(-1);
        $('#Delivery .Type').val(-1);
        $('#tableContent' + Delivery.contextKey).html('<div class="loader"></div>');

        var obj = {};
        obj.data = {};
        obj.data.CodeData = 211;
        obj.data.Warehouse = $('#Delivery .Warehouse').val();

        if (parseInt(obj.data.Warehouse) == -1)
            return;

        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                Delivery.JSON = data;

                Delivery.JSON.DeliverySchedule.Data.__proto__.filterByPrognosisType = function (search) {
                    var arr = [];
                    for (var i = 0; i < this.length; i++) {
                        var type = this[i][Delivery.JSON.DeliverySchedule.InfoColumn.indexOf('TYPE_PROGNOSIS_ORDER')] === parseInt(search);
                        if (type) {
                            arr.push(this[i]);
                        }
                    }
                    return arr;
                };

                Delivery.JSON.DeliverySchedule.Data.__proto__.filterByDirection = function (search) {
                    var arr = [];
                    for (var i = 0; i < this.length; i++) {
                        var type = JSON.parse(this[i][Delivery.JSON.DeliverySchedule.InfoColumn.indexOf('DIRECTION')]).indexOf(parseInt(search)) != -1;
                        if (type) {
                            arr.push(this[i]);
                        }
                    }
                    return arr;
                };

                Delivery.JSON.DeliverySchedule.Data.__proto__.filterByKeywords = function (search) {
                    var arr = [];
                    for (var i = 0; i < this.length; i++) {
                        var type = new RegExp(search, 'gi').test(this[i][Delivery.JSON.DeliverySchedule.InfoColumn.indexOf('NAME_GROUP_SUPPLY')]);
                        if (type) {
                            arr.push(this[i]);
                        }
                    }
                    return arr;
                };

                Delivery.renderDeliveryShedule(Delivery.JSON.DeliverySchedule.Data, Delivery.JSON.DeliverySchedule.InfoColumn);

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    renderDeliveryShedule: function (data, infoColumn) {
        var readOnly = $('#Delivery').hasClass('ReadOnly') ? 'readonly onclick="return false;"' : '';
        var arrLen = data.length;
        var tHead = '<thead><tr>';
        tHead += '<th>Код гр.пост.</th>';
        tHead += '<th>Назва гр.пост.</th>';
        tHead += '<th>Тип прогнозу</th>';
        tHead += '<th>Пн</th>';
        tHead += '<th>Вт</th>';
        tHead += '<th>Ср</th>';
        tHead += '<th>Чт</th>';
        tHead += '<th>Пт</th>';
        tHead += '<th>Сб</th>';
        tHead += '<th>Нд</th>';
        tHead += '<th>П-сть</th>';
        tHead += '<th>ДДП</th>';
        tHead += '<th>Дата старту</th>';
        tHead += '</tr></thead>';

        var tBody = '<tbody>';
        for (var i = 0; i < arrLen; i++) {
            var isDay = false;
            for (var j = 4; j < 10; j++) {
                if (data[i][j] !== '') {
                    isDay = true;
                }
            }

            var isOther = false;

            for (var k = 11; k < 13; k++) {
                if (data[i][k] !== '') {
                    isOther = true;
                }
            }

            tBody += '<tr>';
            tBody += '<td>' + data[i][infoColumn.indexOf('CODE_GROUP_SUPPLY')] + '</td>';
            tBody += '<td>' + data[i][infoColumn.indexOf('NAME_GROUP_SUPPLY')] + '</td>';
            tBody += '<td>' + data[i][infoColumn.indexOf('DATA_NAME')] + '</td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_1')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_2')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_3')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_4')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_5')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_6')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Day" ' + (isOther ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('D_7')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Sub" ' + (isDay ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('PERIOD_SUPPLY')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control Sub" ' + (isDay ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('DAY_TO_SUPPLY')] + '" /></td>';
            tBody += '<td> <input ' + readOnly + ' class="form-control DateStart Sub" ' + (isDay ? 'disabled="disabled"' : '') + ' value="' + data[i][infoColumn.indexOf('DATE_START')] + '" /></td>';
            tBody += '</tr>';
        }
        tBody += '</tbody>';

        $('#tableContent' + Delivery.contextKey).html('<table class="table table-stripped table-bordered">' + tHead + tBody + '</table>');
        $('#tableContent' + Delivery.contextKey + ' .DateStart').datepicker({
            format: 'dd-mm-yyyy',
            language: 'uk'
        });

    },
    onChange: function () {
        var tr = $(this).closest('tr');
        tr.attr('is-change', true);

        var isDayEmpty = true;

        $(tr.find('.Day')).each(function () {
            console.log($(this).val());
            if ($(this).val() !== "") {
                isDayEmpty = false;
            }
        });

        var isOtherEmpty = true;

        $(tr.find('.Sub')).each(function () {
            if ($(this).val() !== "") {
                isOtherEmpty = false;
            }
        });

        if (isDayEmpty && isOtherEmpty) {
            $(tr.find('.Day, .Sub')).each(function () {
                $(this).prop('disabled', false);
            });
        } else {
            if (!isDayEmpty) {
                $(tr.find('.Sub')).each(function () {
                    $(this).prop('disabled', true);
                });
            }
            if (!isOtherEmpty) {
                $(tr.find('.Day')).each(function () {
                    $(this).prop('disabled', true);
                });
            }
        }

    },
    filter: function (search) {
        var data = Object.assign([], Delivery.JSON.DeliverySchedule.Data);

        var direction = $('#Delivery .Route').val();

        if (parseInt(direction) != -1) {
            data = data.filterByDirection(direction);
        }

        var type = $('#Delivery .Type').val();

        if (parseInt(type) != -1) {
            data = data.filterByPrognosisType(type);
        }

        if (typeof search != typeof undefined && search.length >= 2) {
            data = data.filterByKeywords(search);
        }

        Delivery.renderDeliveryShedule(data, Delivery.JSON.DeliverySchedule.InfoColumn);

    },
    saveDelivery: function () {
        var rows = $('tr[is-change="true"]');

        var arrLen = rows.length;
        var items = [];

        for (var i = 0; i < arrLen; i++) {
            var row = $(rows[i]);
            var item = [row.find('td:first-child').text()];
            var isValid = false;

            $(row.find('input')).each(function () {
                var el = $(this);

                if (el.val() !== '') {
                    isValid = true;
                }

                item.push(el.val());
            });

            if (!isValid) {
                alert('В ГП ' + row.find('td:first + td').text() + 'відсутні значення!');
                return;
            }

            if (item[item.length - 3] !== '' && item[item.length - 2] !== '' && item[item.length - 1] !== '') {
                if (item[item.length - 3] === '') {
                    alert('Поле П-сть має бути заповнене.');
                    return;
                }
                if (item[item.length - 2] === '') {
                    alert('Поле ДДП має бути заповнене.');
                    return;
                }
                if (item[item.length - 1] === '') {
                    alert('Поле Дата старту має бути заповнене.');
                    return;
                }
            }

            items.push(item);
        }

        var obj = {};
        obj.data = {};
        obj.data.CodeData = 212;
        obj.data.Warehouse = $('#Delivery .Warehouse').val();
        obj.data.DeliverySchedule = items;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    alert('Дані успішно збережено.');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $('#saveDelivery').click(Delivery.saveDelivery);

        $('#Delivery .Warehouse').change(Delivery.getDeliverySchedule);

        $('#Delivery .Route, #Delivery .Type').change(function () {
            Delivery.filter();
        });

        $('#Delivery .GP').keyup(function () {
            Delivery.filter($(this).val());
        });

        $('#Delivery').on('change','input', Delivery.onChange);

        $('#tableContent' + Delivery.contextKey).scroll(function () {
            $('#tableContent' + Delivery.contextKey + ' thead').css({
                'transform': 'translate3d(0,' + ($('#tableContent' + Delivery.contextKey).scrollTop()) + 'px,0)'
            });
        });
    },
    init: function () {
        Delivery.getStartPageDeliverySchedule();
    }
};

Object.defineProperty(Array.prototype, 'chunk_inefficient', {
    value: function (chunkSize) {
        var array = this;
        return [].concat.apply([],
            array.map(function (elem, i) {
                return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
            })
        );
    }
});

var GroupSupplies = {
    curGS:-1,
    bindGpSearching: function () {
        $('#group_supplier_input').select2({
            minimumInputLength: 3,
            ajax: {
                url: apiUrl,
                dataType: 'json',
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: function (params) {
                    var obj = {};
                    obj.data = {};
                    obj.data.CodeData = 302;
                    obj.data.NameGS = params.term;
                    obj.data = JSON.stringify(obj.data);
                    return obj;
                },
                processResults: function (data) {
                    var dataArr = [{ id: '', text: '' }];
                    if (parseInt(data.State) === 0) {
                        var arrLength = data.data.length;
                        for (var i = 0; i < arrLength; i++) {
                            dataArr.push({ id: data.data[i][0], text: data.data[i][1] });
                        }
                    } else {
                        alert(data.TextError);
                    }
                    return {
                        results: dataArr
                    };
                }
            }
        });
    },
    getBrandGroupSupplier: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 232;
        obj.data.CodeGS = GroupSupplies.curGS;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    var countPerCol = Math.ceil(data.Brand.length / 5);
                    var list = [];
                    for (var i = 0; i < data.Brand.length; i++) {
                        var listItem = '';
                        listItem += '<div class="custom-control custom-checkbox">';
                        listItem += '<input type="checkbox" class="custom-control-input" id="' + data.Brand[i][0] + '" value="' + data.Brand[i][2] + '" ' + (parseInt(data.Brand[i][2]) === 1 ? 'checked' : '') +'>';
                        listItem += '<label class="custom-control-label" for="' + data.Brand[i][0] + '">' + data.Brand[i][1] + '</label>';
                        listItem += '</div>';
                        list.push(listItem);
                    }

                    var cols = list.chunk_inefficient(countPerCol);
                    var html = '<div class="col-sm-1"></div>';
                    for (var j = 0; j < cols.length; j++) {
                        html += '<div class="col-sm-2">' + cols[j].join('') + '</div>';
                    }

                    $('#GPSbrandList').html(html);
                    $('a[href="#GPSbrand"]').tab('show');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    getGroupSupplierData: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 234;
        obj.data.CodeGS = GroupSupplies.curGS;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    var options = '';
                    for (var i = 7; i <= 20; i++) {
                        options += '<option value="' + i + '">' + i + '</option>';
                    }
                    $('#TIME_CRATE_1').html(options);
                    $('#TIME_CRATE_2').html(options);
                    $('#TIME_CRATE_3').html(options);
                    GroupSupplies.renderGSfields(data.Comment, data);
                    for (var k in data.GS) {
                        if (data.GS.hasOwnProperty(k)) {
                            var el = $('#' + k);
                            el.val(data.GS[k]);
                            if (el.is(':checkbox')) {
                                if (parseInt(data.GS[k]) === 1)
                                    el.prop('checked', true);
                            }
                        }
                    }
                    $('a[href="#EditGPS"]').tab('show');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    supplierChecker: function () {
        $('a[href="#GPSwares"]').tab('show');
        Checker.init();
        Checker.GP = GroupSupplies.curGS;
        Checker.selectGroup();
    },
    getTabsData: function (isCurrent, id) {

        if (GroupSupplies.curGS === -1) {
            alert('Виберіть группу постачання.');
            return;
        }

        var Id;
        var curTab = $('#GroupTabContent .tab-pane:visible');

        if (curTab.length === 0) {
            Id = 'EditGPS';
        } else {
            Id = curTab.attr('id');
        }

        if (!isCurrent)
            Id = id;

        switch (Id) {
            case 'EditGPS':
                GroupSupplies.getGroupSupplierData();
                break;
            case 'GPSbrand':
                GroupSupplies.getBrandGroupSupplier();
                break;
            case 'GPSwares':
                GroupSupplies.supplierChecker();
                break;
        }
    },
    renderGSfields: function (fields, data) {
        var countPerCol = Math.ceil((fields.length - 7) / 3);

        var rows = [];
        for (var i = 0; i < fields.length; i++) {
            if (!$('#' + fields[i][0]).hasClass('staticField')) {
                var row = '<div class="form-group">';
                row += '<div class="row">';
                row += '<label class="col-sm-8" for="' + fields[i][0] + '">' + fields[i][1] + ':</label>';
                row += '<div class="col-sm-4">';
                var readonly = '';
                if (/R/g.test(fields[i][2])) {
                    readonly = 'readonly';
                }
                if (/S/g.test(fields[i][2]) || /D/g.test(fields[i][2])) {
                    row += '<input ' + readonly + ' class="form-control" id="' + fields[i][0] + '" />';
                }
                if (/L/g.test(fields[i][2])) {
                    row += '<select ' + readonly + ' class="form-control" id="' + fields[i][0] + '">';
                    for (var k = 0; k < data[fields[i][0]].length; k++) {
                        row += '<option value="' + data[fields[i][0]][k][0] + '">' + data[fields[i][0]][k][1] +'</option>';
                    }
                    row += '</select>';
                }
                if (/C/g.test(fields[i][2])) {
                    row += '<input ' + readonly + ' type="checkbox" class="checkbox" id="' + fields[i][0] + '" />';
                }
                if (/N/g.test(fields[i][2])) {
                    var range = '';
                    if (fields[i][3] !== '') {
                        var rangeArr = fields[i][3].split('-');
                        range = 'min="' + rangeArr[0] + '" max="' + rangeArr[1] + '"';
                    }
                    row += '<input ' + readonly + ' ' + range + ' type="number" class="form-control" id="' + fields[i][0] + '" />';
                }
                if (/I/g.test(fields[i][2])) {
                    row += '<input ' + readonly + ' type="number" class="form-control integer" id="' + fields[i][0] + '" />';
                }
                if (/E/g.test(fields[i][2])) {
                    row += '<input ' + readonly + ' class="form-control e-mail" id="' + fields[i][0] + '" />';
                }
                row += '</div>';
                row += '</div>';
                row += '</div>';
                rows.push(row);
            }
        }

        var cols = rows.chunk_inefficient(countPerCol);

        $('#col_GS_1').html(cols[0].join(''));
        $('#col_GS_2').html(cols[1].join(''));
        $('#col_GS_3').html(cols[2].join(''));
    },
    saveGSdata: function () {
        var data = {};
        $('#EditGPS input, #EditGPS select').each(function () {
            var el = $(this);
            data[el.attr('id')] = el.val();
        });
        data.CodeData = 235;

        var obj = {};
        obj.data = data;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    alert('Дані успішно збережено.');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    saveGSbrandData: function () {
        var data = {};
        data.Brand = [];
        $('#GPSbrandList input[type="checkbox"]').each(function () {
            var el = $(this);
            data.Brand.push([el.attr('id'), el.val()]);
        });
        data.CodeData = 233;
        data.CodeGS = GroupSupplies.curGS;

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
                if (parseInt(data.State) === 0) {
                    alert('Дані успішно збережено.');
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    init: function () {
        GroupSupplies.bindGpSearching();
        $('#group_supplier_input').on('select2:select', function (e) {
            var data = e.params.data;
            GroupSupplies.curGS = data.id;

            GroupSupplies.getTabsData(true);
        });
        $('#GroupSuppliesTab a').click(function (e) {
            e.preventDefault();
            GroupSupplies.getTabsData(false, $(this).attr('href').replace(/#/g,''));
        });
        $('#saveGSdata').click(GroupSupplies.saveGSdata);
        $('#saveGSbrandData').click(GroupSupplies.saveGSbrandData);
        $('#EditGPS, #GPSbrandList').on('change', 'input[type="checkbox"]', function () {
            var el = $(this);
            if (el.prop('checked')) {
                el.val(1);
            }
            else {
                el.val(0);
            }
        });
    }
};

var Supplier = {
    currSupplier: -1,
    bindBrandsSearching: function () {
        $('#brands_input').select2({
            minimumInputLength: 3,
            ajax: {
                url: apiUrl,
                dataType: 'json',
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: function (params) {
                    var obj = {};
                    obj.data = {};
                    obj.data.CodeData = 301;
                    obj.data.Brand = params.term;
                    obj.data = JSON.stringify(obj.data);
                    return obj;
                },
                processResults: function (data) {
                    var dataArr = [{ id: '', text: '' }];
                    if (parseInt(data.State) === 0) {
                        var arrLength = data.Brand.length;
                        for (var i = 0; i < arrLength; i++) {
                            dataArr.push({ id: data.Brand[i][0], text: data.Brand[i][1] });
                        }
                    } else {
                        alert(data.TextError);
                    }
                    return {
                        results: dataArr
                    };
                }
            }
        });
    },
    bindSupplierSearching: function () {
        $('#supplier_input').select2({
            minimumInputLength: 3,
            ajax: {
                url: apiUrl,
                dataType: 'json',
                type: "POST",
                xhrFields: {
                    withCredentials: true
                },
                data: function (params) {
                    var obj = {};
                    obj.data = {};
                    obj.data.CodeData = 300;
                    obj.data.Supplier = params.term;
                    obj.data = JSON.stringify(obj.data);
                    return obj;
                },
                processResults: function (data) {
                    var dataArr = [{ id: '', text: '' }];
                    if (parseInt(data.State) === 0) {
                        var arrLength = data.Supplier.length;
                        for (var i = 0; i < arrLength; i++) {
                            dataArr.push({ id: data.Supplier[i][0], text: data.Supplier[i][1] });
                        }
                    } else {
                        alert(data.TextError);
                    }
                    return {
                        results: dataArr
                    };
                }
            }
        });
    },
    getSupplierBrands: function (supplier) {
        Supplier.currSupplier = supplier;
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 230;
        obj.data.CodeSupplier = supplier;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    var brandList = '';
                    for (var i = 0; i < data.Brand.length; i++) {
                        brandList += '<li brand-id="' + data.Brand[i][0] + '" class="clearfix">';
                        brandList += '<span>' + data.Brand[i][1] + '</span>';
                        brandList += '<a class="btn btn-sm btn-danger removeSupplierBrand float-right" href="#" title="видалити">';
                        brandList += 'X';
                        brandList += '</a>';
                        brandList += '</li>';
                    }
                    $('#supplier_brands').html(brandList);
                    $('#tableContentSupplier .brand_widget').show();

                    var groupList = '';
                    for (var j = 0; j < data.GroupSupplier.length; j++) {
                        groupList += '<li class="clearfix">';
                        groupList += '<a group-id="' + data.GroupSupplier[j][0] + '" class="btn btn-block GroupSuppliesStart" href="#">';
                        groupList += '<span>' + data.GroupSupplier[j][1] + '</span>';
                        groupList += '</a>';
                        groupList += '</li>';
                    }

                    $('#group_supplier ul').html(groupList);
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    addSupplierBrand: function (brandId, brandTitle) {
        var brandList = '';
        brandList += '<li brand-id="' + brandId + '" class="clearfix isChanged alert-success isAdded">';
        brandList += '<span>' + brandTitle + '</span>';
        brandList += '<a class="btn btn-sm btn-warning cancleSupplierBrand float-right" href="#" title="відмінити">';
        brandList += 'X';
        brandList += '</a>';
        brandList += '</li>';
        $('#supplier_brands').append(brandList);
        $('#supplier_brands').scrollTop($("#supplier_brands")[0].scrollHeight);

    },
    removeSuplierBrand: function () {
        var item = $(this).closest('li');
        item.addClass('isChanged alert-danger isRemoved');
        item.find('a').removeClass('btn-danger removeSupplierBrand').addClass('btn-warning cancleSupplierBrand');
    },
    cancleSupplierBrand: function () {
        var item = $(this).closest('li');
        if (item.hasClass('isAdded')) {
            item.remove();
        } else {
            item.removeClass('isChanged alert-danger isRemoved');
            item.find('a').addClass('btn-danger removeSupplierBrand').removeClass('btn-warning cancleSupplierBrand');
        }
    },
    saveBrands: function () {
        var items = $('.isChanged');

        if (items.length === 0) {
            alert('Відсутні зміни!');
            return;
        }

        var data = [];
        items.each(function () {
            var el = $(this);
            if (el.hasClass('isAdded'))
                data.push([el.attr('brand-id'), 1]);
            else
                data.push([el.attr('brand-id'), 0]);
        });

        var obj = {};
        obj.data = {};
        obj.data.CodeData = 231;
        obj.data.CodeSupplier = Supplier.currSupplier;
        obj.data.Brand = data;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if (parseInt(data.State) === 0) {
                    alert('Дані збережено.');
                    /*items.each(function () {
                        
                    });*/
                } else {
                    alert(data.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    startGS: function () {
        var el = $(this);
        GroupSupplies.curGS = parseInt(el.attr('group-id'));
        $('a[href="#GroupSupplies"]').tab('show');
        $('#select2-group_supplier_input-container').attr('title', el.text()).text(el.text());
        GroupSupplies.getGroupSupplierData();
        
    },
    init: function () {
        Supplier.bindSupplierSearching();
        Supplier.bindBrandsSearching();
        $('#supplier_input').on('select2:select', function (e) {
            var data = e.params.data;
            Supplier.getSupplierBrands(data.id);
        });
        $('#brands_input').on('select2:select', function (e) {
            var data = e.params.data;
            Supplier.addSupplierBrand(data.id, data.text);
        });
        $('#supplier_brands').on('click', '.removeSupplierBrand', Supplier.removeSuplierBrand);
        $('#supplier_brands').on('click', '.cancleSupplierBrand', Supplier.cancleSupplierBrand);
        $('#saveSupplierBrands').click(Supplier.saveBrands);
        $('#group_supplier').on('click', '.GroupSuppliesStart', Supplier.startGS);
    }
};

ZnpConfig.addTab('Delivery', Delivery);
ZnpConfig.addTab('Checker', Checker);
ZnpConfig.addTab('Supplier', Supplier);
ZnpConfig.addTab('GroupSupplies', GroupSupplies);