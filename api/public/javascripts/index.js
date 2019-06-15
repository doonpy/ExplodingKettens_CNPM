$(document).ready(() => {
    const socket = io();
    let auth = { "type": true, "userid": "NULL" };
    socket.on("getAuth", () => {
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
            let id = $(`${e.target} input[name=id]`).val();
            let packet = { idSent: socket.id, idRec: id };
            socket.emit('getInfomation', packet);
            console.log(packet);
        });
    });

    //Nghe phản hồi getInfomation
    socket.on("resInfomation", (data) => {
        $("#pumbMode").text(data.pumbMode == true ? "AUTO" : "MANUAL");
        $("#pumbStatus").text(data.pumbStatus == true ? "ACTIVE" : "UNACTIVE");
        $("#pumbStatus").attr('class', data.pumbStatus == true ? "badge badge-success" : "badge badge-danger");
    });
})