<?php
ini_set('display_errors', 0);

require "killer_class.php";
$killerobj = new killer();
$killerobj->checkproc(__FILE__,1); //имя процесса, количество допустимых процессов




if (isset($_GET['action'])) {

    switch ($_GET['action']) {
        case "get":

            $r = $killerobj->getProcessList($_GET['server']);
            usort($r, function ($proc1, $proc2) {
                if ($proc1->Time * 1 == $proc2->Time * 1)
                    return 0;
                return ($proc1->Time * 1 > $proc2->Time * 1) ? -1 : 1;
            });
            echo json_encode($r);





            break;


        case "getPHP":

            $r = $killerobj->getPHPProcessList($_GET['server']);
            
            echo json_encode($r);





            break;

        case "kill":
            if (isset($_GET['procs'])) {
                echo  $killerobj->killProcessList($_GET['procs'], $_GET['server']);
            }


            break;

        case "getservers":

            echo  $killerobj->getServers();



            break;
    }
}
