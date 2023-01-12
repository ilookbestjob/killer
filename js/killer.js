
let currentserver = 1;
let servers;
let procs = null
let type = 1;
let mode = "sql"
let interval;

let pending = false;


let checked = [];

$(function () {

    getServers()

    getProcesses(currentserver)

    $(".killbutton").click(function () {
        let proc = ""


        $(".checkbox:checked").each(function (item) {


            proc = proc + (proc == "" ? "" : ",") + $(this).prop("id")
        })


        switch (type) {


            case 1:
                KillProcesses(proc, currentserver)
                break;

            case 2:
                KillPHPProcesses(proc, currentserver)
                break;

        }



    })


    $("#notnull").click(function () { buildProcs(procs) })


    $("#autoupdate").click(function () {


        if ($("#autoupdate").prop("checked")) {
            interval = setInterval("getProcesses(currentserver)", 1000)
        }
        else {
            clearInterval(interval)
        }

    })



    $(".refreshbutton").click(function () {
        getProcesses(currentserver)
    })





    if ($("#autoupdate").is(":checked")) {

        interval = setInterval("getProcesses(currentserver)",1000)

    }


})


const checkChecked = () => {

    checked = [];



    $(".checkbox:checked").each(function (item) {
        checked.push($(this).prop("id"));


    })

    console.log(checked)
}

const getProcesses = (currentserver) => {
    if (!pending) {
        switch (type) {


            case 1:
                getSQLProcesses(currentserver)
                break;

            case 2:
                getPHPProcesses(currentserver)
                break;

        }

        $(".checkbox").click(function () {
            console.log("checked")
            checkChecked()
            console.log("checked")
        })


    }



}




const getSQLProcesses = (currentserver) => {
    pending = true;
    fetch("actions.php?action=get&server=" + currentserver).then(res => {
        pending = false; res.json().then(res => {
            procs = res
            res.sort((a, b) => b.Time - a.Time)

            if ($(".search").val() != "") {
                res = res.filter(item => {
                    if (item.Info == null) return false
                    return item.Info.toLowerCase().indexOf($(".search").val()) != -1
                })

            }
            buildSQLProcs(res);
        })
    }, err => pending = false)
}

const getPHPProcesses = (currentserver) => {
    pending = true;
    fetch("actions.php?action=getPHP&server=" + currentserver).then(res => {
        pending = false;
        res.json().then(res => {
            procs = res

            res = JSON.parse(res)
            console.log(res)
            if ($(".search").val() != "") {
                res.processes = res.processes.filter(item =>

                    item["request uri"].toLowerCase().indexOf($(".search").val()) != -1)

            }


            buildPHPProcs(res);

        })
    }, err => pending = false)
}


const buildSQLProcs = (res) => {
    $(".process,.processtitle").css({ "grid-template-columns": "20px 130px 70px 100px 170px 70px 70px 1fr" })

    $(".processtitle").html(`
    <div class="processtitle__checkbox"><input type="checkbox" /></div>
    <div class="process__server">Сервер</div>
    <div class="processtitle__id">Id</div>

    <div class="processtitle__user">Пользователь</div>
    <div class="processtitle__host">Хост</div>
    <div class="processtitle__db">БД</div>
    <div class="processtitle__time">Время</div>
    <div class="processtitle__info">Запрос</div>`)










    $(".processwindow__data").html("")
    res.forEach(item => {

        let notnull = !$("#notnull").is(':checked')



        if ((notnull && (item.Info != null)) || (!notnull)) {
            $(".processwindow__data").append(`


<div class="process" style="`+ (item.Time * 1 > 3 ? (item.Info != null ? "background-color:red;color:#fff;" : "background-color:#ffc4c4") : "") + `">
<div class="process__checkbox">`+ (currentserver != 0 ? '<input class="checkbox" id="' + item.Id + '" type="checkbox"' + (checked.find(searchItem => searchItem == item.Id) ? "checked" : "") + '/>' : '') + `</div>
<div class="process__server">`+ item.server + `</div>
<div class="process__id">`+ item.Id + `</div>
<div class="process__user">`+ item.User + `</div>
<div class="process__host">`+ item.Host + `</div>
<div class="process__db">`+ item.db + `</div>
<div class="process__time">`+ item.Time + `</div>
<div class="process__info">`+ item.Info + `</div>




</div>`)


        }
    })

    $(".checkbox").click(function () {

        checkChecked()

    })
}




const buildPHPProcs = (res) => {
    $(".process,.processtitle").css({ "display": "grid", "grid-template-columns": "20px 130px 120px 1fr 170px 70px 70px 1fr" })


    $(".processtitle").html(`
    <div class="processtitle__checkbox"><input type="checkbox" /></div>
    <div class="process__server">Сервер</div>
    <div class="processtitle__id">Id процесса</div>

    <div class="processtitle__script">Скрипт</div>
    <div class="processtitle__time">Время начала</div>
    <div class="processtitle__method">Метод</div>
    <div class="processtitle__http">Запрос</div>`)


    $(".processwindow__data").html("")


    res.processes.forEach(item => {


        $(".processwindow__data").append(`


<div class="process">
<div class="process__checkbox">`+ (currentserver != 0 ? '<input class="checkbox" id="' + item.pid + '" type="checkbox"'  + (checked.find(searchItem => searchItem == item.pid) ? "checked" : "") + '/>' : '') + `</div>
<div class="process__server">`+ servers[currentserver].server + `</div>
<div class="processtitle__id">`+ item.pid + `</div>

<div class="processtitle__script">`+ item.script + `</div>
<div class="processtitle__time">`+ formattime(item["start time"]) + `</div>
<div class="processtitle__method">`+ item["request method"] + `</div>
<div class="processtitle__http">`+ item["request uri"] + `</div>



</div>`)



    })

    $(".process").css({ "display": "grid", "grid-template-columns": "20px 130px 120px 1fr 170px 70px 70px 1fr" })



    $(".checkbox").click(function () {

        checkChecked()

    })
}








const KillProcesses = (list, fserver) => {

    fetch("actions.php?action=kill&procs=" + list + "&server=" + fserver).then(res => res.json()).then(res => {


        getProcesses(currentserver)


    })
}



const KillPHPProcesses = (list, fserver) => {

    fetch("http://" + servers[currentserver].server + ":"+servers[currentserver].httpport+"/killproc.php?action=killphp&procs=" + list + "&key=gsgbmr4t86664gg7rew797fvvc8ds9rb9vxcrg9db9bvb9gfdgdf79greg79gdf79").then(res => res.json()).then(res => {


        getProcesses(currentserver)


    })
}

const getServers = () => {

    fetch("actions.php?action=getservers").then(res => res.json()).then(res => {

        servers = res;
        buildServers(servers)


    })
}


const buildServers = (arr) => {
    let currentitem = 0;
    $(".processwindow__servers").html("")
    $(".processwindow__servers").append(` <div class="` + (currentitem == currentserver ? "server_selected" : "server") + `" onclick="selectserver(0)">Все</div>`)
    arr.forEach(item => {

        if (item) {
            currentitem++
            $(".processwindow__servers").append(` <div class="` + (currentitem == currentserver ? "server_selected" : "server") + `" onclick="selectserver(` + currentitem + `)">` + item.comment + `</div>`)
        }

    })

}

const selectserver = (fserver) => {
    pending = false;
    currentserver = fserver;
    getProcesses(currentserver)
    buildServers(servers)

}

const settype = (ltype) => {
    type = ltype;

    $(".type_selected").addClass("type");
    $(".type_selected").removeClass("type_selected");


    $("#type" + ltype).addClass("type_selected");
    $("#type" + ltype).removeClass("type");



}


const formattime=(seconds)=>{

    let d = new Date(seconds*1000);
    

    return d.getDate()+ " "+["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"][d.getMonth()] +" "+(d.getHours()>9?"":"0")+d.getHours()+":"+(d.getMinutes()>9?"":"0")+d.getMinutes()+":"+(d.getSeconds()>9?"":"0")+d.getSeconds()


}

