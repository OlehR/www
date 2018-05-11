var Planer = {
    JSON: {},
    getDataFromFile: function () {
        Planer.JSON = _Json;
        console.log(Planer.JSON);
        this.renderTable();
    },
    renderTable: function () {
        var table = '<table class="table table-responcive table-stripped"><tr>';
        table += '<th>код</th>';
        table += '<th>назва</th>';
        for (var i = 0; i < Planer.JSON[0].length-2; i++){
            table += '<th>'+(i+1)+'</th>';
        }
        table += '</tr>';
        for (var i = 0; i < Planer.JSON.length; i++){
            table += '<tr>';
            for (var j = 0; j < Planer.JSON[i].length; j++) {
                table += '<td data-day="' + moment().isoWeekday() == 6 || moment().isoWeekday() == 7 ? 'week' : 'today' + '">' + Planer.JSON[i][j] + '</td>';
            }
            table += '</tr>';
        }
        table += '</table>';

        $('#tableContent').html(table);
    },
    controlsInit: function () {
        
    },
    init: function () {
        if (window.isLogin){
            this.getData();
        }
        this.controlsInit();
    }
}

$(document).ready(function () {
    //Planer.init();
});