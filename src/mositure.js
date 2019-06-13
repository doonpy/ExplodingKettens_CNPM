
const $ = require('jquery');
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

$(document).ready(function () {
    const socket = io('/server');
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
        let list = $('#list');
        let num = parseInt(list.children().length) + 1;
        // var child = `<li>` + num + `.   Thời gian: ` + data.date + ` --- Độ ẩm: ` + data.value + `%</li>`;
        let child = `<li class="row">${num}. ` +
            `<p>Thời gian:&nbsp;</p>` +
            `<p>${data.date_formatted}</p>` +
            `<p>&nbsp;---&nbsp;</p>` +
            `<p> Độ ẩm:&nbsp;</p>` +
            `<p>${data.value}</p>` +
            `<p>%</p>` +
            `<p style="display:none">${data.date}</p></li>`;
        list.append(child);
        updateChart(data.date, parseInt(data.value));
    });

    //Vòng lặp gửi yêu cầu lấy thông tin
    socket.emit('getInfomation', '');
    setInterval(() => {
        socket.emit('getInfomation', '');
    }, 5000);

    socket.on('resInfomation', (data) => {
        $("#pumbMode").text(data.pumbMode == true ? "Auto" : "Manual");
        $("#pumbStatus").text(data.pumbStatus == 1 ? "On" : "Off");
        if (data.pumbStatus == 1) {
            $("#pumbControl").text('Tắt');
            $("#pumbControl").removeClass('btn-success');
            $("#pumbControl").addClass('btn-danger');
        }
        else {
            $("#pumbControl").text('Mở');
            $("#pumbControl").addClass('btn-success');
            $("#pumbControl").removeClass('btn-danger');
        }
    });

    socket.on('resResult', (data) => {
        $("#thongbao").text(data.msg);
    })

    //Clear database
    $("#clearDB").click(() => {
        $.ajax({
            url: "/cleardb",
            method: "POST"
        }).done(res => {
            alert(`Messages: ${res.msg}`);
            location.reload();
        }).fail(err => {
            alert(`Messages: ${err.statusText}`);
        })
    })

    //Stop simulator
    $("#switchCon").click(() => {
        if (socket.connected) {
            socket.disconnect();
            $("#switchCon").removeClass('btn-dark');
            $("#switchCon").addClass('btn-success');
            $("#switchCon").text('Connect');
        }
        else {
            socket.connect('/server');
            $("#switchCon").addClass('btn-dark');
            $("#switchCon").removeClass('btn-success');
            $("#switchCon").text('Disconnect');
        };
        alert("Yep!");
    })

    //Thay đổi mode
    $("#changemode").click(() => {
        socket.emit('setPumbMode', '');
    });

    $("#pumbControl").click(() => {
        socket.emit('controlPumb', '');
    });
});