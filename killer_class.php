<?php


require "server_class.php";

class killer
{



    private $servers = [];

    private $server = '192.168.0.65';
    private $base = 'zod00';
    private $user = 'nt';
    private $bdpassword = 'pr04ptz3';


    function __construct()
    {
        $this->servers = [
            null,


            new Server('192.168.0.61', "3306", 'nt', 'nt', 'pr04ptz3', "Сервер Team"),
            new Server('192.168.0.67', "3306", 'nordcom', 'vlad', 'ckj;ysqnc', "Сервер Web"),

            new Server('192.168.0.65', "3306", 'zod00', 'nt', 'pr04ptz3', "ЦОД-0"),
            new Server('192.168.0.65', "3306", 'zod01', 'nt', 'pr04ptz3', "ЦОД-1 (ПТЗ)"),
            new Server('192.168.1.202', "3306", 'zod02', 'nt', 'pr04ptz3', "ЦОД-2 (СПБ)"),
            new Server('91.107.32.96', "12165", 'zod03', 'nt', 'pr04ptz3', "ЦОД-3 (МСК)", 12167),


        ];
    }

    function connectDB($server)
    {


        $connection = mysqli_connect($this->servers[$server]->server, $this->servers[$server]->user, $this->servers[$server]->bdpassword, $this->servers[$server]->base, $this->servers[$server]->port);
        mysqli_query($connection, "set names utf8");
        if (!$connection) {
            die("Ошибка подключения к базе");
        }

        return $connection;
    }



    function getProcessList($server)

    {

        if ($server != 0) {

            $connection = $this->connectDB($server);
            $sqlresult = mysqli_query($connection, "show full processlist");
            $result = [];
            while ($temp = mysqli_fetch_assoc($sqlresult)) {
                $temp = array_merge($temp, array("server" => $this->servers[$server]->comment));
                $result[] = $temp;
            }



            return $result;
        } else {
            $result = [];
            for ($t = 1; $t < count($this->servers); $t++) {
                $result = array_merge($result, $this->getProcessList($t));
            }

            return $result;
        }
    }



    function getPHPProcessList($server)

    {

        if ($server != 0) {

            return file_get_contents("http://" . $this->servers[$server]->server . ":" . $this->servers[$server]->httpport . "/status?full&json");
        }
    }


    function getPHPLocalProcessList()
    {


        $addr = "http://" . $_SERVER['SERVER_ADDR'] . "/status?full&json";
        return file_get_contents($addr);
    }

    function findServerPort()
    {

        foreach ($this->servers as $searchItem) {
            if ($_SERVER['SERVER_ADDR'] == $searchItem->server) return $searchItem->httpport;
        }
        return -1;
    }



    function checkproc($file, $limit)
    {

   

        $procs = json_decode($this->getPHPLocalProcessList());
        $ctr = 0;
        foreach ($procs->processes as $pocess) {
         

            if ($pocess->script == $file) {
              $ctr++;

                if ($ctr > $limit) {
                    echo "Превышен лимит ($limit) для скрипта $file";
                    exit;
                }
            }
        }
    }



    function killProcessList($processes, $server)

    {
        $connection = $this->connectDB($server);
        $procArray = explode(",", $processes);
        for ($t = 0; $t < count($procArray); $t++) {

            $sqlresult = mysqli_query($connection, "kill " . $procArray[$t]);
        }

        $r = $this->getProcessList($server);
        usort($r, function ($proc1, $proc2) {
            if ($proc1->Time * 1 == $proc2->Time * 1)
                return 0;
            return ($proc1->Time * 1 > $proc2->Time * 1) ? -1 : 1;
        });
        return  json_encode($r);
    }

    function getServers()
    {
        $result = [];
        for ($t = 0; $t <= count($this->servers); $t++) {
            $result[] = $this->servers[$t];
        }
        return json_encode($result);
    }



    /////////////////////utility functions







}
