﻿var Order = {
    GP: -1,
    WH: -1,
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
                var result = JSON.parse(data);
                var arrLength = result.Warehouse.Data.length;
                var options = '<option value=""></option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + result.Warehouse.Data[i][0] + '">' + result.Warehouse.Data[i][1] + '</option>';
                }
                $("#combobox").html(options);
                $("#combobox").combobox({
                    change: Order.selectWarehouse
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectWarehouse: function () {
        var data = {};
        data.warehouse = $(this).val();
        data.CodeData = 4;

        Order.WH = data.warehouse;

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
                var result = JSON.parse(data);
                var arrLength = result.data.length;
                var options = '<option value=""></option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + result.data[i][0] + '">' + result.data[i][1] + '</option>';
                }
                $("#combobox1").html(options);
                $("#combobox1").combobox({
                    change: Order.selectGP
                });
                $('.ui-widget.GP').show();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    selectGP: function () {
        Order.GP = $(this).val();
        $('#add_order').show();
    },
    add_order: function () {
        var data = {};
        data.warehouse = Order.WH;
        data.CodeGroupSupply = Order.GP;
        data.CodeData = 8;

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
                var result = JSON.parse(data);
                document.location = 'order.html?order=' + result.Order;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    init: function () {
        Order.getWarhouses();
        $('#add_order').click(Order.add_order);
    }
};
Order.init();