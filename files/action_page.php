<?php
    $name = $_POST['name'];
    $number = $_POST['number'];
    $email = $_POST['email'];
    $message = $_POST['message'];

    $email_subject = "new message from site";

    $email_body =   "Name: $name\n".
                    "user eamil: $email\n".
                    "Massge: $message\n";
    
    $to = "abhi.agni00@gmail.com";

    mail($to,$email_subject,$email_body);
    header("index.html");
?>