<?php


require "server_class.php";

class killer
{



    private $servers = [];

    function __construct()
    {
        $this->servers = [
            null,


            new Server('192.168.0.61', "", '', '', '', "Сервер Team"),
            new Server('212.109.14.195', "", '', '', '', "Сервер Web"),

            new Server('192.168.0.65', "", '', '', '', "ЦОД-0"),
            new Server('192.168.0.65', "", '', '', '', "ЦОД-1 (ПТЗ)"),
            new Server('192.168.1.199', "", '', '', '', "ЦОД-2 (СПБ)"),
            new Server('91.107.32.96', "", '', '', '', "ЦОД-3 (МСК)"),


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
            $result[] = $this->servers[$t]->comment;
        }
        return json_encode($result);
    }



    /////////////////////utility functions







}
