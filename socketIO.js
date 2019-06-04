
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

        //lấy dữ liệu độ ẩm
        socket.on('resMositure', function (data) {
            //Nhận được thì in ra thôi hihi.
            console.log(data);
            mositureController.addMositure(new Date(), data.mositure);
            socketServer.emit('getMositure', { date: new Date(), date_formatted: moment(new Date).format("HH:mm:ss DD/MM/YYYY"), value: data.mositure });
        })


        //Khi socket client bị mất kết nối thì chạy hàm sau.
        socket.on('disconnect', function () {
            console.log("--> Disconnected - Device: " + socket.id) 	//in ra màn hình console cho vui
        })
    });


    //Namespace là Server
    var socketServer = io.of('/server')
        .on('connection', function (socket) {
            console.log("--> Connected - Server: " + socket.id);

            var loop = async () => {
                let mositure = Math.floor((Math.random() * 100) + 1);
                await mositureController.addMositure(new Date(), mositure);
                socketServer.emit('getMositure', { date: new Date(), date_formatted: moment(new Date).format("HH:mm:ss DD/MM/YYYY"), value: mositure });
            }
            setInterval(loop, 3000);

            socket.on('disconnect', function () {
                clearInterval(loop);
                console.log("--> Disconnected - Server: " + socket.id) 	//in ra màn hình console cho vui

            })


        });
}

module.exports = socketIO;