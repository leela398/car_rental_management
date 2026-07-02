<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Booking - APEX DRIVE</title>
    <link rel="stylesheet" href="css/style.css">
    <script type="text/javascript">
        function preventBack() {
            window.history.forward(); 
        }
          
        setTimeout("preventBack()", 0);
          
        window.onunload = function () { null };
    </script>
</head>
<body class="booking-page">


<?php 

    require_once('connection.php');
    session_start();
 
    $carid=$_GET['id'];
    
    $sql="select *from cars where CAR_ID='$carid'";
    $cname = mysqli_query($con,$sql);
    $email = mysqli_fetch_assoc($cname);
    
    $value = $_SESSION['email'];
    $sql="select * from users where EMAIL='$value'";
    $name = mysqli_query($con,$sql);
    $rows=mysqli_fetch_assoc($name);
    $uemail=$rows['EMAIL'];
    $carprice=$email['PRICE'];
    if(isset($_POST['book'])){
       
        $bplace=mysqli_real_escape_string($con,$_POST['place']);
        $bdate=date('Y-m-d',strtotime($_POST['date']));;
        $dur=mysqli_real_escape_string($con,$_POST['dur']);
        $phno=mysqli_real_escape_string($con,$_POST['ph']);
        $des=mysqli_real_escape_string($con,$_POST['des']);
        $rdate=date('Y-m-d',strtotime($_POST['rdate']));
         
        if(empty($bplace)|| empty($bdate)|| empty($dur)|| empty($phno)|| empty($des)|| empty($rdate)){
            echo '<script>alert("please fill the place")</script>';

        }
        else{
            if($bdate<$rdate){
            $price=($dur*$carprice);
            $sql="insert into booking (CAR_ID,EMAIL,BOOK_PLACE,BOOK_DATE,DURATION,PHONE_NUMBER,DESTINATION,PRICE,RETURN_DATE) values($carid,'$uemail','$bplace','$bdate',$dur,$phno,'$des',$price,'$rdate')";
            $result = mysqli_query($con,$sql);
            
            if($result){
                
                $_SESSION['email'] =$uemail;
                header("Location: payment.php");
            }
            else{
                echo '<script>alert("please check the connection")</script>';
            }
        }
        else{
            echo  '<script>alert("please enter a correct rturn date")</script>';
        }
    
        }
    }
    
    ?>



    
       <div class="hai">
            <div class="navbar">
                <div class="icon">
                    <h2 class="logo">APEX</h2>
                </div>
                <div class="menu" >
                    <ul>
                        <li ><a href="cardetails.php">HOME</a></li>
                        <li><a href="aboutus2.html">ABOUT</a></li>
                        <li><a href="#">DESIGN</a></li>
                        <li><a href="contactus2.html">CONTACT</a></li>
                        <li><button class="nn"><a href="index.php">LOGOUT</a></button></li>
                        <li><img src="images/profile.png" class="circle" alt="Alps"></li>
                    <li><p class="phello">HELLO! &nbsp;<a id="pname"><?php echo $rows['FNAME']." ".$rows['LNAME']?></a></p></li>

                    
                    </ul>
                </div>
            </div>
       </div>
                
                
         <div class="main"> 
        
        <div class="register">
            <h2>BOOKING</h2>
        <form id="register" method="POST"  >
            <h2>CAR NAME : <?php echo "".$email['CAR_NAME']?></h2>
            <label>BOOKING PLACE : </label>
            <br>
            <input type="text" name="place"
            id="name" placeholder="Enter Your Destination">
            <br><br>

            <label>BOOKING DATE : </label>
            <br>
            <input type ="date" name="date"
            id="datefield" min='1899-01-01' max='2000-13-13'  placeholder="ENTER THE DATE FOR BOOKING">
            <br><br>

            <label>DURATION : </label>
            <br>
            <input type ="number" name="dur" min="1" max="30" 
            id="name" placeholder="Enter Rent Period (in days)">
            <br><br>

            <label>PHONE NUMBER : </label>
            <br>
            <input type="tel" name="ph" maxlength="10"
            id="name" placeholder="Enter Your Phone Number">
            <br><br>
            
            <label>DESTINATION : </label>
            <br>
            <input type="text" name="des"
            id="name" placeholder="Enter Your Destination">
            <br><br>

            <label>Return date : </label>
            <br>
            <input type ="date" name="rdate"
            id="dfield"  min='1899-01-01' placeholder="Enter The Return Date">
            <br><br>
            <input type="submit"  class="btnn" value="BOOK" name="book" >
            
        </form>
        </div>
    </div>
    
    <script>
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
             dd = '0' + dd
        }
        if (mm < 10) {
              mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        document.getElementById("datefield").setAttribute("min", today);
        document.getElementById("datefield").setAttribute("max", today);


    </script>
    <script>
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
             dd = '0' + dd
        }
        if (mm < 10) {
              mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        document.getElementById("dfield").setAttribute("min", today);
        


    </script>
    
    
    
    
</body>
</html>