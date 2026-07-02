<?php 
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    
    // Database Connection Parameters
    $db_host = '127.0.0.1'; // 127.0.0.1 forces TCP connection
    $db_user = 'root';
    $db_pass = '';           // Add password here if your MySQL has one
    $db_name = 'carproject';
    $db_port = 3306;         // Change to 3307 if using XAMPP MySQL alongside standard MySQL

    $con = mysqli_connect($db_host, $db_user, $db_pass, $db_name, $db_port);
    if(!$con)
    {
        echo 'please check your Database connection';
    }
?>