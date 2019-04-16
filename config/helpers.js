var REQUEST = {
    getField: function (name) {
        if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
            return decodeURIComponent(name[1]);
    }
};

var DateHelper = {
    formatJsDate: function (date) {
        var t = date.split(/[-]/);
        return new Date(Date.UTC(t[2], t[1] - 1, t[0]));
    }
};

function naturalSort(array, field, extractor) {
    "use strict";
    // преобразуем исходный массив в массив сплиттеров
    var splitters = array.map(makeSplitter);
    // сортируем сплиттеры
    var sorted = splitters.sort(compareSplitters);
    // возвращаем исходные данные в новом порядке
    return sorted.map(function (splitter) {
        return splitter.item;
    });
    // обёртка конструктора сплиттера
    function makeSplitter(item) {
        return new Splitter(item);
    }
    // конструктор сплиттера
    //    сплиттер разделяет строку на фрагменты "ленивым" способом
    function Splitter(item) {
        var index = 0;           // индекс для прохода по строке  
        var from = 0;           // начальный индекс для фрагмента
        var parts = [];         // массив фрагментов
        var completed = false;       // разобрана ли строка полностью
        // исходный объект
        this.item = item;
        // ключ - строка
        var key = (typeof (extractor) === 'function') ?
            extractor(item) :
            item;
        this.key = key[field];
        // количество найденных фрагментов
        this.count = function () {
            return parts.length;
        };
        // фрагмент по индексу (по возможности из parts[])
        this.part = function (i) {
            while (parts.length <= i && !completed) {
                next();   // разбираем строку дальше
            }
            return (i < parts.length) ? parts[i] : null;
        };
        // разбор строки до следующего фрагмента
        function next() {
            // строка ещё не закончилась
            if (index < key[field].length) {
                // перебираем символы до границы между нецифровыми символами и цифрами
                while (++index) {
                    var currentIsDigit = isDigit(key[field].charAt(index - 1));
                    var nextChar = key[field].charAt(index);
                    var currentIsLast = (index === key[field].length);
                    // граница - если символ последний,
                    // или если текущий и следующий символы разнотипные (цифра / не цифра)
                    var isBorder = currentIsLast ||
                        xor(currentIsDigit, isDigit(nextChar));
                    if (isBorder) {
                        // формируем фрагмент и добавляем его в parts[]
                        var partStr = key[field].slice(from, index);
                        parts.push(new Part(partStr, currentIsDigit));
                        from = index;
                        break;
                    } // end if
                } // end while
                // строка уже закончилась
            } else {
                completed = true;
            } // end if
        } // end next
        // конструктор фрагмента
        function Part(text, isNumber) {
            this.isNumber = isNumber;
            this.value = isNumber ? Number(text) : text;
        }
    }
    // сравнение сплиттеров
    function compareSplitters(sp1, sp2) {
        var i = 0;
        do {
            var first = sp1.part(i);
            var second = sp2.part(i);
            // если обе части существуют ...
            if (null !== first && null !== second) {
                // части разных типов (цифры либо нецифровые символы)  
                if (xor(first.isNumber, second.isNumber)) {
                    // цифры всегда "меньше"      
                    return first.isNumber ? -1 : 1;
                    // части одного типа можно просто сравнить
                } else {
                    var comp = compare(first.value, second.value);
                    if (comp != 0) {
                        return comp;
                    }
                } // end if
                // ... если же одна из строк закончилась - то она "меньше"
            } else {
                return compare(sp1.count(), sp2.count());
            }
        } while (++i);
        // обычное сравнение строк или чисел
        function compare(a, b) {
            return (a < b) ? -1 : (a > b) ? 1 : 0;
        };
    };
    // логическое исключающее "или"
    function xor(a, b) {
        return a ? !b : b;
    };
    // проверка: является ли символ цифрой
    function isDigit(chr) {
        var code = charCode(chr);
        return (code >= charCode('0')) && (code <= charCode('9'));
        function charCode(ch) {
            return ch.charCodeAt(0);
        };
    };
}

function printData(data) {
    var divToPrint = data;
    newWin = window.open("");
    newWin.document.write(divToPrint);
    var link = newWin.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", "/css/print.css");
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
            var parentRow = el.closest('div.dataRow');
            var fieldType = el.attr('data-field-type');
            var Inputs = $('input[data-field-type="' + fieldType + '"]');
            var Index = Inputs.index(el);

            console.log(Index);
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
                if ((next.offset().top + 30) >= $('#info').offset().top) {
                    $('html, body').animate({
                        scrollTop: next.offset().top - (document.documentElement.clientHeight - 125)
                    }, 300);
                }
                next.focus();
            }
            return false;
        }
        return true;
    });
});

var OrderHelper = {
    getOrderHistory: function (number) {
        var data = {};
        data.CodeData = 10;
        data.NumberOrder = number;

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = data;
                var rows = '';
                
                for (var i = 0; i < result.AudInfo.length; i++) {
                    rows += '<tr>';
                    for (var j = 0; j < result.AudInfo[i].length; j++) {
                        rows += '<td>' + result.AudInfo[i][j] + '</td>';
                    }
                    rows += '</tr>';
                }

                var table = '<table class="table table-bordered table-stripped">' + rows + '</table>';
                $('#HistoryModal .modal-body').html(table);
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    }
};

function TestConnection() {
    var data = {};
    data.CodeData = -1;

    $.ajax({
        url: apiUrl,
        method: "POST",
        data: data,
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            var result;
            
            console.log(data);
        },
        error: function () {
            alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
        }
    });
}