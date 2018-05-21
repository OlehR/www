Table.renderDesctopOrder = function () {
    var arrLength = this.JSON.OrderDetail.Data.length;
    var title = 'день';

    if (Table.sort != 'days') {
        title = 'тиждень';
    }
    $('#orderHeader').html('№ ' + this.JSON.OrderHead.NUMBER_ORDER_SUPPLY + ', ' + this.JSON.OrderHead.NAME + ', ' + this.JSON.OrderHead.GROUP_NAME + '(' + this.JSON.OrderHead.CODE_GROUP_SUPPLY + ')');
    var arr = this.JSON.OrderDetail.Data;
    var table = '<table class="table table-bordered table-striped table-responsive detail" style="margin-top:15px">';
    table += '<thead>';
    table += '<tr>';

    Table.renderSettings.colspan = 0;
    for (var i = 0; i < Table.renderSettings.length; i++) {
        if (Table.renderSettings[i][1] == 1) {
            Table.renderSettings.colspan++;
            switch (i) {
                case Table.JSON.OrderDetail.InfoColumn.indexOf('CODEWARES'):
                    table += '<th id="sort_by_brand">' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                    table += '<th id="sort_by_title">' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                    if (Table.sort == 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                    if (Table.sort != 'days')
                        table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    table += '<th>заказ уп.</th>';
                    break;
                case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    table += '<th>логістична к-сть п.</th>';
                    break;
                default:
                    table += '<th>' + Table.JSON.OrderField.Data[i][3] + '</th>';
                    break;
            }
        }
    }

    table += '</tr>';
    table += '</thead>';
    table += '<tbody>';

    if (arr.indexOfType(2)) {
        var arrType2 = arr.GetByType(2);
        var arrType2Length = arrType2.length;
        table += Table.renderRawDsc(arrType2Length, arrType2, title);
        table += '<tr><td colspan="' + Table.renderSettings.colspan + '" class="text-danger">Позиції які не потрапили в автозамовлення!</td></tr>';
        var arrTypeOther = arr.GetByType(0, 1);
        var arrTypeOtherLength = arrTypeOther.length;
        if (arrTypeOtherLength > 0) {
            table += Table.renderRawDsc(arrTypeOtherLength, arrTypeOther, title);
        }
    } else {
        table += Table.renderRawDsc(arrLength, arr, title);
    }
    table += '</tbody>';
    table += '</table>';

    $('#tableContent').html(table);
    $('#tableContent').after('<div id="info" class="desctopInfo bg-primary"><div class="container"><div></div>');
};

Table.renderRawDsc = function (arrLength, arr, title) {
    var table = '';
    var isEdit = this.JSON.OrderHead.ISEDIT;
    for (var i = 0; i < arrLength; i += 1) {
        if (Table.seeBrands && (Table.prevBrand !== arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')])) {
            table += '<tr>';
            table += '<td colspan="15" class="font-weight-bold">' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')] + '</td>';
            table += '</tr>';
        }
        Table.prevBrand = arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')];
        table += '<tr rowIndex="' + arr[i][arr[i].length - 1] + '" class="dataRow';
        if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')] != "") {
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')]) {
                case 'y':
                    table += ' table-warning';
                    break;
                case 'r':
                    table += ' table-danger';
                    break;
                case 'g':
                    table += ' table-success';
                    break;
            }
        }
        table += '">';

        for (var j = 0; j < Table.renderSettings.length; j++) {
            if (Table.renderSettings[j][1] == 1) {
                var classes = [];

                if (Table.JSON.OrderField.Data[j][6] == "b") {
                    classes.push("font-weight-bold");
                }

                switch (Table.JSON.OrderField.Data[j][7]) {
                    case "i":
                        classes.push("text-info");
                        break;
                    case "w":
                        classes.push("text-warning");
                        break;
                    case "d":
                        classes.push("text-danger");
                        break;
                    case "s":
                        classes.push("text-success");
                        break;
                }
                switch (j) {
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY'):
                        classes.push('orderCount');
                        table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '><input ' + (!isEdit ? 'readonly' : '') + '  class="form-control quantyty" data-field-type="quantyty" type="number" value="' + arr[i][j] + '"/></td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                        if(Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                        if (Table.sort == 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                        if (Table.sort != 'days')
                            table += '<td ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                        if (Table.sort != 'days')
                            table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                        if (Table.sort != 'days')
                            table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY'):
                        table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control pack" data-field-type="pack" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')])) + '" /></td>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                        table += '<td  ' + (classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '') + '>' + arr[i][j] + '</td>';
                        table += '<td><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control logistic" data-field-type="logistic" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')])) + '" /></td>';
                        break;
                    default:
                        table += '<td '+(classes.length > 0 ? 'class="' + classes.join(' ') + '"' : '')+'>' + arr[i][j] + '</td>';
                        break;
                }
            }
        }
        table += '</tr>';
    }

    return table;
};

Table.renderRawMob = function (arrLength, arr, title) {
    var isEdit = Table.JSON.OrderHead.ISEDIT;
    var table = '';
    for (var i = 0; i < arrLength; i += 1) {
        table += '<div rowIndex="' + arr[i][arr[i].length - 1] + '" class="row dataRow';
        if (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')] != "") {
            table += ' no_bg_style';
            switch (arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('COLOR_WARES')]) {
                case 'y':
                    table += ' table-warning';
                    break;
                case 'r':
                    table += ' table-danger';
                    break;
                case 'g':
                    table += ' table-success';
                    break;
            }
        }
        table += '">';
        if (Table.seeBrands && (Table.prevBrand !== arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')])) {
            table += '<div class="col-12 brand_name font-weight-bold text-center border border-top-0 border-left-0 border-right-0 border-dark"><h5>' + arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')] + '</h5></div>';
        }
        Table.prevBrand = arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_BRAND')];

        for (var j = 0; j < Table.renderSettings.length; j++) {
            if (Table.renderSettings[j][1] == 1) {

                var classes = [];

                if (Table.JSON.OrderField.Data[j][6] == "b") {
                    classes.push("font-weight-bold");
                }

                switch (Table.JSON.OrderField.Data[j][7]) {
                    case "i":
                        classes.push("text-info");
                        break;
                    case "w":
                        classes.push("text-warning");
                        break;
                    case "d":
                        classes.push("text-danger");
                        break;
                    case "s":
                        classes.push("text-success");
                        break;
                }

                switch (j) {
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('CODEWARES'):
                        table += '<div id="sort_by_brand" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('NAME_WARES'):
                        table += '<div id="sort_by_title" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY'):
                        classes.push('orderCount');
                        table += '<div id="sort_by_title" class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + '  class="form-control quantyty" data-field-type="quantyty" type="number" value="' + arr[i][j] + '"/></div>';
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_1'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_2'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_3'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_4'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('D_SALE_5'):
                        if (Table.sort == 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_1'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_2'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_3'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_4'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('N_SALE_5'):
                        if (Table.sort != 'days') {
                            table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                            table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        }
                        break;
                    case Table.JSON.OrderDetail.InfoColumn.indexOf('PACK'):
                        table += '<div class="col-4">заказ уп.:</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control pack" data-field-type="pack" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) / parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK_SUPPLY')])) + '" /></div>';
                        table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        table += '<div class="col-4">логістична к-сть п.:</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '"><input ' + (!isEdit ? 'readonly' : '') + ' class="form-control logistic" data-field-type="logistic" type="number" value="' + (parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('QUANTITY')]) * parseFloat(arr[i][Table.JSON.OrderDetail.InfoColumn.indexOf('PACK')])) + '" /></div>';
                        break;
                    default:
                        table += '<div class="col-4">' + Table.JSON.OrderField.Data[j][3] + ':</div>';
                        table += '<div class="col-8 ' + classes.join(' ') + '">' + arr[i][j] + '</div>';
                        break;
                }
            }
        }
        table += '</div>';
    }
    return table;
};

Table.onFocus = function () {
    var el = $(this);
    if (el.val() != '' && !el.prop('readonly'))
        el.attr('data-old', el.val());
    var row = el.closest('.dataRow');
    row.addClass('table-warning');
    var rowIndex = parseInt(row.attr('rowIndex'));
    Table.globalCurrentRow = rowIndex;
    var infoContent = '<div class="row"><div class="col-12">';
    infoContent += '<span>';

    var contenrRows = [];
    for (var i = 0; i < Table.renderSettings.length; i++) {
        if (Table.renderSettings[i][1] == 2) {
                contenrRows.push(Table.JSON.OrderField.Data[i][3] + ':' + Table.JSON.OrderDetail.Data[rowIndex][i]);
        }
    }
    infoContent += contenrRows.join(', ');
    infoContent += '</span>';
    infoContent += '</div></div>';
    if (!el.prop('readonly'))
        el.select();
    $('#info .container').html(infoContent);
    $('#info').css('display','block');
}