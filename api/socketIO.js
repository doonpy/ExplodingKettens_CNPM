const socket = require("socket.io");
const ip = require("ip");
const moment = require("moment");
const mositureController = require("./controllers/mositureController");
var io;

module.exports = socketIO = (server) => {
    io = socket(server);
    console.log(`--> Địa chỉ server socket: ${ip.address()}:3000`);

    var deviceList = new Array();
    var userList = new Array();

    io.on("connection", (socket) => {
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
            console.log(`--> Connected: Id: ${auth.id} - Type: ${auth.type == true ? "User" : "Device"}`);

            if (auth.type == false) {
                deviceList.push(auth);
                socket.join("device");
                io.in("user").emit("listDevice", deviceList);
            }
            if (auth.type == true) {
                userList.push(auth);
                socket.join("user");
                //Gửi danh sách device đang kết nối
                socket.emit("listDevice", deviceList);
            }
        });

        // //Lắng nghe độ ẩm trả về
        socket.on("resMositure", (data) => {
            //Nhận được thì in ra thôi hihi.
            data.time = data.time.replace(/\n/g, "");   //xóa \n thôi chứ hok có gì
            console.log(data);

            // mositureController.addMositure(new Date(), data.mositure);
            socket.to("user").emit("resMositure", {
                date: new Date(),
                date_formatted: moment(new Date(data.time)).format("HH:mm:ss DD/MM/YYYY"),
                value: data.value
            });
        });

        //Lắng nghe thông tin trả về
        socket.on("resInfomation", (data) => {
            io.to(`${data.idSent}`).emit("resInfomation", data);
            console.log(data);
        })

        //Lắng nghe kết quả trả về
        socket.on("resResult", (data) => {
            console.log(data);
            // socket.emit("resResult", data);
        });

        //Lắng nghe lỗi trả về
        socket.on("resError", (data) => {
            console.log(data);
        });

        //Lắng nghe thông tin
        socket.on("getInfomation", (packet) => {
            io.to(packet.idRec).emit("getInfomation", { idSent: packet.idSent });
        });

        //Thay đổi chế độ tưới
        socket.on("setCommand", (data) => {
            socket.to("device").emit("setCommand", data);
        })

        //Update firmware
        socket.on("updateFirmware", () => {
            socket.to("device").emit("updateFirmware", "");
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
