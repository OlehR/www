var Checker = {
    GP: -1,
    WR: -1,
    contextKey:'',
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
        $('#tableContent' + Checker.contextKey).html('<div class"loader"></div>');
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
        $('#tableContent' + Checker.contextKey).html('<table class="table-bordered table table-striped">' + tHead + tBody + '</table>');
        
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
        $('#tableContent' + Checker.contextKey).on('change', 'input:not([id="select_all"])', Checker.changeStatus);
        $('#save_cheked').click(Checker.saveCheck);
        $('#tableContent' + Checker.contextKey).on('change', 'input[id="select_all"]', function () {
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
                var json = JSON.parse(data);
                console.log(json);

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
                Delivery.JSON = JSON.parse(data);
                console.log(Delivery.JSON);

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
            tBody += '<tr>';
            tBody += '<td>' + data[i][infoColumn.indexOf('CODE_GROUP_SUPPLY')] + '</td>';
            tBody += '<td>' + data[i][infoColumn.indexOf('NAME_GROUP_SUPPLY')] + '</td>';
            tBody += '<td>' + data[i][infoColumn.indexOf('DATA_NAME')] + '</td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_1')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_2')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_3')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_4')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_5')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_6')] + '" /></td>';
            tBody += '<td> <input class="form-control Day" value="' + data[i][infoColumn.indexOf('D_7')] + '" /></td>';
            tBody += '<td> <input class="form-control Sub" value="' + data[i][infoColumn.indexOf('PERIOD_SUPPLY')] + '" /></td>';
            tBody += '<td> <input class="form-control Sub" value="' + data[i][infoColumn.indexOf('DAY_TO_SUPPLY')] + '" /></td>';
            tBody += '<td> <input class="form-control DateStart Sub" value="' + data[i][infoColumn.indexOf('DATE_START')] + '" /></td>';
            tBody += '</tr>';
        }
        tBody += '</tbody>';

        $('#tableContent' + Delivery.contextKey).html('<table class="table table-stripped table-bordered">' + tHead + tBody + '</table>');
        $('#tableContent' + Delivery.contextKey + ' .DateStart').datepicker({
            format: 'dd-mm-yyyy',
            language: 'uk'
        });

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
    controlsInit: function () {
        $('#Delivery .Warehouse').change(Delivery.getDeliverySchedule);

        $('#Delivery .Route, #Delivery .Type').change(function () {
            Delivery.filter();
        });

        $('#Delivery .GP').keyup(function () {
            Delivery.filter($(this).val());
        });

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

ZnpConfig.addTab('Checker', Checker);
ZnpConfig.addTab('Delivery', Delivery);