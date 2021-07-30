var Order = {
    GP: -1,
    WH: -1,
    getWarhouses: function () {
        
        $.ajax({
            
            data: JSON.stringify({CodeData : 5}),
            
            success: function (data) {
                var result = data;
                var arrLength = result.Warehouse.Data.length;
                var options = '<option value=""></option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + result.Warehouse.Data[i][0] + '">' + result.Warehouse.Data[i][1] + '</option>';
                }
				if(result.Is_ManagerHead==1)
					$('#import_xl').prop('disabled', false);
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

        Order.WH = $(this).val();
       
        $.ajax({

            data: JSON.stringify({CodeData : 4,CodeWarehouse:Order.WH}),
            
            success: function (data) {
                var result = data;
                var arrLength = result.GroupSupply.length;
                var options = '<option value=""></option>';
                for (var i = 0; i < arrLength; i++) {
                    options += '<option value="' + result.GroupSupply[i][0] + '">' + result.GroupSupply[i][1] + '</option>';
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
        
        $.ajax({
			
            data: JSON.stringify({CodeData : 8, CodeWarehouse : Order.WH, CodeGroupSupply : Order.GP}),
            
            success: function (data) {
                var result = data;
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
