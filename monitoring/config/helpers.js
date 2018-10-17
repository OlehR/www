var REQUEST = {
    getField: function (name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
};


$(document).ready(function () {
    $(document).on('keydown', '#tableContent input', function (e) {
        var mEvent = e || window.event;
        var mPressed = mEvent.keyCode || mEvent.which;
        if (mPressed == 13 || mPressed == 40 || mPressed == 38) {
            var el = $(this);
            var parentRow = el.closest('div.dataRow');
            var Inputs = $('#tableContent input:visible');
            var Index = Inputs.index(el);

            if (mPressed == 13 && Index == Inputs.length - 1) {
                el.blur();
                return false;
            }
            if (mPressed == 38) {
                Index = Index > 0 ? Index -= 1 : 0;
            } else {
                Index = Index < Inputs.length - 1 ? Index += 1 : Inputs.length - 1;
            }
            var next = $(Inputs[Index]);
            if (parentRow.length > 0) {
                if(!$('#not_entered').prop('checked')){
                $('html, body').animate({
                    scrollTop: next.offset().top -38
                }, 300);
                }
                next.focus();
            } else {
                next.focus();
            }
            return false;
        }
        return true;
    });
});