<html>

<head></head>
<link rel="stylesheet" type="text/css" href="css/style.css" />
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

<script src="js/killer.js"></script>

<body>
    <div class="processwindow">
        <div class="processwindow__header">Процессы ZOD</div>

        <div class="processwindow__types">
            <div class="type" id="type1" onclick="settype(1)" >MySQL</div>
            <div class="type" id="type2" onclick="settype(2)">PHP</div>
        </div>



        <div class="processwindow__servers">

        </div>

        <div class="processwindow__menu">
            <div>
                <input type="checkbox" name="" id="notnull" checked> показывать пустые
            </div>
            <div class="buttoncontainer">
                <div class="refreshbutton">&#11119;</div>
                <div class="killbutton">Завершить</div>
            </div>
        </div>

        <div class="processtitle">
            <div class="processtitle__checkbox"><input type="checkbox" /></div>
            <div class="process__server">Сервер</div>
            <div class="processtitle__id">Id</div>

            <div class="processtitle__user">Пользователь</div>
            <div class="processtitle__host">Хост</div>
            <div class="processtitle__db">БД</div>
            <div class="processtitle__time">Время</div>
            <div class="processtitle__info">Запрос</div>




        </div>
        <div class="processwindow__data"></div>
    </div>



</body>


</htnl>