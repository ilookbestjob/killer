
let currentserver = 1;
let servers;
let procs = null
let type = 1;

$(function () {

    getServers()

    getProcesses(currentserver)

    $(".killbutton").click(function () {
        let proc = ""


        $(".checkbox:checked").each(function (item) {


            proc = proc + (proc == "" ? "" : ",") + $(this).prop("id")
        })

        KillProcesses(proc, currentserver)

    })


    $("#notnull").click(function () { buildProcs(procs) })

    $(".refreshbutton").click(function () {
        getProcesses(currentserver)
    })

})



const getProcesses = (currentserver) => {

    fetch("actions.php?action=get&server=" + currentserver).then(res => res.json()).then(res => {
        procs = res
        buildProcs(res);
    })
}



const buildProcs = (res) => {
    $(".processwindow__data").html("")
    res.forEach(item => {

        let notnull = !$("#notnull").is(':checked')



        if ((notnull && (item.Info != null)) || (!notnull)) {
            $(".processwindow__data").append(`


<div class="process" style="`+ (item.Time * 1 > 3 ? (item.Info != null ? "background-color:red;color:#fff;" : "background-color:#ffc4c4") : "") + `">
<div class="process__checkbox">`+ (currentserver != 0 ? '<input class="checkbox" id="' + item.Id + '" type="checkbox"  />' : '') + `</div>
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

}



const KillProcesses = (list, fserver) => {

    fetch("actions.php?action=kill&procs=" + list + "&server=" + fserver).then(res => res.json()).then(res => {


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
            $(".processwindow__servers").append(` <div class="` + (currentitem == currentserver ? "server_selected" : "server") + `" onclick="selectserver(` + currentitem + `)">` + item + `</div>`)
        }

    })

}

const selectserver = (fserver) => {

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

