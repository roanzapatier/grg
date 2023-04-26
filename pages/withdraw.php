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

<div class="withdraw-container col-md-99 col-sm-8 site-area">
        <div class="col-lg-66 site-inventory">
            <div class="site-inv-content">

                <input class="form-control search" type="text" placeholder="Search...">
                <select class="form-control select select-box">
                    <option value="price desc">Price desc</option>
                    <option value="price asc">Price asc</option>
                    <option value="name desc">Name desc</option>
                    <option value="name asc">Name asc</option>
                </select>
                <div class="items inventory"></div>
            </div>
        </div>
        <div class="col-lg-67 withdraw">
            <div class="withdraw-header">Select items for Withdraw</div>
            <div class="withdraw-content">
                                <div class="items user"></div>
                <span class="balance-text">Balance: <span class="coin_icon2"></span><span class="balance"><?=$user['balance']?></span></span>
                <div class="withdraw-item-button confirm-button">Withdraw Items (<span class="withdraw-value">0</span>)</div>
                
            </div>
        </div>
    </div>
</div>
    </div>

    <!-- MODALS HEREH -->

    <?php include 'include/modals.php'; ?>

   

    <!-- SCRIPTS HERE -->

    <script>
        var typeW = 'withdraw';
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.2/TweenMax.min.js"></script>
    <script src="assets/js/jquery.js"></script>
    <script src="assets/js/jquery.ambiance.js"></script>
    <script src="assets/js/jquery.countTo.js"></script>
    <script src="assets/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery.bez.js"></script>
    <script src="assets/js/socket.js"></script>
    <script src="assets/js/main.js?v=<?=time()?>"></script>
    <script src="assets/js/withdraw.js?v=<?=time()?>"></script>

    </body>
</html>