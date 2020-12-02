var AMatrix = {
    JSON: {},
    prevSort: -2,
    lastRequest:[],
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
                AMatrix.JSON = data;
                if (typeof AMatrix.JSON.GroupWares != typeof undefined) {
                    var tree = AMatrix.createTree(AMatrix.JSON.GroupWares);
                    $('#Warehouse li').html(tree);
                }

                if (typeof AMatrix.JSON.Manager != typeof undefined) {
                    var options = '<option value="-1">--Вибрати менеджера--</option>';
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

        AMatrix.lastRequest = [val, manager, groups, xls];
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 111;
        obj.data.GodeGroup = val;

        obj.data.Type = parseInt($('input[name="am_type"]:checked').val());

        if (val === -1) {
            delete obj.data.GodeGroup;
            obj.data.CodeManager = manager;
        }
        if (manager === -1 && val === -1) {
            delete obj.data.GodeGroup;
            delete obj.data.CodeManager;
            obj.data.CodeWares = groups;
        }
        if (manager === -1 && val === -1 && groups === -1) {
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
                AMatrix.JSON = data;
                console.log(AMatrix.JSON);
                AMatrix.renderAM();
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });

    },
    renderAM: function (isHide) {
        var isNovelty = parseInt($('input[name="am_type"]:checked').val()) === 1;
        var readOnly = '';
        if (!AMatrix.JSON.IsAccept) {
            readOnly = 'disabled';
        }
        var columnTitles = AMatrix.JSON.Warehouse;
        var arrLenth = columnTitles.length;
        var tableSort = Cookies.get('tableSort');
        if (typeof tableSort == typeof undefined) {
            tableSort = [1, 3, 2, 4];
            for (var k = 4; k < columnTitles.length + 5; k++) {
                tableSort.push(k + 1);
            }
            Cookies.set('tableSort', tableSort, { expires: 9999 });
        } else {
            tableSort = JSON.parse(tableSort);
        }

        var WaresIsVisible = Cookies.get('WaresIsVisible');
        if (typeof WaresIsVisible == typeof undefined) {
            WaresIsVisible = [];
            console.log(columnTitles);
            for (var k = 0; k < columnTitles.length; k++) {
                WaresIsVisible.push([columnTitles[k][0], 1]);
            }
            Cookies.set('WaresIsVisible', WaresIsVisible, { expires: 9999 });
        } else {
            WaresIsVisible = JSON.parse(WaresIsVisible);
        }

        var tHead = '<thead>';

        tHead += '<tr>';
        tHead += '<th data-header="1" class="text-center dragtable-drag-boundary"><div class="thead">код</div>код</th>';
        tHead += '<th data-header="2" class="text-center dragtable-drag-boundary"><div class="thead">назва</div>назва</th>';
        if (isNovelty) {
            tHead += '<th data-header="3" class="text-center dragtable-drag-boundary"><div class="thead status_all"><div class="clearfix ln18px">дата </div><input id="start_novelty_date" class="form-control novelty_date"/></div> <br /> <br /></th>';
        }
        else {
            tHead += '<th data-header="3" class="text-center dragtable-drag-boundary"><div class="thead">ст. код</div>ст. код</th>';
        }
        
        tHead += '<th data-header="4" class="text-center dragtable-drag-boundary"><div class="thead status status_all"><div class="clearfix">зат. </div><div class="flex"><div class="' + readOnly + ' st_all"><input ' + readOnly + ' name="status" type="checkbox" class="checkbox" title="затвердити" value="1" /></div><div class="' + readOnly + ' st_all"><input ' + readOnly + ' name="status" type="checkbox" class="checkbox"  title="відмовити" value="-1"/></div></div></div>ст. код</th>';
        for (var i = 0; i < arrLenth; i++) {
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
                var reg1 = new RegExp('^EWH', 'i');
                var isEWH = reg1.test(AMatrix.JSON.Data.InfoColumn[i]);
                if (isEWH) {
                    var colnumber = AMatrix.JSON.Data.InfoColumn[i].split(/_/)[1];
                    var colIndex = 0;
                    for (var t = 0; t < AMatrix.JSON.Warehouse.length; t++) {
                        if (AMatrix.JSON.Warehouse[t][0] == parseInt(colnumber)) {
                            colIndex = t + 5;
                        }
                    }
                    Catch.push(Data[j][i], colIndex);
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
                    if (isNovelty) {
                        tBody += '<td title="' + Data[j][3] + '"><div><input class="form-control novelty_date" value="' + Data[j][i] + '" title="' + Data[j][3] + '"/></div></td>';
                    } else {
                        tBody += '<td title="' + Data[j][3] + '"><div><input class="form-control" value="' + Number(Data[j][i]) + '" title="' + Data[j][3] + '"/></div></td>';
                    }
                    colspan++;
                }
                if (!isEWH && !isWH && !isDWH && i == 3) {
                    tBody += '<td class="status" title="' + Data[j][8] + '"><div class="flex"><div class="' + (parseInt(Data[j][4]) == 1 ? 'checked ' : '') + readOnly + '"><input ' + (parseInt(Data[j][4]) == 1 ? 'checked ' : ' ') + readOnly + ' name="status' + j + '" type="checkbox" class="checkbox" title="затвердити" value="1" /></div><div class="' + (parseInt(Data[j][4]) == -1 ? 'checked ' : '') + readOnly + '"><input ' + (parseInt(Data[j][4]) == -1 ? 'checked ' : ' ') + readOnly + ' name="status' + j + '" type="checkbox" class="checkbox"  title="відмовити" value="-1"/></div></div></td>';
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
            el.width(el.closest('th').outerWidth() - 2);
            el.height(el.closest('th').outerHeight() - 2);
        });
        $('#tableContent table').dragtable('order', tableSort);

        if (isNovelty) {
            $('.novelty_date').each(function () {
                $(this).datepicker({
                    format: 'dd-mm-yyyy',
                    language: 'uk'
                });
            });

            $('#start_novelty_date').change(function () {
                var el = $(this);
                $('.novelty_date').each(function () {
                    $(this).val(el.val()).datepicker("update");
                });
            });
        }

        var renderSettings = '';
        for (var j = 0; j < WaresIsVisible.length; j++) {
            renderSettings += '<tr>';
            renderSettings += '<td>' + columnTitles[j][1] + '</td>';
            renderSettings += '<td><input data-field-code="' + WaresIsVisible[j][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + WaresIsVisible[j][0] + '" value="1"  ' + (WaresIsVisible[j][1] == 1 ? 'checked' : '') + '/></td>';
            renderSettings += '<td><input data-field-code="' + WaresIsVisible[j][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + WaresIsVisible[j][0] + '" value="0"  ' + (WaresIsVisible[j][1] == 0 ? 'checked' : '') + '/></td>';
            renderSettings += '<tr>';

            if (WaresIsVisible[j][1] == 0) {
                var colIndex = $('#tableContent thead th').index($('#tableContent th[data-ewh="' + WaresIsVisible[j][0] + '"]'));
                console.log(colIndex);
                $('#tableContent thead th').eq(colIndex).hide();
                $('#tableContent td:nth-child(' + (colIndex+1) +')').hide();
            }
        }

        $('#tableContent').scroll();

        $('#render_settings_bar tbody').html(renderSettings);

    },
    onFocus: function (el) {
        $(el).select();
    },
    saveAM: function () {
        var rows = $('tbody tr[is-change="true"]');
        var titles = $('thead th[data-ewh]:visible');
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 112;
        obj.data.Data = [];
        obj.data.Warehouse = [];

        obj.data.Type = parseInt($('input[name="am_type"]:checked').val());

        if (rows.length <= 0) {
            alert('Данні не змінилися!');
            return;
        }

        for (var j = 0; j < titles.length; j++) {
            obj.data.Warehouse.push($(titles[j]).data('ewh'));
        }

        rows.each(function (index) {
            var el = $(this);
            var cells = el.find('td:visible');
            obj.data.Data[index] = [];
            obj.data.Data[index].push($(cells[0]).text());
            obj.data.Data[index].push($(cells[2]).find('input').val());

            if ($(cells[3]).find('div.checked').length > 0) {
                obj.data.Data[index].push($(cells[3]).find('div.checked input').val());
                console.log($(cells[3]).find('div.checked input').val());
            } else {
                obj.data.Data[index].push(0);
            }

            for (var i = 4; i < cells.length; i++) {
                obj.data.Data[index].push($(cells[i]).find('input').val());
            }
            console.log(obj.data.Data);
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
                var result = data;
                console.log(result);
                if (result.TextError == "Ok") {					
					
					
					if(result.BadWares.length>0) 
					   alert('У вас нема доступу до наступних товарів=>'+result.BadWares);
				    else
					if(result.BadWareHouse.length>0)
						  alert('У вас нема доступу до наступних складів=>'+result.BadWareHouse);
					  else
					if(result.BadLimit.length>1)
						alert('Перелімітили =>\n'+result.BadLimit);
					else
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
    importXL: function (e) {
        e.stopPropagation();
        $input = $(this);
        var inputFiles = this.files;
        if (typeof inputFiles === typeof undefined || inputFiles.length === 0) return;
        var inputFile = inputFiles[0];

        console.log(inputFiles);

        var reader = new FileReader();
        reader.onloadstart = function (event) {
        };
        reader.onload = function (event) {
            AMatrix.getAM(-1, -1, -1, event.target.result);
        };
        reader.onerror = function (event) {
            alert("Сталася помилка: " + event.target.error.code);
        };
        reader.readAsText(inputFile);

        $('#import_xl').prop('disabled', false);
        return false;
    },
    hideOrShowWarehouse: function () {
        var el = $(this);
        var ware = el.attr('data-field-code');
        var WaresIsVisible = JSON.parse(Cookies.get('WaresIsVisible'));

        for (var i = 0; i < WaresIsVisible.length; i++) {
            console.log(ware);
            console.log(WaresIsVisible[i][0]);
            if (WaresIsVisible[i][0] == ware) {
                WaresIsVisible[i][1] = el.val();
            }
        }

        Cookies.set('WaresIsVisible', WaresIsVisible, { expires: 9999 });

        AMatrix.renderAM();
    },
    clearAm: function () {
        if (!confirm('Очистити дані?')) {
            return;
        }
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 113;
        obj.data.Warehouse = [];
        obj.data.Wares = [];

        var warehouses = $('#tableContent th[data-ewh]:visible');
        var wares = $('#tableContent tbody tr:not([class="text-left"])');

        if (warehouses.length === 0 || wares.length === 0) {
            return;
        }

        warehouses.each(function () {
            obj.data.Warehouse.push(parseInt($(this).attr('data-ewh')));
        });

        wares.each(function () {
            obj.data.Wares.push(parseInt($(this).find('td:first-child').text()));
        });

        obj.data = JSON.stringify(obj.data);

        $.ajax({
            url: apiUrl,
            method: "POST",
            data: obj,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                var result = data;
                if (result.TextError == "Ok") {
                    var last = AMatrix.lastRequest;
                    AMatrix.getAM(last[0], last[1],last[2], last[3]);
                } else {
                    alert('Помилка: ' + result.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    controlsInit: function () {
        $('#clear_am').click(AMatrix.clearAm);
        $('#render_settings_bar').on('change', '.rnd_setting_control', AMatrix.hideOrShowWarehouse);
        $('#render_settings, .close_render_settings').click(function () {
            $('#render_settings_bar').toggle(300);
        });
        $('#import_xl').click(function (e) {
            e.stopPropagation();
            $('#import_xl').prop('disabled', true);
            $('#file-upload').click();
            return false;
        });
        $('#file-upload').change(AMatrix.importXL);
        $('#tableContent').on('click', '.status div > div:not(.st_all)', function () {
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
        $('#tableContent').on('click', '.st_all', function () {
            var el = $(this);
            if (el.hasClass("disabled")) return;
            var sibling = el.siblings('div').find('input')[0];
            var input = el.find('input');
            if ($(sibling).prop('checked')) {
                $(sibling).prop('checked', false);
            }
            $(input.closest('th')).find('div.checked').removeClass('checked');
            input.closest('div').addClass('checked');
            $('.status input[value="' + input.val() + '"]').each(function () {
                var item = $(this);
                item.prop('checked', true);
                item.change();
            });
        });
        $('#tableContent').on('change', 'input:not(input[name="status"])', function () {
            var el = $(this);
            $(el.closest('tr')).attr('is-change', 'true');
            $(el.closest('td')).find('div.checked').removeClass('checked');
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
            if (mPressed === 13) {
                AMatrix.getAM(-1, -1, $('#code_group_tag').val());
            }
        });

        $('input[name="am_type"]').change(function () {
            if (AMatrix.lastRequest.length === 0) {
                alert('Відсутні параметри');
            } else {
                var last = AMatrix.lastRequest;
                AMatrix.getAM(last[0], last[1], last[2], last[3]);
            }
        });

        $('#saveAM').click(AMatrix.saveAM);
    },
    init: function () {
        if (window.isLogin) {
            AMatrix.getData();
        }
        this.controlsInit();
    }
};

$(document).ready(function () {
    if (window.isLogin) {
        AMatrix.init();
    }
});