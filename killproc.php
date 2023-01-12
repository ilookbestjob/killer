<?php

if (!isset($_GET['key'])||!isset($_GET['procs'])) exit;

if ($_GET['key']!="gsgbmr4t86664gg7rew797fvvc8ds9rb9vxcrg9db9bvb9gfdgdf79greg79gdf79") exit;


$procs=explode(",",$_GET['procs']);

foreach($procs as $proc){


    exec("kill $proc");



}
