var AMatrix = {
    JSON: {},
    prevSort:-2,
    getData: function () {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 110;
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                AMatrix.JSON = JSON.parse(data);
                if (typeof AMatrix.JSON.GroupWares != typeof undefined) {
                    var tree = AMatrix.createTree(AMatrix.JSON.GroupWares);
                    $('#Warehouse li').html(tree);
                }

                if (typeof AMatrix.JSON.Manager != typeof undefined) {
                    var options = '<option>--Вибрати менеджера--</option>';
                    var arr = AMatrix.JSON.Manager;
                    var arrLength = arr.length;

                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + arr[i][0] + '">' + arr[i][1] + '</option>';
                    }

                    $('#managers').html(options);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    createTree: function (data, parentId) {

        parentId = parentId || 0;
        var items = data.filter(function (el) {
            return el[1] == parentId;
        });

        if (items.length == 0) return null;

        var tree = $('<ul>').addClass('tree');
        tree.append(
          items.map(
            function (el) {
                var li = $('<li>').append(
                    $('<a>').html(el[2])
                  );
                  nestedTree = AMatrix.createTree(data, el[0]);

                  if (nestedTree !== null) {
                      var hashCode = nestedTree.html().toString().hashCode();
                      nestedTree.addClass('collapse panel-collapse')
                      .attr('id', hashCode);
                      li.find('a')
                        .attr('href', '#' + hashCode)
                        .attr('data-toggle', 'collapse')
                        .attr('aria-controls', hashCode)
                        .attr('role', 'menuitem')
                        .html(el[2] + '&nbsp;<i class="fas fa-chevron-down"></i>');
                      li.append(nestedTree).attr('role', 'presentation').addClass('have-child');
                  } else {
                      li.find('a').attr('data-warhause_code', el[0]).addClass('last_child_warhause');
                  }
                return li;
            }
          )
        );
        return tree;
    },
    getAM: function (val, manager, groups, xls) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 111;
        obj.data.GodeGroup = val;

        if (val === -1) {
            delete obj.data.GodeGroup;
            obj.data.CodeManager = manager;
        }
        if (manager === -1 && val === -1) {
            delete obj.data.GodeGroup;
            delete obj.data.CodeManager;
            obj.data.CodeWares = groups;
        }
        if (manager === -1 && val === -1 && groups == -1) {
            delete obj.data.GodeGroup;
            delete obj.data.CodeManager;
            delete obj.data.CodeWares;
            obj.data.ImportXls = xls;
        }

        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                AMatrix.JSON = JSON.parse(data);
                console.log(AMatrix.JSON);
                AMatrix.renderAM();
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });

    },
    renderAM: function () {
        var columnTitles = AMatrix.JSON.Warehouse;
        var arrLenth = columnTitles.length;
        var tableSort = Cookies.get('tableSort');
        if (typeof tableSort == typeof undefined) {
            tableSort = [1,3,2,4];
            for (var k = 4; k < columnTitles.length + 5; k++) {
                tableSort.push(k+1);
            }
            Cookies.set('tableSort', tableSort, { expires: 9999 });
        } else {
            tableSort = JSON.parse(tableSort);
        }
        
        var tHead = '<thead>';

        tHead += '<tr>';
        tHead += '<th data-header="1" class="text-center dragtable-drag-boundary"><div class="thead">код</div>код</th>';
        tHead += '<th data-header="2" class="text-center dragtable-drag-boundary"><div class="thead">назва</div>назва</th>';
        tHead += '<th data-header="3" class="text-center dragtable-drag-boundary"><div class="thead">ст. код</div>ст. код</th>';
        tHead += '<th data-header="4" class="text-center dragtable-drag-boundary"><div class="thead">зат.</div>ст. код</th>';
        for (var i = 0; i < arrLenth; i++){
            tHead += '<th data-ewh="' + columnTitles[i][0] + '" data-header="' + (i + 5) + '" class="text-center dragtable-drag-handle"><div class="thead">' + columnTitles[i][1] + '</div>' + columnTitles[i][1] + '</th>';
        }
        tHead += '</tr>';
        tHead += '</thead>';

        var tBody = '<tbody>';
        var Data = AMatrix.JSON.Data.Data;
        arrLenth = Data.length;
        for (var j = 0; j < arrLenth; j++) {
            var colspan = ((Data[j].length - 9) / 3) + 4;
            if (AMatrix.prevSort != Data[j][5]) {
                switch (parseInt(Data[j][5])) {
                    case -1:
                        tBody += '<tr class="text-left"><th class="text-left table-warning" colspan="' + colspan + '">добавили</th></tr>';
                        break;
                    case 0:
                        tBody += '<tr class="text-left"><th class="text-left table-warning" colspan="' + colspan + '">видалили</th></tr>';
                        break;
                    default:
                        tBody += '<tr class="text-left"><th class="text-left table-warning" colspan="' + colspan + '">без змін</th></tr>';
                        console.log(AMatrix.prevSort != Data[j][5]);
                }
                AMatrix.prevSort = Data[j][5];
            }

            tBody += '<tr>';

            var Catch = [];
            for (var i = 0; i < Data[j].length; i++) {
                var readOnly = '';
                if (!AMatrix.JSON.IsAccept) {
                    readOnly = 'disabled';
                }
                var reg1 = new RegExp('^EWH', 'i');
                var isEWH = reg1.test(AMatrix.JSON.Data.InfoColumn[i]);
                if (isEWH) {
                    var colnumber = AMatrix.JSON.Data.InfoColumn[i].split(/_/)[1];
                    var colIndex = 0;
                    for (var t = 0; t < AMatrix.JSON.Warehouse.length; t++){
                        if (AMatrix.JSON.Warehouse[t][0] == parseInt(colnumber)) {
                            colIndex = t + 5;
                        }
                    }
                    Catch.push(Data[j][i],colIndex);
                }
                var reg3 = new RegExp('^DWH', 'i');
                var isDWH = reg3.test(AMatrix.JSON.Data.InfoColumn[i]);
                if (isDWH) {
                    var tableClass = '';
                    switch (parseInt(Data[j][i])) {
                        case -1:
                            tableClass = 'table-danger';
                            break;
                        case 1:
                            tableClass = 'table-success';
                            break;
                        default:
                            tableClass = '';
                            break;
                    }

                    Catch = [tableClass];
                }
                var reg2 = new RegExp('^WH', 'i');
                var isWH = reg2.test(AMatrix.JSON.Data.InfoColumn[i]);
                if (isWH) {
                    tBody += '<td class="' + Catch[0] + '"><input type="number" class="form-control" value="' + Catch[1] + '"/><span class="text-small old-value">' + Data[j][i] + '<span></td>';
                    colspan++;
                }
                if (!isEWH && !isWH && !isDWH && i < 4 && i != 1 && i != 2 && i != 3) {
                    tBody += '<td><div>' + Data[j][i] + '</div></td>';
                    colspan++;
                }
                if (!isEWH && !isWH && !isDWH && i == 1) {
                    tBody += '<td title="' + Data[j][7] + ' / ' + Data[j][6] + '">' + Data[j][i] + '<div>' + Data[j][i] + '<div></td>';
                    colspan++;
                }
                if (!isEWH && !isWH && !isDWH && i == 2) {
                    tBody += '<td title="' + Data[j][3] + '"><div><input class="form-control" value="' + Number(Data[j][i]) + '" title="' + Data[j][3] + '"/></div></td>';
                    colspan++;
                }
                if (!isEWH && !isWH && !isDWH && i == 3) {
                    tBody += '<td class="status" title="' + Data[j][8] + '"><div class="flex"><div class=" ' + (parseInt(Data[j][4]) == 1 ? 'checked ' : ' ') + readOnly + '"><input ' + (parseInt(Data[j][4]) == 1 ? 'checked ' : ' ') + readOnly + ' name="status' + j + '" type="checkbox" class="checkbox" title="затвердити" value="1" /></div><div class=" ' + (parseInt(Data[j][4]) == -1 ? 'checked ' : ' ') + readOnly + '"><input ' + (parseInt(Data[j][4]) == -1 ? 'checked ' : ' ') + readOnly + ' name="status' + j + '" type="checkbox" class="checkbox"  title="відмовити" value="-1"/></div></div></td>';
                    colspan++;
                }
            }

            tBody += '</tr>';
        }
        tBody += '</tbody>';

        $('#tableContent').html('<table class="table table-bordered table-fixed">' + tHead + tBody + '</table>');
        $('#tableContent table').dragtable();
        $('#tableContent table .thead').each(function () {
            var el = $(this);
            el.width(el.closest('th').outerWidth()-2);
            el.height(el.closest('th').outerHeight()-2);
        });
        $('#tableContent table').dragtable('order', tableSort);

    },
    onFocus: function(el){
        $(el).select();
    },
    saveAM: function () {
        var rows = $('tr[is-change="true"]');
        var titles = $('thead th');
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 112;
        obj.data.Data = [];
        obj.data.Warehouse = [];

        if (rows.length <= 0) {
            alert('Данні не змінилися!');
            return;
        }

        for (var j = 4; j < titles.length; j++){
            obj.data.Warehouse.push($(titles[j]).data('ewh'));
        }

        rows.each(function (index) {
            var el = $(this);
            var cells = el.find('td');
            obj.data.Data[index] = [];
            obj.data.Data[index].push($(cells[0]).text());
            obj.data.Data[index].push($(cells[2]).text());
            if ($(cells[3]).find('input:checked').length > 0) {
                obj.data.Data[index].push($($(cells[3]).find('input:checked')[0]).val());
            } else {
                obj.data.Data[index].push(0);
            }

            for (var i = 4; i < cells.length; i++) {
                obj.data.Data[index].push($(cells[i]).find('input').val());
            }
        });

        console.log(obj.data);
        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = JSON.parse(data);
                console.log(result);
                if (result.TextError == "Ok") {
                    alert('Данні успішно збережено!');
                } else {
                    alert('Помилка: ' + result.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    importXL: function () {
        $input = $(this);
        var inputFiles = this.files;
        if (inputFiles == undefined || inputFiles.length == 0) return;
        var inputFile = inputFiles[0];

        var reader = new FileReader();
        reader.onloadstart = function (event) {
            $('#import_xl').html('<div class="loader loader-adaptive"></div>');
        };
        reader.onload = function (event) {
            AMatrix.getAM(-1, -1, -1, event.target.result);
            $('#import_xl').html('CSV');
        };
        reader.onerror = function (event) {
            alert("Сталася помилка: " + event.target.error.code);
        };
        reader.readAsText(inputFile);

    },
    controlsInit: function () {
        $('#import_xl').click(function () {
            $('#file-upload').click();
        });
        $('#file-upload').change(AMatrix.importXL);
        $('#tableContent').on('click', '.status div', function () {
            var el = $(this);
            if (el.hasClass("disabled")) return;
            var sibling = el.siblings('div').find('input')[0];
            var input = el.find('input');
            if ($(sibling).prop('checked')) {
                $(sibling).prop('checked', false);
            }
            input.prop('checked', true);
            input.change();
        });
        $('#tableContent').on('change', 'input', function () {
            var el = $(this);
            $(el.closest('tr')).attr('is-change', 'true');
            $(el.closest('td')).find('div').each(function () {
                $(this).removeClass('checked');
            });
            el.closest('div').addClass('checked');
        });
        $('#tableContent').on('change', 'input[type="number"]', function () {
            var el = $(this);
            var old = parseInt(el.siblings('.old-value').text());
            var curent = parseInt(el.val());

            if (curent < old) {
                el.removeClass('text-danger').addClass('text-success font-weight-bold');
            }
            if (curent > old) {
                el.removeClass('text-success').addClass('text-danger font-weight-bold');
            }
            if (curent == old) {
                el.removeClass('text-success text-danger font-weight-bold');
            }
        });
        $('#tableContent').on('focus', 'input[type="number"]', function () {
            AMatrix.onFocus(this);
        });
        $(document)
            .on('show.bs.collapse', 'ul[role="menu"]', function (e) {
                $(e.target).prev('a[role="menuitem"]').addClass('active');
            })
            .on('hide.bs.collapse', 'ul[role="menu"]', function (e) {
                $(e.target).prev('a[role="menuitem"]').removeClass('active');
            });

        $(document).on('click', 'a[data-toggle="collapse"]', function (event) {

            event.stopPropagation();
            event.preventDefault();

            var drop = $(this).closest(".dropdown");
            $(drop).addClass("open");

            $('.collapse.in').collapse('hide');
            var col_id = $(this).attr("href");
            $(col_id).collapse('toggle');

        });
        $(document).on('dragtablestop', '#tableContent table', function (event) {
            var items = $('#tableContent th');
            var table_sort = [];
            items.each(function () {
                table_sort.push($(this).data('header'));
            });
            console.log(table_sort);
            Cookies.set('tableSort', table_sort, { expires: 9999 });
        });

        $(document).on('click', '.last_child_warhause', function (event) {
            var el = $(this);
            var val = el.data('warhause_code');
            var text = el.text();
            $('#Warehouse button .dropdowntree-name').html(text);
            AMatrix.getAM(val);

        });

        $('#managers').change(function () {
            AMatrix.getAM(-1, $(this).val());
        });

        $('#code_group_tag').keyup(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var mEvent = e || window.event;
            var mPressed = mEvent.keyCode || mEvent.which;
            if (mPressed == 13) {
                AMatrix.getAM(-1, -1, $('#code_group_tag').val());
            }
        });

        $('#saveAM').click(AMatrix.saveAM);
    },
    init: function () {
        if (window.isLogin){
            AMatrix.getData();
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    AMatrix.init();
});