<?php 
    require_once('connection.php');
    session_start();

    $value = $_SESSION['email'];
    $_SESSION['email'] = $value;
    
    $sql="select * from users where EMAIL='$value'";
    $name = mysqli_query($con,$sql);
    $rows=mysqli_fetch_assoc($name);
    $sql2="select *from cars where AVAILABLE='Y'";
    $cars= mysqli_query($con,$sql2);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Details - APEX DRIVE</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body class="body">

  <div class="cd">
    <div class="main">
        <div class="navbar">
            <div class="icon">
                <h2 class="logo">APEX</h2>
            </div>
            <div class="menu">
               
                <ul>
                    <li><a href="#">HOME</a></li>
                    <li><a href="aboutus2.html">ABOUT</a></li>
                    
                    <li><a href="contactus2.html">CONTACT</a></li>
                    <li><a href="feedback/Feedbacks.php">FEEDBACK</a></li>
                    <li><button class="nn"><a href="index.php">LOGOUT</a></button></li>
                    <li><img src="images/profile.png" class="circle" alt="Alps"></li>
                    <li><p class="phello">HELLO! &nbsp;<a id="pname"><?php echo $rows['FNAME']." ".$rows['LNAME']?></a></p></li>
                    <li><a id="stat" href="bookinstatus.php">BOOKING STATUS</a></li>
                </ul>
            </div>
            
            
        </div>
      <div><h1 class="overview">OUR CARS OVERVIEW</h1>

    <ul class="de">
    <?php
        while($result= mysqli_fetch_array($cars))
        {
            // echo $result['CAR_ID'];
            // echo $result['AVAILABLE'];
            
    ?>    
    
    <li>
    <form method="POST">
    <div class="box">
       <div class="imgBx">
            <img src="images/<?php echo $result['CAR_IMG']?>">
        </div>
        <div class="content">
            <?php $res=$result['CAR_ID'];?>
            <h1><?php echo $result['CAR_NAME']?></h1>
            <h2>Fuel Type : <a><?php echo $result['FUEL_TYPE']?></a> </h2>
            <h2>CAPACITY : <a><?php echo $result['CAPACITY']?></a> </h2>
            <h2>Rent Per Day : <a>₹<?php echo $result['PRICE']?>/-</a></h2>
            <button type="submit"  name="booknow" class="utton" style="margin-top: 5px;"><a href="booking.php?id=<?php echo $res;?>">book</a></button>
        </div>
    </div></form></li>
    <?php
        }
    
    ?>

    </ul>
    </div>
  </div>
  </div>
    
    

 
    
     
</body>
</html>