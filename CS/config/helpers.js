var REQUEST = {
    getField: function (name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
};

function printData(data) {
    var divToPrint = data;
    newWin = window.open("");
    newWin.document.write(divToPrint);
    var link = newWin.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "css/print.css");
    newWin.document.getElementsByTagName("head")[0].appendChild(link);
    //newWin.print();
    //newWin.close();
}

$(document).ready(function () {
    $(document).on('keydown', '#tableContent input', function (e) {
        var mEvent = e || window.event;
        var mPressed = mEvent.keyCode || mEvent.which;
        if (mPressed == 13 || mPressed == 40 || mPressed == 38) {
            var el = $(this);
            var parentRow = el.closest('tr');
            var Inputs = $('#tableContent input[type="number"]');
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
                $('html, body').animate({
                    scrollTop: next.offset().top -188
                }, 300);
                next.focus();
            } else {
                next.focus();
            }
            return false;
        }
        return true;
    });
});

function TestConnection() {
    $.ajax({

        data: JSON.stringify({ CodeData: -1 }),
        success: function (data) {
            var result;
            
            console.log(data);
        },
        error: function () {
            alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
        }
    });
}

String.prototype.hashCode = function () {
    for (var ret = 0, i = 0, len = this.length; i < len; i++) {
        ret = (31 * ret + this.charCodeAt(i)) << 0;
    }
    return 'a'+ret;
};