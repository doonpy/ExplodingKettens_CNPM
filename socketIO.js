const socket = require("socket.io");
const uid = require('uid');
const ip = require("ip");
const moment = require("moment");
const mositureController = require("./controllers/mositureController");
var io;

var countID = (stringID) => {
    if (stringID == undefined)
        stringID = "NULL";
    // stringID = stringID | "NULL";
    let temp = 0;
    for (var i = 0; i < stringID.length; i++) {
        // console.log(packet.idSent[i]);
        temp += stringID[i].charCodeAt(0);
    }
    return temp;
}

module.exports = socketIO = (server) => {
    io = socket(server);
    console.log(`--> Địa chỉ server socket: ${ip.address()}:3000`);

    var deviceList = new Array();
    var userList = new Array();

    io.on("connection", (socket) => {
        // console.log((`setCMD {"idSent":"vX3sfb3hHV45N1NJAAAL","pumbMode":false,"pumbS`).length);
        //check và phân loại
        socket.emit("getAuth", "");

        //Đếm ngược nếu ko trả lời
        let timeCount = setTimeout(() => {
            socket.disconnect();
        }, 60 * 1000 * 1);

        socket.on("resAuth", (auth) => {

            //Kết nối được thì clear
            clearTimeout(timeCount);
            socket.type = auth.type;
            auth.id = socket.id;
            //type: false - device; true - user
            console.log(`--> Connected: ID: ${auth.id} - Type: ${auth.type == true ? "User" : "Device"}`);

            if (auth.type == false) {
                deviceList.push(auth);
                // deviceList.push(auth);
                socket.join("device");
                io.in("user").emit("listDevice", deviceList);
            }
            if (auth.type == true) {
                auth.idCmd = uid(5);
                userList.push(auth);
                socket.join("user");
                //Gửi danh sách device đang kết nối
                socket.emit("listDevice", deviceList);
            }
        });

        // //Lắng nghe độ ẩm trả về
        socket.on("resMositure", (data) => {
            console.log(data);
            let idSent;
            userList.forEach(u => {
                if (countID(u.id) == data.idSent)
                    idSent = u.id;
            });
            //Nhận được thì in ra thôi hihi.
            data.time = data.time.replace(/\n/g, "");   //xóa \n thôi chứ hok có gì
            // console.log(data);
            // io.to(`${idSent}`).emit("resMositure", data);

            // mositureController.addMositure(new Date(), data.mositure);
            io.to(idSent).emit("resMositure", {
                time: moment(new Date(data.time)).format("HH:mm:ss DD/MM/YYYY"),
                value: data.value,
                status: data.status
            });
        });

        //Lắng nghe thông tin trả về
        socket.on("resInfomation", (data) => {
            console.log(data);
            let idSent;
            userList.forEach(u => {
                if (countID(u.id) == data.idSent)
                    idSent = u.id;
            });
            //convert lai
            let temp = {
                "idSent": idSent,
                "status": data.status,
                "pumbMode": data.PM,
                "pumbStatus": data.PS,
                "mositureMin": data.MM
            };
            io.to(`${temp.idSent}`).emit("resInfomation", temp);
            // console.log(data);
        })

        //Lắng nghe kết quả trả về
        socket.on("resResult", (result) => {
            console.log(result);
            let idSent;
            userList.forEach(u => {
                if (countID(u.id) == result.idSent)
                    idSent = u.id;
            });
            io.to(idSent).emit("resResult", result);
            // socket.emit("resResult", data);
        });

        //Lắng nghe lỗi trả về
        socket.on("resError", (err) => {
            console.log(err);
            // socket.in("user").emit("resError", err);
        });

        //Lắng nghe yêu cầu lấy độ ẩm
        socket.on("getMositure", (packet) => {
            // console.log(packet);
            let temp = countID(packet.idSent);
            io.to(packet.idRec).emit("getMositure", { idSent: temp });
        });

        //Lắng nghe thông tin
        socket.on("getInfomation", (packet) => {
            let temp = countID(packet.idSent);
            io.to(packet.idRec).emit("getInfomation", { idSent: temp });
        });

        //Thay đổi chế độ tưới
        socket.on("setCommand", (packet) => {
            console.log(packet);
            let temp = countID(packet.idSent);
            packet.data.IS = temp;
            // console.log(packet);
            socket.to(packet.idRec).emit("setCommand", packet.data);
        })

        //Update firmware
        socket.on("updateFirmware", (packet) => {
            socket.to(packet.idRec).emit("updateFirmware", { idSent: packet.idSent });
        })

        //Khi socket client bị mất kết nối thì chạy hàm sau.
        socket.on("disconnect", function () {
            console.log(`--> Disconnected: ${socket.id}`); 	//in ra màn hình console cho vui
            if (socket.type == true)
                userList.splice(userList.indexOf(u => { return u.id == socket.id }), 1);
            else
                deviceList.splice(deviceList.indexOf(d => { return d.id == socket.id }), 1);
            io.in("user").emit("listDevice", deviceList);
            console.log(deviceList);
            console.log(userList);
        })
    });
};
