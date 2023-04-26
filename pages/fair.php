<html>
<head>
    <meta charset="UTF-8">
    <title>CSGOEcho - project</title>
    <meta property="og:title" content="CSGOEcho" />
    <meta property="og:type" content="website" />
    <meta name="description" content="CSGOEcho - a new project coming soon!">

    <link rel="icon" type="image/png" href="http://csgocasino.net/favicon.png" />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css">
    <link rel="stylesheet" href="assets/css/main.css?v=<?=time()?>">
    <link rel="stylesheet" href="assets/css/roulette.css?v=<?=time()?>">
    <link rel="stylesheet" href="assets/css/jquery.ambiance.css">

</head>
<body class="black">
    <?php include 'include/nav.php'; ?>
	<div class="row container">
	   	<div class="col-md-3 col-sm-4 left-col">
        <?php include 'include/profile.php'; ?>
    <div class="chat-area">
        <div class="chat-area-header">
            <a class="chat-rules chat-text" href="#">Chat Rules</a>
            
            <h4 class="online"><div class="online_icon"></div><span class="players-online">0</span> Online</h4>
        </div>

        <div id="Chat" class="chat">
            <div class="messages"></div>
        </div>

        <div class="form-group">
            <input type="text" class="text-box chat-input" id="inputSuccess2" aria-describedby="inputSuccess2Status">
        </div>
    </div>
    
</div>		        <!-- HOME -->

  <div class="fair col-md-9 col-sm-8 site-area">
    <div class="fair-content">
        <p>All rolls on CSGOEcho are generated using a provably fair system. This means the operators cannot manipulate the outcome of any roll. Players may replicate any past roll using the below code:</p>
        <pre>
$id = "1";
$secret = "WoLQG8qcZpGt";
$winningNumber = "12";
$hash = "c9115179690573d74a4f94f4c07a724788c4af5b9a374926069f9c95d139ccca";
$lottery = "1499956916";
$code = hash("sha256", $hash . "-" . $secret . "-" . $lottery);
$getWinningNumber = hexdec(substr($code, 0, 8)) % 15;
if($winningNumber == $getWinningNumber)
{
    echo "Hash does match!";
}
else
{
    echo "Hash does not match!";
}
        </pre>
        <p>You can execute the code on <a target="_blank" href="http://phptester.net">phptester.net</a>.</p>
        <table class="table provably-fair-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Secret</th>
                    <th>Roll</th>
                    <th>Hash</th>
                    <th>Lottery</th>
                </tr>
            </thead>
            <tbody>
                <?php

                    foreach($rolls as $key => $value)
                    {
                        if($value['cifra'] >= 1 && $value['cifra'] <= 7)
                        {
                         echo '<tr style="color:red"><td>' . $value['id'] . '</td><td>' . $value['secret'] . '</td><td>' . $value['cifra'] . '</td><td>' . $value['hash'] . '</td><td>' . $value['lottery'] . '</td>';
                        }
                        else if($value['cifra'] >= 8 && $value['cifra'] <= 14)
                        {
                         echo '<tr style="color:gray"><td>' . $value['id'] . '</td><td>' . $value['secret'] . '</td><td>' . $value['cifra'] . '</td><td>' . $value['hash'] . '</td><td>' . $value['lottery'] . '</td>';
                        }
                        else if($value['cifra'] == 0)
                        {
                         echo '<tr style="color:green"><td>' . $value['id'] . '</td><td>' . $value['secret'] . '</td><td>' . $value['cifra'] . '</td><td>' . $value['hash'] . '</td><td>' . $value['lottery'] . '</td>';
                        }
                    }
                 ?>
            </tbody>
        </table>
    </div>
</div>
    </div>
</div>
    </div>

    <!-- MODALS HEREH -->

    <?php include 'include/modals.php'; ?>

   

    <!-- SCRIPTS HERE -->

    <script>
        var typeW = 'fair';
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.2/TweenMax.min.js"></script>
    <script src="assets/js/jquery.js"></script>
    <script src="assets/js/jquery.ambiance.js"></script>
    <script src="assets/js/jquery.countTo.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.bez.js"></script>
    <script src="assets/js/socket.js"></script>
    <script src="assets/js/main.js?v=<?=time()?>"></script>

    </body>
</html>