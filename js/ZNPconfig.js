var ZnpConfig = {
    Tabs: [],
    addTab: function (contextKey, object) {
        object.contextKey = contextKey;
        this.Tabs.push({obj:object});
    },
    getAccessTab: function () {
        

        $.ajax({
            
            data: JSON.stringify({CodeData : 200}),
            
            success: function (data) {
                var json = data;
                console.log(json);

                var arrLen = json.Pages.length;
                for (var i = 0; i < arrLen; i++) {
                    if (json.Pages[i][2] === 'On' || json.Pages[i][2] === 'ReadOnly') {
                        $('#myTab a').eq(i).tab('show');
                        break;
                    }
                }
                for (var j = 0; j < arrLen; j++) {
                    if (json.Pages[j][2] === 'Off') {
                        $('#myTab nav-item').eq(j).hide();
                    }
                    if (json.Pages[j][2] === 'ReadOnly') {
                        $('#myTabContent > .tab-pane').eq(j).addClass('ReadOnly');
                    }
                }

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $('#myTab a').on('shown.bs.tab', function (event) {
            //var x = $(event.target).text();         // active tab
            //var y = $(event.relatedTarget).text();  // previous tab

            ZnpConfig.Run();
        });
    },
    Run: function () {
        var tabIndex = $('#myTab .nav-link').index($('#myTab .nav-link.active'));
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