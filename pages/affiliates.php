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
                            <p>Use the code to get free 500 coins:</p>
                <div class="input-group p-b-15">
                    <input class="form-control input-box referral" type="text" placeholder="Code">
                    <span class="input-group-btn"><button class="btn btn-secondary referral" type="button">Use code!</button></span>
                </div>
                <hr>
                            <div class="input-group p-b-15">
                    <input class="form-control input-box new-referral" type="text" placeholder="Your Referral Code" value="ECHOO">
                    <span class="input-group-btn"><button class="btn btn-secondary new-referral" type="button">Save Code!</button></span>
                </div>
            <div class="rules">
                <h2>Rules:</h2>
                <ol>
                    <li>Code should be 6 or more characters long</li>
                  <li>Code shouldn't contain any trademark you don't own</li>
                  <li>Code shouldn't contain any name that's not yours</li>
                  <li>Code shouldn't mislead the user (eg. "2500coins" or "10dollars")</li>
                </ol>
                <h2>Affiliates tiers:</h2>
                <ul>
                    <li>Bronze (0 - 74 invites), 1 credit every 300 played</li>
                  <li>Silver (75 - 200 invites), 1 credit every 200 played</li>
                  <li>Golden (over 200 invites), 1 credit every 100 played</li>
                </ul>
                <p>Every user that uses your code will get 500 credits, code owner will % of his bets according to him Affiliate Tier.</p>
            </div>
            <div class="stats">
                <p>Your rank is &lt;b&gt;bronze&lt;/b&gt; with 0 referrers!</p>
                <p><b>Already taken</b> <span class="already-taken">0</span></p>
                <p><b>To take:</b> <span class="to-take">0</span> (<a href="#collect" class="collect-button">Collect</a>)</p>
            </div>
            <div id="DataTables_Table_0_wrapper" class="dataTables_wrapper form-inline dt-bootstrap no-footer"><div class="row"><div class="col-sm-6"><div class="dataTables_length" id="DataTables_Table_0_length"><label>Show <select name="DataTables_Table_0_length" aria-controls="DataTables_Table_0" class="form-control input-sm"><option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select> entries</label></div></div><div class="col-sm-6"><div id="DataTables_Table_0_filter" class="dataTables_filter"><label>Search:<input type="search" class="form-control input-sm" placeholder="" aria-controls="DataTables_Table_0"></label></div></div></div><div class="row"><div class="col-sm-12"><table class="referrals table table-bordered dataTable no-footer" id="DataTables_Table_0" role="grid" aria-describedby="DataTables_Table_0_info" style="width: 1244px;">
                <thead>
                <tr role="row"><th class="sorting" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 190px;" aria-label="SteamID: activate to sort column ascending">SteamID</th><th class="sorting" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 217px;" aria-label="Username: activate to sort column ascending">Username</th><th class="sorting_desc" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 195px;" aria-label="Total bet: activate to sort column ascending" aria-sort="descending">Total bet</th><th class="sorting" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 193px;" aria-label="Creation: activate to sort column ascending">Creation</th><th class="sorting" tabindex="0" aria-controls="DataTables_Table_0" rowspan="1" colspan="1" style="width: 259px;" aria-label="Last Activity: activate to sort column ascending">Last Activity</th></tr>
                </thead>
                <tbody><tr class="odd"><td valign="top" colspan="5" class="dataTables_empty">No data available in table</td></tr></tbody>
            </table></div></div><div class="row"><div class="col-sm-5"><div class="dataTables_info" id="DataTables_Table_0_info" role="status" aria-live="polite">Showing 0 to 0 of 0 entries</div></div><div class="col-sm-7"><div class="dataTables_paginate paging_simple" id="DataTables_Table_0_paginate"><ul class="pagination"><li class="paginate_button previous disabled" id="DataTables_Table_0_previous"><a href="#" aria-controls="DataTables_Table_0" data-dt-idx="0" tabindex="0">Previous</a></li><li class="paginate_button next disabled" id="DataTables_Table_0_next"><a href="#" aria-controls="DataTables_Table_0" data-dt-idx="1" tabindex="0">Next</a></li></ul></div></div></div></div>
        </div>
    </div>
</div>
    </div>

    <!-- MODALS HEREH -->

    <?php include 'include/modals.php'; ?>

   

    <!-- SCRIPTS HERE -->

    <script>
        var typeW = 'affiliates';
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