var ZnpConfig = {
    Tabs: [],
    addTab: function (contextKey, object) {
        object.contextKey = contextKey;
        this.Tabs.push({obj:object});
    },
    getAccessTab: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 200;
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

                var arrLen = json.Pages.length;
                for (var i = 0; i < arrLen; i++) {
                    if (json.Pages[i][2] == 'On' || json.Pages[i][2] == 'ReadOnly') {
                        $('.nav-tabs a').eq(i).tab('show');
                        break;
                    }
                }
                for (var i = 0; i < arrLen; i++) {
                    if (json.Pages[i][2] == 'Off') {
                        $('.nav-tabs nav-item').eq(i).hide();
                    }
                    if (json.Pages[i][2] == 'ReadOnly') {
                        $('.tab-pane').eq(i).addClass('ReadOnly');
                    }
                }

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $('.nav-tabs a').on('shown.bs.tab', function (event) {
            //var x = $(event.target).text();         // active tab
            //var y = $(event.relatedTarget).text();  // previous tab

            ZnpConfig.Run();
        });
    },
    Run: function () {
        var tabIndex = $('.nav-tabs .nav-link').index($('.nav-tabs .nav-link.active'));
        ZnpConfig.Tabs[tabIndex].obj.init();
    }
};

$(document).ready(function () {
    if (window.isLogin) {
        ZnpConfig.getAccessTab();
    }
        ZnpConfig.controlsInit();
        Delivery.controlsInit();
    
});