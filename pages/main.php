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

    <div class="col-md-9 col-sm-8 game-area">
        <div class="info"></div>
        <div id="rolling">
            <span class="rolling">Connecting...</span>
            <div class="progress-line"></div>
        </div>
        <div class="roulette"><div class="pointer"></div> </div>
        <div class="latest">
            <span class="balance">
                Balance:
                <span class="value coin_icon2">0</span>
            </span>
            <span class="PERVIOUS">PREVIOUS ROLLS</span>
        </div>

        <div class="controls">
            <div class="buttons">
				<input class="bet" placeholder="0" value="">
                <div class="button" data-action="clear">Clear</div>
                <div class="button" data-action="+1">+1</div>
                <div class="button" data-action="+10">+10</div>
                <div class="button" data-action="+100">+100</div>
                <div class="button" data-action="+1000">+1000</div>
                <div class="button" data-action="1/2">1/2</div>
                <div class="button" data-action="x2">x2</div>
                <div class="button" data-action="max">Max</div>
            </div>
            <div class="clearfix"></div>
        </div>
		<div class="row bets">
            <div class="col-xs-4 red-bet">
				<div class="bet-place">
                    <div class="red-bet-button bet-button" data-bet="red">RED [x2]</div>
					<div class="total-bet total-bet-red row"><span class="col-xs-6 total-bet-text">RED BETS</span><span class="col-xs-6 red-total coin_icon2 total-bet-amount" data-value="0">0</span></div>
				</div>
			</div>
			 <div class="col-xs-4 green-bet">
				<div class="bet-place">
                    <div class="green-bet-button bet-button" data-bet="green">GREEN [x14]</div>
					 <div class="total-bet total-bet-green row"><span class="col-xs-6 total-bet-text">GREEN BETS</span><span class="col-xs-6 green-total coin_icon2 total-bet-amount" data-value="0">0</span></div>
				</div>
			</div>
			 <div class="col-xs-4 black-bet">
				<div class="bet-place">
                    <div class="black-bet-button bet-button" data-bet="black">BLACK [x2]</div>
					<div class="total-bet total-bet-black row"><span class="col-xs-6 total-bet-text">BLACK BETS</span><span class="col-xs-6 black-total coin_icon2 total-bet-amount" data-value="0">0</span></div>
				</div>
			</div>
		</div>
        <div class="row bets">
            <div class="col-xs-4 red-bet ">
                <div class="bet-place background-bets">
                    <div class="center-location"><span class="coin_icon2"></span><div class="bet-on-red your-bet" data-value="0">0</div></div>
                    
                    <div class="player-bets"></div>
                </div>
            </div>
            <div class="col-xs-4 green-bet ">
                <div class="bet-place background-bets">
                    <div class="center-location"><span class="coin_icon2"></span><div class="bet-on-green your-bet" data-value="0">0</div></div>
                   
                    <div class="player-bets"></div>
                </div>
            </div>
            <div class="col-xs-4 black-bet ">
                <div class="bet-place background-bets">
                    <div class="center-location"><span class="coin_icon2"></span><div class="bet-on-black your-bet" data-value="0">0</div></div>
                    
                    <div class="player-bets"></div>
                </div>
            </div>
        </div>
    </div>
</div>
    </div>

    <!-- MODALS HEREH -->

    <?php include 'include/modals.php'; ?>

   

    <!-- SCRIPTS HERE -->

    <script>
        var typeW = 'roulette';
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