<?php

class Server{
public $server;
public $port;
public $base;
public $user;
public $bdpassword;
public $comment;
public $httpport;
 

function __construct($fserver,$fport,$fbase,$fuser,$fbdpassword,$fcomment="",$httpport=80)
{
    $this->server =$fserver;
    $this->port = $fport;
    $this->base = $fbase;
    $this->user = $fuser;
    $this->bdpassword = $fbdpassword;
    $this->comment = $fcomment;
    $this->httpport=$httpport;
    
}

}


?>