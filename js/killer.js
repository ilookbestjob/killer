
let currentserver = 1;
let servers;
let procs = null
let type = 1;
let mode = "sql"
let interval;

let pending = false;

let serverInfo
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
            if (interval != "") interval = setInterval("getProcesses(currentserver)", 1000)
        }
        else {
            clearInterval(interval)
            interval = "";
        }

    })



    $(".refreshbutton").click(function () {
        getProcesses(currentserver)
    })




    if ($("#autoupdate").prop("checked")) {
       if (interval != "") interval = setInterval("getProcesses(currentserver)", 1000)
    }
    else {
       clearInterval(interval)
        interval = "";
    }


    
    $(".serverinfo__header").click(function(){


        $(".processwindow__serverinfo").toggle()
        
    })
})


const checkGET = () => {


    const vars = window.location.href.split("?").lenght > 0 ? window.location.href.split("?")[1].split("&") : []



    let actions = {
        search: function (s) { console.log("search", "s"); $(".search").val(this) },
        server: function (s) { console.log("#server" + this); $("#server" + this).click() },
        type: function (s) { console.log("#type" + this); $("#type" + this).click() }
    }
    console.log("vars", vars)
    vars.forEach(item => {

        item = item.split("=");
        console.log("item", item)
        actions[item[0]].call(item[1])
    }

    )
}

const checkChecked = () => {

    checked = [];



    $(".checkbox:checked").each(function (item) {
        checked.push($(this).prop("id"));


    })


}

const getProcesses = (currentserver) => {
    if (!pending) {
        switch (type) {


            case 1:
                $("#autoupdate").prop("checked", true)

                getSQLProcesses(currentserver)
                break;

            case 2:
                $("#autoupdate").prop("checked", true)

                getPHPProcesses(currentserver)
                break;
            case 3:
                $("#autoupdate").prop("checked", false)


                getCRON(currentserver)
                break;

            case 4:
                    $("#autoupdate").prop("checked", false)
    
    
                    getSQLTables(currentserver)
                    break;


        }

        $(".checkbox").click(function () {

            checkChecked()

        })


    }



}




const getSQLProcesses = (currentserver) => {
    pending = true;
    fetch("actions.php?action=get&server=" + currentserver).then(res => {
        pending = false; res.json().then(res => {
            procs = res
            if (!res.error) {
                res.sort((a, b) => b.Time - a.Time)

                if ($(".search").val() != "") {
                    res = res.filter(item => {
                        if (item.Info == null) return false
                        return item.Info.toLowerCase().indexOf($(".search").val()) != -1
                    })

                }
            }
            buildSQLProcs(res);
        })
    }, err => pending = false)
}



const getSQLTables=(currentserver)=> {
    pending = true;
    fetch("actions.php?action=sqlinfo&server=" + currentserver).then(res => {
        pending = false; res.json().then(res => {
            procs = res
            if (!res.error) {
               

                if ($(".search").val() != "") {
                    res = res.filter(item => {
                        if (item.name == null) return false
                        return item.name.toLowerCase().indexOf($(".search").val()) != -1
                    })

                }
            }
            buildSQLInfo(res);
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

            if ($(".search").val() != "") {
                res.processes = res.processes.filter(item =>

                    item["request uri"].toLowerCase().indexOf($(".search").val()) != -1)

            }


            buildPHPProcs(res);

        })
    }, err => pending = false)
}


const getCRON = (server) => {

    fetch("actions.php?action=getCRON&server=" + currentserver).then(res => {
        pending = false;
        res.json().then(res => {
            procs = res

            res = JSON.parse(res)
            if (res) {
                if ($(".search").val() != "") {
                    res = res.filter(item =>

                        item.toLowerCase().indexOf($(".search").val().toLowerCase()) != -1)

                }

                res = res.filter(item => item.toLowerCase().indexOf("#") != 0)

                buildCRON(res);
            }
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

    if (res.error) {
        $(".processwindow__data").css({ display: "flex", "align-items": "center", "justify-content": "center" })
        $(".processwindow__data").append(`<strong>Ошибка сервера</strong> &nbsp;` + res.error);
        return

    }

    $(".processwindow__data").css({ display: "grid", "align-items": "stretch", "justify-content": "stretch" })

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




const buildSQLInfo=(res)=>{
    $(".process,.processtitle").css({ "grid-template-columns": "20px 250px 1fr 170px 170px 1fr" })
    
    $(".processtitle").html(`
    <div class="processtitle__checkbox"><input type="checkbox" /></div>
    <div class="processtitle__db">БД</div>
    <div class="process__table">Таблица</div>
    <div class="processtitle__size">Размер</div>

    <div class="processtitle__index">Размер индекса</div>
    <div class="processtitle__status">Состояние</div>
    `)
    $(".processwindow__data").html("")
    $(".processwindow__data").css({ display: "grid", "align-items": "stretch", "justify-content": "stretch" })
  //  $(".processwindow__data").css({ display: "grid", "align-items": "stretch", "justify-content": "stretch" })

    res.forEach(item => {

        let notnull = !$("#notnull").is(':checked')



        if ((notnull && (item.Info != null)) || (!notnull)) {
            $(".processwindow__data").append(`


<div class="process" style="`+ (item.Time * 1 > 3 ? (item.Info != null ? "background-color:red;color:#fff;" : "background-color:#ffc4c4") : "") + `">
<div class="process__checkbox">`+ (currentserver != 0 ? '<input class="checkbox" id="' + item.Id + '" type="checkbox"' + (checked.find(searchItem => searchItem == item.Id) ? "checked" : "") + '/>' : '') + `</div>
<div class="process__bd">`+ item.db + `</div>
<div class="process__table">`+ item.Name + `</div>
<div class="process__size">`+ item.Data_length + `</div>
<div class="process__index">`+ item.Index_length + `</div>
<div class="process__status">`+ item.Comment+ `</div>




</div>`)


        }
    })

    $(".checkbox").click(function () {

        checkChecked()

    })

    $(".process,.processtitle").css({ "grid-template-columns": "20px 250px 1fr 170px 170px 1fr" })
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
    $(".processwindow__data").css({ display: "grid", "align-items": "stretch", "justify-content": "stretch" })
    res.processes.forEach(item => {


        $(".processwindow__data").append(`


<div class="process">
<div class="process__checkbox">`+ (currentserver != 0 ? '<input class="checkbox" id="' + item.pid + '" type="checkbox"' + (checked.find(searchItem => searchItem == item.pid) ? "checked" : "") + '/>' : '') + `</div>
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








const buildCRON = async (res) => {


    $(".cron,.processtitle").css({ "display": "grid", "grid-template-columns": "300px 1fr 130px" })


    $(".processtitle").html(`
    <div class="process__date">Периодичность</div>
 
    <div class="processtitle__task">Задача</div>

    <div class="processtitle__server">Сервер</div>
    `)


    $(".processwindow__data").html("")
    $(".processwindow__data").css({ display: "grid", "align-items": "stretch", "justify-content": "stretch" })
    res.forEach(async (item, index) => {


        $(".processwindow__data").append(`


<div class="Cron">
<div class="cronitem__date">`+ prepareDate(item) + prepareTime(item) + `</div>
<div class="processtitle__task" id="cron`+ index + `">` + prepareTask(item) + `</div>
<div class="process__server">`+ servers[currentserver].server + `</div>



</div>`)


    })


    $(".cron,.processtitle").css({ "display": "grid", "grid-template-columns": "300px 1fr 130px" })
    $(".processtitle__task").click(function () { console.log($(this).attr("alt")) })

    checkDebug()



}




const prepareTime = (item) => {
    let search = /(?<=\*|\d)\s(?=[a-zA-Z]|\/)/;
    let position = item.search(search)
    if (position != -1) {
        item = item.replace("#", " ").trim()

        let dateitems = item.slice(0, position).split(" ");
        if (dateitems[0].search("/") != -1) return " раз в  " + dateitems[0].slice(dateitems[0].search("/") + 1) + " мин"
        console.log("time", dateitems)
        let minutes = dateitems[0].split(",")
        let hours = dateitems[1].split(",")
        let result = " в"
        if (hours.length > 2) result += '<div>';
        hours.forEach(hour => {
            if (hours.length > 2) result += '<div>';
            if (minutes.length == 1 && minutes[0] == "*") { result += '<div class="cron__time ">' + (hour < 10 ? "0" : "") + hour + ':00</div>' } else {


                minutes.forEach(minute => {
                    result += '<div class="cron__time ">' + (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + (minute + "").trim() + '</div>'


                })


            }
            if (hours.length > 2) result += '</div>';
        })
        if (hours.length > 2) result += '</div>';
        return result;
    }

    return ""
}


const prepareDate = (item) => {
    let search = /(?<=\*|\d)\s(?=[a-zA-Z]|\/)/;
    let position = item.search(search)
    if (position != -1) {

        item = item.replace("#", " ").trim()
        let dateitems = item.slice(0, position).split(" ");
        if (dateitems[2] == "*" && dateitems[3] == "*" && dateitems[4] == "*") return '<div class="cron__date">ежедневно</div>'

        if (dateitems[4] != "*") {
            let days = dateitems[4].split(",")
            if (days.length == 1) return '<div class="cron__date">' + ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"][dateitems[4] * 1] + "</div>"

            result = ''
            days.forEach(day => {

                result += ["Все", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][day * 1]
            })

            return result


        }
    }

    return ""
}


const prepareTask = (item) => {
    console.log("prepareTask = (item)", item)
    let search = /(?<=\*|\d)\s(?=[a-zA-Z]|\/)/;
    let position = item.search(search)
    if (position != -1) {
        search = /("http(.*)(?=("))|(?=(>)))|(http(.*)(?=(\s))|(?=(>)))/
        item = item.slice(position)
        let match = item.match(search)
        console.log("position", position)
        if (match) {
            res = match[0].replace('"', "")
            console.log("match", match)
            let pos = res.search(">")

            res = (pos >= 0 ? res.slice(0, pos - 1) : res)
            console.log(res.slice(0, pos - 1))
            if (res != "") {

                console.log("res", res)
                if ($(".search").val() != '') {
                    item = item.split($(".search").val()).join('<div class="highlight">' + $(".search").val() + "</div>");
                    let res2 = res.split($(".search").val()).join('<div class="highlight">' + $(".search").val() + "</div>");

                    res = item.replace(res2, '<div class="cron__href">' + res2 + '</div>') + `<div class="cron__startbutton" onclick="window.open('` + res.replace("127.0.0.1", servers[currentserver].server) + `')" >запустить</div>`
                    console.log("search")
                }
                else {

                    res = item.replace(res, '<div class="cron__href" href="' + (res.replace("127.0.0.1", servers[currentserver].server)) + '">' + res + '</div>') + `<div class="cron__startbutton" onclick="window.open('` + res.replace("127.0.0.1", servers[currentserver].server) + `')" >запустить</div>`
                }
                return res
            }





        }
    }
    return item.split($(".search").val()).join('<div class="highlight">' + $(".search").val() + "</div>");

}








const KillProcesses = (list, fserver) => {

    fetch("actions.php?action=kill&procs=" + list + "&server=" + fserver).then(res => res.json()).then(res => {


        getProcesses(currentserver)


    })
}



const KillPHPProcesses = (list, fserver) => {

    fetch("http://" + servers[currentserver].server + ":" + servers[currentserver].httpport + "/killproc.php?action=killphp&procs=" + list + "&key=gsgbmr4t86664gg7rew797fvvc8ds9rb9vxcrg9db9bvb9gfdgdf79greg79gdf79").then(res => res.json()).then(res => {


        getProcesses(currentserver)


    })
}

const checkKillproc = async () => {

    try {
        console.log("checkKillproc():")
        let result = await fetch("http://" + servers[currentserver].server + ":" + servers[currentserver].httpport + "/killproc.php?")
        console.log("checkKillproc: " + result.ok)
        result.ok ? $(".killbutton").show() : $(".killbutton").hide()



    } catch {
        console.log("checkKillproc: " + false)
        $(".killbutton").hide();


    }

}

const getServers = async () => {

     fetch("actions.php?action=getservers").then(res => res.json()).then(res => {

        servers = res;
        buildServers(servers)
        checkGET()
        setInterval("getServerInfo(currentserver)",10)

    })
}


const buildServers = (arr) => {
    let currentitem = 0;
    $(".processwindow__servers").html("")
    $(".processwindow__servers").append(` <div class="` + (currentitem == currentserver ? "server_selected" : "server") + `" onclick="selectserver(0)">Все</div>`)
    arr.forEach(item => {

        if (item) {
            currentitem++
            $(".processwindow__servers").append(` <div id="server` + currentitem + `" class="` + (currentitem == currentserver ? "server_selected" : "server") + `" onclick="selectserver(` + currentitem + `)">` + item.comment + `</div>`)
        }

    })

}

const selectserver = (fserver) => {
    pending = false;
    currentserver = fserver;




    $(".processtitle").html(` `)


    $(".processwindow__data").html("")
    getProcesses(currentserver)
    buildServers(servers)

    getServerInfo(currentserver)
    if (type == 2) checkKillproc()



}
const addWidget = (target, name, subheader = "") => {

    $(".processwindow__serverinfo").append(`<div class="widget" name="` + name + `"><div class="headercontainer"><div class="header">` + name + `</div><div class="subheader">` + subheader + `</div></div><div class="content"></div></div>`)

    return $(".processwindow__serverinfo").find('[name="' + name + '"]').find(".content")
}


const makeDiag = (total, current) => {
    const percent = current / total * 100

    return `<div class="diagcontainer"><div class="progress" style="width:` + percent + `%;`+(percent>90?"background:red linear-gradient(rgba(255, 255, 255, 0.244) 0%,    rgba(255, 255, 255, 0.399) 50%, transparent 50%, transparent 100%)":"")+`"></div></div>`

}
const getServerInfo = async (currentserver) => {

    serverInfo = await fetch("http://" + servers[currentserver].server + ":" + servers[currentserver].httpport + "/classes/ServerInfo/actions.php")


    $(".processwindow__serverinfo").html('')




    const systemWidget = addWidget(".processwindow__serverinfo", "Система")


    serverInfo = await serverInfo.json()

    const OSversion = serverInfo.find(item => item.name == "OSversion")
    systemWidget.append(`<div class="data"><strong>` + OSversion.display + `</strong> &nbsp;` + OSversion.value + `</div>`);



    const PHPversion = serverInfo.find(item => item.name == "phpversion")
    systemWidget.append(`<div class="data"><strong>` + PHPversion.display + `</strong> &nbsp;` + PHPversion.value + `</div>`);


    const MySQLversion = serverInfo.find(item => item.name == "mysqlversion")
    systemWidget.append(`<div class="data"><strong>` + MySQLversion.display + `</strong> &nbsp;` + MySQLversion.value + `</div>`);


    const HDDTotal = serverInfo.find(item => item.name == "TotalDiskSpace")
    const HDDFree = serverInfo.find(item => item.name == "FreeDiskSpace")

    const HDDWidget = addWidget(".processwindow__serverinfo", "HDD", "Доступно "+Math.round(HDDFree.value/1024/1024)+" Гб из "+Math.round(HDDTotal.value/1024/1024)+" Гб  ")



    HDDWidget.append(makeDiag(HDDTotal.value * 1, HDDTotal.value * 1 - HDDFree.value * 1));


    const MemTotal = serverInfo.find(item => item.name == "MemTotal")
    const MemFree = serverInfo.find(item => item.name == "MemFree")
    const MemoryWidget = addWidget(".processwindow__serverinfo", "Память", "Доступно "+Math.round(MemFree.value/1024/1024*100)/100+" Гб из "+Math.round(MemTotal.value/1024/1024*100)/100+" Гб  ")




    MemoryWidget.append(makeDiag(MemTotal.value * 1, MemTotal.value * 1 - MemFree.value * 1));




    const ProcTotal = 100
    const Proc = serverInfo.find(item => item.name == "Processor")
    const ProcWidget = addWidget(".processwindow__serverinfo", "Процессор", "Загрузка "+Math.round(Proc.value*100)/100+" %  ")




    ProcWidget.append(makeDiag(ProcTotal, Proc.value * 1)); 
}

const settype = (ltype) => {
    type = ltype;



    $(".type_selected").addClass("type");
    $(".type_selected").removeClass("type_selected");


    $("#type" + ltype).addClass("type_selected");
    $("#type" + ltype).removeClass("type");

    if (type == 2) checkKillproc()

}


const formattime = (seconds) => {

    let d = new Date(seconds * 1000);


    return d.getDate() + " " + ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"][d.getMonth()] + " " + (d.getHours() > 9 ? "" : "0") + d.getHours() + ":" + (d.getMinutes() > 9 ? "" : "0") + d.getMinutes() + ":" + (d.getSeconds() > 9 ? "" : "0") + d.getSeconds()


}


async function checkDebug() {
    console.log("checkDebug()")



    $(".processtitle__task").each(async function () {


        let href = $(this).find(".cron__href").attr("href")

        console.log("href:", href)
        if (href) {
            let hrefparts = href.split("/");
            let serverpath = hrefparts[0] + "//" + hrefparts[2] + "/classes/Debug/isdebug.php?php=" + href;
            console.log(serverpath)


            let data = await fetch(serverpath)
            if (data.ok) {
                data = await data.text() == "true" ? `<div class="cron__debugbutton" onclick="window.open('` + href + (href.indexOf("?") >= 0 ? "&" : "?") + `deb')">отладка</div>` : ""
                console.log(data)
                $(this).append(data)
            }
        }
    })

}

