var socket = io('/server');

$(document).ready(function () {
    var dps = []; // dataPoints
    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Mositure"
        },
        axisX: {
            title: "Time",
            valueFormatString: "HH:mm:ss"
        },
        axisY: {
            title: "Mositure",
            includeZero: false,
            suffix: "%"
        },
        data: [{
            type: "line",
            dataPoints: dps,
            // indexLabel: "{y[#index]}%",
            xValueFormatString: "HH:mm:ss DD/MM/YYYY",
            toolTipContent: "<strong>Time: </strong> {x} </br> <strong>Mositure: </strong> {y}%"
        }]
    });

    var xVal = 0;
    // var yVal = 100;
    // var updateInterval = 1000;
    var list = $('#list').children();
    // console.log(list);
    var dataLength = 30; // number of dataPoints visible at any point
    console.log(dataLength)
    var updateChart = function (x, yVal) {
        dps.push({
            x: new Date(x),
            y: yVal
        });

        if (dps.length > dataLength) {
            dps.shift();
        }

        chart.render();
    };

    for (var i = 0; i < list.length; i++) {
        updateChart($(list[i]).children()[6].innerText, parseInt($(list[i]).children()[4].innerText));
        // console.log(new Date($(list[i]).children()[1].innerText))
    }

    //Khai báo socket trên client
    socket.on('getMositure', function (data) {
        var list = $('#list');
        var num = parseInt(list.children().length) + 1;
        // var child = `<li>` + num + `.   Thời gian: ` + data.date + ` --- Độ ẩm: ` + data.value + `%</li>`;
        var child = `<li class="row">` + num + `.&nbsp; ` +
            `<p>Thời gian:&nbsp;</p>` +
            `<p>` + data.date_formatted + `</p>` +
            `<p>&nbsp;---&nbsp;</p>` +
            `<p> Độ ẩm:&nbsp;</p>` +
            `<p>` + data.value + `</p>` +
            `<p>%</p>` +
            `<p style="display:none">` + data.date + `</p></li>`;
        list.append(child);
        updateChart(data.date, parseInt(data.value));
    });
});