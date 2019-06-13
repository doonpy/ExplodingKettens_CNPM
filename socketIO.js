
const socket = require('socket.io');
const ip = require('ip');
const moment = require('moment');
const mositureController = require('./controllers/mositureController');


function socketIO(server) {
    var io = socket(server);
    console.log("--> Địa chỉ server: " + ip.address())

    //Namespace là Server
    var device = io.on('connection', function (socket) {

        console.log("--> Connected - Device: " + socket.id);

        //lấy dữ liệu
        socket.on('resInfomation', function (data) {
            //Nhận được thì in ra thôi hihi.
            console.log(data);
            socketServer.emit('resInfomation', data);
            // mositureController.addMositure(new Date(), data.mositure);
            socketServer.emit('getMositure', { date: new Date(), date_formatted: moment(new Date).format("HH:mm:ss DD/MM/YYYY"), value: data.mositure });
        })

        socket.on("resResult", (data) => {
            socketServer.emit('resResult', data);
        });

        //Khi socket client bị mất kết nối thì chạy hàm sau.
        socket.on('disconnect', function () {
            console.log("--> Disconnected - Device: " + socket.id) 	//in ra màn hình console cho vui
        })
    });


    //Namespace là Server
    var socketServer = io.of('/server')
        .on('connection', function (socket) {
            console.log("--> Connected - Server: " + socket.id);

            socket.on('getInfomation', () => {
                device.emit('getInfomation', '');
            });

            //Thay đổi chế độ tưới
            socket.on('setPumbMode', () => {
                device.emit('setPumbMode', '');
            })

            //Bật tắt máy bơm
            socket.on('controlPumb', () => {
                device.emit('controlPumb', '');
            })

            socket.on('disconnect', function () {
                // clearInterval(loop);
                console.log("--> Disconnected - Server: " + socket.id) 	//in ra màn hình console cho vui

            })


        });
}

module.exports = socketIO;