var socket = null;
$(function() {
	var rolling_audio = new Audio('assets/sounds/rolling.wav');
	rolling_audio.volume = 0.3;
	var done_audio = new Audio('assets/sounds/done.wav');
	done_audio.volume = 0.3;
	window.roulette = ({
		_rolling: false,
		_order: [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8],
		_position: 0,
		_animStart: 0,
		_snapX: 0,
		_R: 0.999,
		_S: 0.01,
		_tf: 0,
		_vi: 0,
		_LOGR: Math.log(0.999),
		_wheel: $('.roulette'),
        _numberToColor: function(num) {
            if (num === 0) { return 'green'; }
            else if (num < 8) { return 'red'; }
            else { return 'black'; }
        },
		snapRender: function(x, wooble) {
		    if (roulette._rolling) return;
		    else if (typeof x === 'undefined') roulette.view(roulette._snapX);
		    else {
		        for (var i = 0; i < roulette._order.length; i++) {
		            if (x == roulette._order[i]) {
		                roulette._position = i;
		                break
		            }
		        }
		        var max = 32;
		        var min = -32;
		        var w = Math.floor(wooble * (max - min + 1) + min);
		        var dist = roulette._position * 70 + 36 + w;
		        dist += 1050 * 5;
		        roulette._snapX = dist;
		        roulette.view(roulette._snapX);
		    }
		},
		spinRoulette: function(m) {
		    var x = m.number;
		    if(typeW == 'roulette') rolling_audio.play();
		    for (var i = 0; i < roulette._order.length; i++) {
		        if (x == roulette._order[i]) {
		            roulette._position = i;
		            break
		        }
		    }
		    var max = 32;
		    var min = -32;
		    var w = Math.floor(m.wooble * (max - min + 1) + min);
		    var dist = roulette._position * 70 + 36 + w;
		    dist += 1050 * 5;
		    roulette._animStart = new Date().getTime();
		    roulette._vi = roulette.getVi(dist);
		    roulette._tf = roulette.getTf(roulette._vi);
		    roulette._rolling = true;
		    setTimeout(function() {
		        roulette.finishRoll(m, roulette._tf);
		    }, roulette._tf);
		    roulette.render();
		},
		dmod: function(vi, t) {
			return vi * (Math.pow(roulette._R, t) - 1) / roulette._LOGR;
		},
		getTf: function(vi) {
			return (Math.log(roulette._S) - Math.log(vi)) / roulette._LOGR;
		},
		getVi: function(df) {
			return roulette._S - df * roulette._LOGR;
		},
		v: function(vi, t) {
			return vi * Math.pow(roulette._R, t);
		},
		render: function() {
			var t = new Date().getTime() - roulette._animStart;
			if (t > roulette._tf)
				t = roulette._tf;
			var deg = roulette.dmod(roulette._vi, t);
			roulette.view(deg);
			if (t < roulette._tf) {
				requestAnimationFrame(roulette.render);
			} else {
				roulette._snapX = deg;
				roulette._rolling = false;
			}
		},
		view: function(offset) {
			offset = -((offset + 1050 - roulette._wheel.width() / 2) % 1050);
			roulette._wheel.css("background-position", offset + "px 0px");
		},
		countDown: function(ms) {
			$("#rolling .progress-line").finish().css("width", "100%");
			$("#rolling .progress-line").animate({
				width: "0%"
			}, {
				"duration": ms * 1000,
				"easing": "linear",
				progress: function(a, p, r) {
					var c = (r / 1000).toFixed(2);
					$('.rolling').text('Rolling in ' + c + '...');
					if($('.bet-button').hasClass('disabled')) return $('.bet-button').removeClass('disabled');
				},
				complete: function() {
					$('.bet-button').addClass('disabled');
					$('.rolling').text('Rolling...');
				}
			});
		},
		finishRoll: function(m, tf) {
			$('.rolling').text("CSGOEcho rolled " + m.number + "!");
			if(typeW == 'roulette') done_audio.play();
			roulette.addHistory(m.number);
            $('.total-bet-amount').addClass('lose');
            var a =  $('.total-bet-amount.' + roulette._numberToColor(m.number) + '-total');
            var b = $('.your-bet.bet-on-' + roulette._numberToColor(m.number));
            a.removeClass('lose').addClass('win').text(parseInt(a.text()) * (m.number === 0 ? 14 : 2));
            b.removeClass('lose').addClass('win').text(parseInt(b.text()) * (m.number === 0 ? 14 : 2));
			setTimeout(function() {
				$('.total-bet-amount').text('0');
				$('.total-bet-amount').data('value','0');
				$('.your-bet').data('value','0');
				$('.your-bet').text('0');
				$('.player-bets').empty();
				a.removeClass('win');
				b.removeClass('win');
				$('.total-bet-amount').removeClass('lose');
			}, 1500);
		},
		addHistory: function(roll) {
			if($('.latest .last').length >= 9) 
			{
				$('.latest .last').first().remove();
			}
			if(roll >= 1 && roll <= 7)
			{
				$('.latest').append('<div class="red-last-color last"><span>' + roll + '</span></div>');
			}
			else if(roll >= 8 && roll <= 14)
			{
				$('.latest').append('<div class="black-last-color last"><span>' + roll + '</span></div>');
			}
			else if(roll == 0)
			{
				$('.latest').append('<div class="green-last-color last"><span>' + roll + '</span></div>');
			}
		},
        addBet: function(value, bet, user, avatar, name) {
            if (typeof user !== 'undefined' && user === $('.yoursteamid').text()) {
                var myBet = $('.your-bet.bet-on-' + bet);
                myBet.data('value', parseInt(myBet.data('value')) + parseInt(value)).text(myBet.data('value'));
            }

            var totalBet = $('.total-bet-amount.' + bet + '-total');
            totalBet.data('value', parseInt(totalBet.data('value')) + parseInt(value)).text(totalBet.data('value'));

            $(roulette._generateBetFromData(value, bet, user, avatar, name)).hide().prependTo('.' + bet + '-bet .player-bets').fadeIn(500);

            roulette.sortColor(bet);
        },
        sortColor: function(bet) {
            var $wrapper = $('.'+bet+'-bet .player-bets');
            $wrapper.find('.player-bet').sort(function (a, b) {
                    return +b.dataset.sort - +a.dataset.sort;
                })
                .appendTo( $wrapper );
        },
        _generateBetFromData: function(value, bet, user, avatar, name) {
            return '<div class="player-bet" data-sort="'+value+'"><div class="user player-bet-item col-xs-10"><img src="' + avatar + '">' + name + '</div><div class="amount player-bet-item col-xs-2"><span class="coin_icon2"></span>' + value + '</div></div>'
        },
		connect_socket: function() {
			if (!socket)
			{
		        var hash = getCookie('hash');
		        if (hash == "") {
		            //$.ambiance({message: 'You must login!'});
		        }
		        if (hash != "") {
		            //$.ambiance({message: 'Connecting to server...', type: 'error'});
		        }
		        socket = io(':3290');
		        socket.on('connect', function(msg) {
		            if (hash != "") {
		                //$.ambiance({message: 'Connected!', type: 'success'});
		                $('.rolling').text('Connected!');
		            }
		            socket.emit('hash', {
		                hash: hash
		            });
		        });
		        socket.on('connect_error', function(msg) {
		            //$.ambiance({message: 'Connection lost!', type: 'error'});
		        });

		        socket.on('disconnect', function(m) {
		            socket.emit('disconnect', {
		                uhash: hash
		            });
		        });

				socket.on('connections', function(total) {
					$('.players-online').text(total);
				});

				socket.on('roulette_balance', function(balance) {
					$('.User_balance').countTo({to: balance, speed: 70, refreshInterval: 1});
					$('.value').countTo({to: balance, speed: 70, refreshInterval: 1});
				});

				socket.on('connected', function(balance, steamid, tradeurl, lastRoll, lastWooble) {
					$('.User_balance').countTo({to: balance, speed: 50, refreshInterval: 1});
					$('.value').countTo({to: balance, speed: 50, refreshInterval: 1});
					if(lastRoll != -1)
					{
						roulette._position = lastRoll;
						roulette.snapRender(roulette._position, lastWooble);
					}
					$('.yoursteamid').text(steamid);
					$('.tradeurlinput').val(tradeurl);
				});

				socket.on('addMessage', function(m) {
			        if(m.tip == 'clear')
			        {
			            $('.chat .messages').empty();
						$('.chat .messages').append('<div class="message" data-id="0" data-username="' + m.name + '" data-rank="-1"><img src="' + m.avatar + '"><div><p class="username user">' + m.name + '</p><p class="text">' + m.msg + '</p></div></div>');			            return;
			        }

					if(m.rank == 69)
					{
						m.msg = '<b><span style="color:red">' + m.msg + '</span></b>';
					}

					$('.chat .messages').append('<div class="message" data-id="' + m.steamid + '" data-username="' + m.name + '" data-rank="' + m.rank + '"><img src="' + m.avatar + '"><div><p class="username user">' + m.name + '</p><p class="text">' + m.msg + '</p></div></div>');
			        
					$('#Chat').animate({scrollTop: $(document).height() + $('#Chat').height()});
				});

				socket.on('roulette_start', function(timer) {
					roulette.countDown(timer);
				});

				socket.on('roulette_hash', function(hash) {
					$('.info').html('Round hash: ' + hash + '<br>Secret: <span class="secretRound">hidden</span>');
				});

				socket.on('roulette_bets', function(bets) {
					$('.total-bet .red-total').text(bets['red']);
					$('.total-bet .green-total').text(bets['green']);
					$('.total-bet .black-total').text(bets['black']);
				});

				socket.on('roulette_secret', function(secret) {
					$('.secretRound').text('');
					$('.secretRound').addClass('fadeIn')
					$('.secretRound').text(secret);
				});

				socket.on('roulette_newbet', function(value, bet, user, avatar, name) {
					roulette.addBet(value, bet, user, avatar, name);
				});

				socket.on('roulette_roll', function(roll, wooble) {
					var emit = ({
						number: roll,
						wooble: wooble
					});
					roulette.spinRoulette(emit);
				});

				socket.on('roulette_addroll', function(rolls) {
					rolls = rolls.split('/');
					if(rolls == '') return;
					for(var i in rolls)
					{
						roulette.addHistory(rolls[i]);
					}
				});

				socket.on('msg', function(det) {
					if(det.tip == 'alert')
					{
						$.ambiance({message: det.msg, type: 'success'});
					}
					else if(det.tip == 'error')
					{
						$.ambiance({message: det.msg, type: 'error'});
					}
					else
					{
						$.ambiance({message: det.msg});
					}
				});
		    }
		},
		send_message: function(msg) {
			if(socket)
			{
				var hash = getCookie('hash');
				socket.emit('nMsg', {
					message: msg,
					user: hash
				});
			}
		},
		change_turl: function(url) {
			if(socket)
			{
				var hash = getCookie('hash');
				socket.emit('setSteamid', hash, url);
			}
		}
	});
	roulette.connect_socket();
	$('#inputSuccess2').val('');

	$('.chat-rules').click(function() {
		$('#chatRules').modal();
	});

	$('.chat-input').on('keypress', function(e) {
        if (e.keyCode == 13) {
            roulette.send_message($('#inputSuccess2').val().replace(/<(?:.|\n)*?>/gm, ''));
            $('#inputSuccess2').val('');
            return false;
        }
	});

	$('.set-trade-url').click(function() {
		$('#tradeUrl').modal();
	});

	$('.find-steamid').click(function() {
		$('#mysteamid64').modal();
	});

	$('.submitturl').click(function() {
		roulette.change_turl($('.tradeurlinput').val());
	});

	$('.buttons').on('click', '.button', function() {
        var input = $('input.bet');
        switch($(this).data('action')) {
            case 'clear':
                input.val('0');
                break;
            case 'min':
                input.val('1');
                break;
            case 'max':
                input.val($('.value').text());
                break;
            case '+1':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 1);
                break;
            case '+10':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 10);
                break;
            case '+100':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 100);
                break;
            case '+1000':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(input.val()) + 1000);
                break;
            case '1/2':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(parseInt(input.val()) / 2));
                break;
            case 'x2':
                if (!isNaN(parseInt(input.val()))) input.val(parseInt(parseInt(input.val()) * 2));
                break;
        }
    });

    $('.bet-button').on('click', function() {
        var value = parseInt($('input.bet').val());
        if (!isNaN(value) && value > 0) {
            socket.emit('roulette_addbet', value, $(this).data('bet'), getCookie('hash'));
        } else {
            $('input.bet').val('0');
        }
    });


	function setCookie(cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}

});