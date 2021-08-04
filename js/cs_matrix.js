var CSMatrix = {
    JSON: {},
    prevSort: -2,
    getData: function () {
        var data = {};
        data.CodeData = 160;

        $.ajax({
            data: JSON.stringify(data),
            success: function (data) {
                CSMatrix.JSON = data;
                if (typeof CSMatrix.JSON.GroupWares != typeof undefined) {
                    var tree = CSMatrix.createTree(CSMatrix.JSON.GroupWares);
                    $('#Warehouse li').html(tree);
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
                    nestedTree = CSMatrix.createTree(data, el[0]);

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
    getCS: function (group, ware) {

        var data = {};
        data.CodeData = 161;      

        if (group != -1) {
            data.CodeGroup = group;
        } else if (ware != -1) {
            data.CodeWares = ware;
        }

        $.ajax({    
            data: JSON.stringify(data),            
            success: function (data) {

                if (data.State == 0) {

                    CSMatrix.JSON = data;
                    console.log(CSMatrix.JSON);
                    CSMatrix.renderCS();

                } else {
                    alert('Помилка: ' + data.TextError);
                }

            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });

    },
    renderCS: function () {

        var WH = CSMatrix.JSON.Warehouse;
        var Week = CSMatrix.JSON.Week;
        var WeekLength = CSMatrix.JSON.Week.length;
        var Data = CSMatrix.JSON.Data;

        CSMatrix.renderSettings(WH);

        var cWaresIsVisible = Cookies.get('WaresIsVisible');
        var WaresIsVisible = [];
        WaresIsVisible = JSON.parse(cWaresIsVisible);


        var tHead = '<thead>';

        tHead += '<tr>';
        tHead += '<th>Склад</th>';
        for (var i = 0; i < WeekLength; i++) {
            tHead += '<th >' + Week[i][1] + '</th>';
        }
        tHead += '</tr>';
        tHead += '</thead>';

        var tBody = '<tbody>';

        for (var i = 0; i < WH.length; i++) {
            if (CSMatrix.WHIsVisible(WH[i][0], WaresIsVisible)) {
                tBody += '<tr id="' + WH[i][0] + '">';
                tBody += '<td>' + WH[i][1] + '</td>';
                for (var j = 0; j < WeekLength; j++) {
                    tBody += '<td ><input type="number" class="form-control" value="' + CSMatrix.coef(WH[i][0], Data, Week[j][0]) + '"/></td>';
                }
                tBody += '</tr>';
            }
        }

        tBody += '</tbody>';

        $('#tableContent').html('<table class="table table-bordered table-fixed">' + tHead + tBody + '</table>');
        $('#tableContent table').dragtable();
        $('#tableContent table .thead').each(function () {
            var el = $(this);
            el.width(el.closest('th').outerWidth() - 2);
            el.height(el.closest('th').outerHeight() - 2);
        });
        $('#tableContent').scroll();
    },
    coef: function (WH, Data, Week) {
        for (var i = 0; i < Data.length; i++) {
            if (Data[i][1] > WH) return 1;
            if (Data[i][1] == WH && Data[i][0] == Week) return Data[i][2];
        }
        return 1;
    },
    renderSettings: function (WH) {
        // отримаєм куку з складами, інакше створюємо куку
        var cWaresIsVisible = Cookies.get('WaresIsVisible');
        var WaresIsVisible = [];
        if (typeof cWaresIsVisible == typeof undefined) {

            console.log(WH);
            for (var k = 0; k < WH.length; k++) {
                WaresIsVisible.push([WH[k][0], 1]);
            }
            Cookies.set('WaresIsVisible', WaresIsVisible, { expires: 9999 });
        } else {
            WaresIsVisible = JSON.parse(cWaresIsVisible);
        }

        var renderSettings = '';
        for (var j = 0; j < WH.length; j++) {
            renderSettings += '<tr>';
            renderSettings += '<td>' + WH[j][1] + '</td>';
            renderSettings += '<td><input data-field-code="' + WH[j][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + WH[j][0] + '" value="1"  ' + (CSMatrix.WHIsVisible(WH[j][0], WaresIsVisible) ? 'checked' : '') + '/></td>';
            renderSettings += '<td><input data-field-code="' + WH[j][0] + '" class="rnd_setting_control" type="radio" name="rnd_setting_' + WH[j][0] + '" value="0"  ' + (CSMatrix.WHIsVisible(WH[j][0], WaresIsVisible) ? '' : 'checked') + '/></td>';
            renderSettings += '<tr>';

            if (WaresIsVisible[j][1] == 0) {
                var colIndex = $('#tableContent thead th').index($('#tableContent th[data-ewh="' + WaresIsVisible[j][0] + '"]'));
                console.log(colIndex);
                $('#tableContent thead th').eq(colIndex).hide();
                $('#tableContent td:nth-child(' + (colIndex + 1) + ')').hide();
            }
        }

        $('#render_settings_bar tbody').html(renderSettings);
    },
    WHIsVisible: function (CodeWarehouse, WaresIsVisible) {
        for (var j = 0; j < WaresIsVisible.length; j++) {
            if (CodeWarehouse == WaresIsVisible[j][0])
            {
                return WaresIsVisible[j][1]==1;
            }
        }
        return true;
        
    },
    saveCS: function () {

        var data = {};
        data.CodeData = 162;

        if (typeof CSMatrix.JSON.CodeGroupOrWares == typeof undefined) return;
        data.CodeGroupOrWares = CSMatrix.JSON.CodeGroupOrWares;

        var cWaresIsVisible = Cookies.get('WaresIsVisible');
        var WaresIsVisible = [];
        WaresIsVisible = JSON.parse(cWaresIsVisible);
        data.Warehouse = [];
        for (var i = 0; i < WaresIsVisible.length; i++) {
            if (WaresIsVisible[i][1] == 1) data.Warehouse[i] = WaresIsVisible[i][0];
        }

        data.StartWeek = CSMatrix.JSON.Week[0][0];
        data.Weeks = CSMatrix.JSON.Week.length;

        var rows = $('#tableContent tbody tr');
        data.Data = [];
        var k = 0;
        rows.each(function (index) {
            var el = $(this);
            var cells = el.find('td');
            for (var i = 1; i < cells.length; i++) {
                if (parseFloat($(cells[i]).find('input').val()) != 1) {
                    data.Data[k] = [data.StartWeek + i - 1, el[0].getAttribute('id'), $(cells[i]).find('input').val()];
                    k++;
                }
            }
            //$(rows[index]).find('td id')      $(cells[i]).find('input').val()
        });
        $.ajax({            
            data: JSON.stringify(data),            
            success: function (data) {
                var result = data;
                console.log(result);
                if (result.TextError == "Ok") {		
					
                } else {
                    alert('Помилка: ' + result.TextError);
                }
            },
            error: function () {
                alert('Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
            }
        });
    },
    hideOrShowWarehouse: function () {
        var el = $(this);
        var ware = el.attr('data-field-code');
        var WaresIsVisible = JSON.parse(Cookies.get('WaresIsVisible'));

        for (var i = 0; i < WaresIsVisible.length; i++) {
            console.log(ware);
            console.log(WaresIsVisible[i][0]);
            if (WaresIsVisible[i][0] == ware) {
                WaresIsVisible[i][1] =  parseInt(el.val());
            }
        }

        Cookies.set('WaresIsVisible', WaresIsVisible, { expires: 9999 });

        CSMatrix.renderCS();
    },
    controlsInit: function () {
        $('#render_settings_bar').on('change', '.rnd_setting_control', CSMatrix.hideOrShowWarehouse);
        $('#render_settings, .close_render_settings').click(function () {
            $('#render_settings_bar').toggle(300);
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
            CSMatrix.getCS(val);

        });
        $('#code_group_tag').keyup(function (e) {
            e.stopPropagation();
            e.preventDefault();
            var mEvent = e || window.event;
            var mPressed = mEvent.keyCode || mEvent.which;
            if (mPressed === 13) {
                CSMatrix.getCS(-1, $('#code_group_tag').val());
            }
        });      
        $('#saveAM').click(CSMatrix.saveCS);
    },
    init: function () {
        if (window.isLogin) {
            CSMatrix.getData();
        }
        this.controlsInit();
    }
};

$(document).ready(function () {
    if (window.isLogin) {
        CSMatrix.init();
    }
});