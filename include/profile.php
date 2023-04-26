    <?php if($user) { ?>
        <div class="login_info navbar">
                    <div class="logged">
                    <div id="Avatar"><img class="avatar" src="<?=$user['avatar']?>">
                        <p class="user_deatils">
                            <span><?=$user['name']?></span>
                            <span class="User_balance coin_icon">0</span>
                        </p>
                        <div class="option-tabs">
                            <div class="dropdown-toggle" type="button" data-toggle="dropdown"><img class="more-button" src="assets/images/more.png"></div>
                            <ul class="dropdown-menu">
                                <li><a class="set-trade-url" href="#">Set trade URL</a></li>
                                <li><a class="find-steamid" href="#">Find SteamID</a></li>
                                <li><a href="thistory">Transaction History</a></li>
                                <li><a href="exit">Log out</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="Dep_With_Buttons">
                        <a href="deposit" class="Deposit-Button">Deposit</a>
                        <a href="withdraw" class="Withdraw-Button">Withdraw</a>
                    </div>
                </div>
        </div>
    <?php }else{ ?>
        <div class="login_info navbar">
            <div class="welcome-mes">
                <p>
                    Welcome to CSGOEcho,<br>
              by clicking on sign button you’re accepting<br>
              and confirming you are at least 18 years old<br>
              and you’ve read and understood
                    <a href="tos">Terms of Service</a>.
                    <div>
                        <a href="login">
                            <img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png">
                        </a>
                    </div>
                </p>
            </div>
         </div>
    <?php } ?>