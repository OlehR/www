$(document).ready(function () {
    if (window.isLogin) {        
    }
	        $('#import_xl').click(function (e) {
            e.stopPropagation();
            
            $('#file-upload').click();
            return false;
        });
		$('#import_xl').prop('disabled', true);
		
		$('#file-upload').change(AddOrder.importXL);
	
});
var AddOrder = {
	
	    importXL: function (e) {
        e.stopPropagation();
        $input = $(this);
        var inputFiles = this.files;
        if (typeof inputFiles === typeof undefined || inputFiles.length === 0){
			
			return;
		}
        var inputFile = inputFiles[0];

        console.log(inputFiles);

        var reader = new FileReader();
        reader.onloadstart = function (event) {
        };
        reader.onload = function (event) {
			$('#import_xl').prop('disabled', true);
            AddOrder.MultiOrder( event.target.result);
			$('#import_xl').prop('disabled', false);
        };
        reader.onerror = function (event) {
            alert("Сталася помилка: " + event.target.error.code);
        };
        reader.readAsText(inputFile);

        $('#import_xl').prop('disabled', false);
        return false;
    },
	   MultiOrder: function ( xls) {


        var obj = {};
        obj.data = {};
        obj.data.CodeData = 14;
       
        obj.data.ImportXls = xls;
        

        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
				if(data.State==-1)
					alert(data.TextError);
				else
					alert("Створено замовлення=>"+data.NumberOrders);
				console.log(data);
				
               // AMatrix.JSON = data;
                
              //  AMatrix.renderAM();
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });

    }
	
}