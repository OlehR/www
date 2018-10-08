var ZnpConfig = {
    Tabs: [],
    addTab: function (contextKey, object) {
        object.contextKey = contextKey;
        this.Tabs.push({obj:object});
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
        this.Tabs[tabIndex].obj.init();
    }
};

$(document).ready(function () {
    ZnpConfig.controlsInit();
    Delivery.controlsInit();
});