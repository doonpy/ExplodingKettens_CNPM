
const socket = require('socket.io');
const ip = require('ip');
const moment = require('moment');
const mositureController = require('./controllers/mositureController');


function socketIO(server) {
    var io = socket(server);
    console.log("--> Địa chỉ server: " + ip.address())

    var deviceList = new Array();
    var userList = new Array();
    let timeCount;

    //Namespace là Server
    io.on('connection', (socket) => {
        //check và phân loại
        socket.emit("getAuthorization", '');

        //Đếm ngược nếu ko trả lời
        timeCount = setTimeout(() => {
            socket.disconnect();
        }, 60 * 1000 * 1);

        socket.on("resAuthorization", (data) => {
            //Kết nối được thì clear
            clearTimeout(timeCount);
            data.id = socket.id;
            //type: false - device; true - user
            console.log(`--> Connected: Id: ${data.id} - Type: ${data.type}`);

            if (data.type == false) {
                deviceList.push(data);
                socket.join('device');
            }
            if (data.type == true) {
                userList.push(data);
                socket.join('user');
            }

            // //Lắng nghe độ ẩm trả về
            socket.on('resMositure', (data) => {
                //Nhận được thì in ra thôi hihi.
                data.time = data.time.replace(/\n/g, '');   //xóa \n thôi chứ hok có gì
                console.log(data);

                // mositureController.addMositure(new Date(), data.mositure);
                socket.to('user').emit('resMositure', {
                    date: new Date(),
                    date_formatted: moment(new Date(data.time)).format("HH:mm:ss DD/MM/YYYY"),
                    value: data.value
                });
            });

            //Lắng nghe thông tin trả về
            socket.on('resInfomation', (data) => {
                console.log(data);
            })

            //Lắng nghe kết quả trả về
            socket.on("resResult", (data) => {
                console.log(data);
                socketServer.emit('resResult', data);
            });

            //Lắng nghe lỗi trả về
            socket.on("resError", (data) => {
                console.log(data);
            });

            //Lắng nghe thông tin
            socket.on('getInfomation', () => {
                socket.to('device').emit('getInfomation', '');
            });

            //Thay đổi chế độ tưới
            socket.on('setCommand', (data) => {
                socket.to('device').emit('setCommand', data);
            })

            //Update firmware
            socket.on('updateFirmware', () => {
                socket.to('device').emit('updateFirmware', '');
            })

            //Khi socket client bị mất kết nối thì chạy hàm sau.
            socket.on('disconnect', function () {
                console.log(`--> Disconnected: ${data}`); 	//in ra màn hình console cho vui

            })

        });
    });
};

module.exports = socketIO;