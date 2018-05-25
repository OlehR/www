var AMatrix = {
    JSON: {},
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
    getAM: function (val) {
        var obj = {};
        obj.data = {};
        obj.data.CodeData = 111;
        obj.data.GodeGroup = val;
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
        var tHead = '<div class="row no-gutters">';

        tHead += '<div data-column="col-1" class="col-md-1 text-center"><div class="table_header table-bordered"><h7>код</h7></div></div>';
        tHead += '<div data-column="col-2" class="col-md-2 text-center"><div class="table_header table-bordered"><h7>назва</h7></div></div>';
        tHead += '<div data-column="col-3" class="col-md-1 text-center"><div class="table_header table-bordered"><h7>ст. код</h7></div></div>';
        tHead += '<div data-column="col-4" class="col-md-1 text-center"><div class="table_header table-bordered"><h7>зат.</h7></div></div>';
        for (var i = 0; i < arrLenth; i++){
            tHead += '<div data-column="col-'+(i+4)+'" class="col-md-1 text-center"><div class="table_header table-bordered"><h7>' + columnTitles[i][1] + '</h7></div></div>';
        }
        tHead += '<div/>';

        var tBody = '';
        var Data = AMatrix.JSON.Data.Data;
        arrLenth = Data.length;
        for (var j = 0; j < arrLenth; j++) {

            tBody += '<div class="row no-gutters">';

            var Catch = '';
            for (var i = 0; i < Data[j].length; i++) {
                switch (i) {
                    case AMatrix.JSON.Data.InfoColumn.indexOf('NAME_WARES'):
                        tBody += '<div data-column="col-4" class="col-md-2 text-center"><div class="table-bordered">' + Data[j][i] + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_3'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_3'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] +'/'+ Catch) + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_9'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_9'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] + '/' + Catch) + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_15'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_15'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] + '/' + Catch) + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_22'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_22'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] + '/' + Catch) + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_57'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_57'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] + '/' + Catch) + '</div></div>';
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('EWH_68'):
                        Catch = Data[j][i];
                        break
                    case AMatrix.JSON.Data.InfoColumn.indexOf('WH_68'):
                        tBody += '<div data-column="col-' + (i - 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + (Data[j][i] + '/' + Catch) + '</div></div>';
                        break
                    default:
                        tBody += '<div data-column="col-' + (i + 1) + '" class="col-md-1 text-center"><div class="table-bordered">' + Data[j][i] + '</div></div>';
                }
            }

        tBody += '<div/>';
        }

        $('#tableContent').html(tHead + tBody);
    },
    controlsInit: function () {
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

        $(document).on('click', '.last_child_warhause', function (event) {
            var el = $(this);
            var val = el.data('warhause_code');
            var text = el.text();
            $('#Warehouse button .dropdowntree-name').html(text);
            AMatrix.getAM(val);

        });
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