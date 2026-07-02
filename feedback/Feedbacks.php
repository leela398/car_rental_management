<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Feedback - APEX DRIVE</title>
    <link rel="stylesheet" href="style_feedback.css">
</head>
<body>

<?php
require_once('../connection.php');
session_start();
$email = $_SESSION['email'];

if(isset($_POST['submit'])){
	$comment=mysqli_real_escape_string($con,$_POST['comment']);
	$sql="insert into feedback (EMAIL,COMMENT) values('$email','$comment')";
	$result = mysqli_query($con,$sql);
	echo '<script>alert("Feedback Sent Successfully!!THANK YOU!!")</script>';
	header("Location: ../cardetails.php");
}
?>

<button class="back-btn"><a href="../cardetails.php">Go To Home</a></button>	

<div class="feedback-container">
    <div class="feedback-left">
        <h2>Provide <span>Feedback</span></h2>
        <p>Please provide your valuable feedback to help us improve your overall car rental experience.</p>
    </div>
    <div class="feedback-right">
        <form method="POST">
            <div class="form-group">
                <label>Name:</label>
                <input type="text" name="name" placeholder="Enter your name" required />
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" placeholder="Enter your email" required/>
            </div>
            <div class="form-group">
                <label>Comments:</label>
                <textarea name="comment" placeholder="Type your message..." required></textarea>
            </div>
            <input type="submit" class="submit-btn" value="SUBMIT" name="submit">
        </form>
    </div>
</div>

</body>
</html>
