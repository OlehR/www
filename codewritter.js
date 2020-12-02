
window.onload = function () {

    var BarCode = new Vue({
        el: '#codewrite',
        data: {
            seen: false,
            wareName: "Натисніть на кнопку",
            wareCode: "0000000000000",
            result: {},
        },
        methods: {
            getData: function () {
                var data = {};
                data.CodeData = 199;

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
                        BarCode.setData(data);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
                    }
                });
            },
            setData: function (data) {
                this.wareName = data.Name;
                wareCode = data.BarCode;
                JsBarcode("#barcode", wareCode, {
                    width: 7,
                    height: 300
                });
            }
        }
    })

    JsBarcode("#barcode", BarCode.wareCode, {
        width: 7,
        height: 300
    });
};