$(document).ready(() => {
    const socket = io();
    var device = new Object();
    let auth = { "type": true, "userid": "NULL" };
    socket.on("getAuth", () => {
        $("#myid").text(socket.id);
        socket.emit("resAuth", auth);
    });

    //Liệt kê thiết bị kết nối với sv
    socket.on("listDevice", (data) => {
        let listDevice = $("#listdevice");
        let child = ``;
        listDevice.empty();
        data.forEach(d => {
            child += `<a class="btn btn-outline-secondary btn-lg mr-3 mb-3">
            <img class="icon" src="https://png.pngtree.com/svg/20170103/04ff1a209d.svg">
            <strong>MAC:</strong> ${d.mac}
            <input name="id" style="display:none" value="${d.id}"></a>`
        });
        listDevice.append(child);

        $("#listdevice a").click((e) => {
            $("#deviceMac").text($(e.currentTarget).text());
            let id = $(`${e.target} input[name=id]`).val();
            let packet = { idSent: socket.id, idRec: id };
            socket.emit('getInfomation', packet);
            console.table(packet);
            // var mositureInt = setInterval(() => {
            //     // let packet = { idSent: socket.id, idRec: id };
            //     socket.emit("getMositure", packet);
            // }, 3000);
            $("#changeMode").unbind('click');
            $("#changeMode").click(() => {
                device.pumbMode = device.pumbMode == true ? false : true;
                let packet = {
                    idRec: id,
                    idSent: socket.id,
                    data: {
                        IS: "",
                        PM: device.pumbMode,
                        PS: device.pumbStatus,
                        MM: device.mositureMin
                    }
                };
                socket.emit("setCommand", packet);
            });
        });

    });

    //Nghe phản hồi getInfomation
    socket.on("resInfomation", (data) => {
        device.pumbMode = data.pumbMode;
        device.pumbStatus = data.pumbStatus;
        device.mositureMin = data.mositureMin;

        console.table(device);
        $("#pumbMode").text(data.pumbMode == true ? "AUTO" : "MANUAL");
        $("#pumbStatus").text(data.pumbStatus == true ? "ACTIVE" : "UNACTIVE");
        $("#pumbStatus").attr('class', data.pumbStatus == true ? "badge badge-success" : "badge badge-danger");
        $("#mositureMin").text(data.mositureMin + "%");
    });

    socket.on("resMositure", (data) => {
        $("#mositure").text(data.value + "%");
    });

    socket.on("resError", (data) => {
        alert(data.msg);
    })
})