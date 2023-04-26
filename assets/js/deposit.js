$(function() {

    window.deposit = ({
        _minCoinsToDeposit: 3,
        _totalValue: 0,
        _algorithm: 'price desc',
        _inventory: $('.items.inventory'),
        _userChoice: $('.items.user'),
        _confirmationButton: $('.confirm-button'),
        _selected: [],
        _inProgress: false,
        set totalValue(x) {
            this._totalValue = x;
            $('.deposit-value').text(x);
        },
        get totalValue() {
            return this._totalValue;
        },
        set algorithm(x) {
            this._algorithm = x;
            this.sort();
        },
        sort: function() {
            switch (this._algorithm) {
                default:
                case 'price desc':
                    this._inventory.html($('.item', this._inventory).sort(function(a, b) {return $(b).data('price') - $(a).data('price');}));
                    this._userChoice.html($('.item', this._userChoice).sort(function(a, b) {return $(b).data('price') - $(a).data('price');}));
                    break;
                case 'price asc':
                    this._inventory.html($('.item', this._inventory).sort(function(a, b) {return $(a).data('price') - $(b).data('price');}));
                    this._userChoice.html($('.item', this._userChoice).sort(function(a, b) {return $(a).data('price') - $(b).data('price');}));
                    break;
                case 'name desc':
                    this._inventory.html($('.item', this._inventory).sort(function(a, b) {return $(a).data('market-hash-name').localeCompare($(b).data('market-hash-name'));}));
                    this._userChoice.html($('.item', this._userChoice).sort(function(a, b) {return $(a).data('market-hash-name').localeCompare($(b).data('market-hash-name'));}));
                    break;
                case 'name asc':
                    this._inventory.html($('.item', this._inventory).sort(function(a, b) {return $(b).data('market-hash-name').localeCompare($(a).data('market-hash-name'));}));
                    this._userChoice.html($('.item', this._userChoice).sort(function(a, b) {return $(b).data('market-hash-name').localeCompare($(a).data('market-hash-name'));}));
                    break;
            }
        }
    });

    $('.search').on('input', function() {
        $('.item', deposit._inventory).each(function() {
            if($(this).data('market-hash-name').toLowerCase().indexOf($('.search').val().toLowerCase()) === -1) {
                $(this).hide();
            } else {
                $(this).show();
            }
        });
        deposit.sort();
    });

    $('.force-reload').click(function() {
        socket.emit('deposit.force_reload', getCookie('hash'));
    });

    $('.select-box').on('change', function() {
        deposit.algorithm = $(this).val();
    });

    deposit._inventory.on('click', '.item', function() {
        if (deposit._inProgress) return;
        if ($(this).hasClass('junk')) return;
        if (deposit._selected.length >= 20) return $.ambiance({message: 'You can add only 20 items at once!', type: 'error'});
        $(this).detach().appendTo(deposit._userChoice);
        deposit.totalValue = deposit.totalValue + parseInt($(this).data('price'));
        deposit._selected.push($(this).data('id'));
        deposit.sort();
    });

    deposit._userChoice.on('click', '.item', function() {
        if (deposit._inProgress) return;
        $(this).detach().appendTo(deposit._inventory);
        deposit.totalValue = deposit.totalValue - parseInt($(this).data('price'));
        deposit._selected.splice(deposit._selected.indexOf($(this).data('id')), 1);
        deposit.sort();
    });

    deposit._confirmationButton.click(function() {
        if (deposit._inProgress) return;
        $(this).addClass('disabled');
        deposit._inProgress = true;
    	var bot = Math.floor(Math.random() * (1 - 1 + 1)) + 1;
    	var pickBot = 3030 + bot;
        $.ambiance({message: 'Deposit request sent to bot!', type: 'success'});
    	$.ajax({
    		url: 'http://46.101.118.105:' + pickBot + '/deposit?ids=' + deposit._selected.join(',') + '&hash=' + getCookie('hash'),
    		type: 'GET',
    		success: function(data) {
    			if(data)
    			{
    				$.ambiance({message: data.msg, type: data.type});
                    $('.deposit-item-button').removeClass('disabled');
                    deposit._inProgress = false;
    			}
    		},
    		error: function(error) {
    			$.ambiance({message: 'An error ocurred while contacting bot! Try again!', type: 'error'});
                $('.deposit-item-button').removeClass('disabled');
                deposit._inProgress = false;
    		}
    	});
    });

	socket.on('getInventory', function(data) {
        $('.inventory').empty();
        setTimeout(function() {
            data.id = data.id.split('/');
            data.name = data.name.split('/');
            data.price = data.price.split('/');
            data.img = data.img.split('/');
            data.exterior = data.exterior.split('/');
            if(data.id == '')
            {
                $.ambiance({message: 'User inventory could\'t load because it has 0 items!', type: 'error'});
                return;
            }
            for(var i in data.id)
            {
                if(data.exterior[i] == '')
                {
                    data.exterior[i] = '-';
                }
                if(data.price[i]*100 < deposit._minCoinsToDeposit)
                {
                    $('.inventory').append('<div class="item junk" data-id="' + data.id[i] + '" data-market-hash-name="' + data.name[i] + '" data-price="' + parseInt(data.price[i]*100) + '"><span class="item-name">' + data.name[i] + '<br><span class="item-extrior">' + data.exterior[i] + '</span></span><img src="https://steamcommunity-a.akamaihd.net/economy/image/' + data.img[i] + '/130fx130f"><span class="price"><span class="coin_icon2"></span>' + parseInt(data.price[i]*100) + '</span></div>')  
                }
                else
                {
                    $('.inventory').append('<div class="item" data-id="' + data.id[i] + '" data-market-hash-name="' + data.name[i] + '" data-price="' + parseInt(data.price[i]*100) + '"><span class="item-name">' + data.name[i] + '<br><span class="item-extrior">' + data.exterior[i] + '</span></span><img src="https://steamcommunity-a.akamaihd.net/economy/image/' + data.img[i] + '/130fx130f"><span class="price"><span class="coin_icon2"></span>' + parseInt(data.price[i]*100) + '</span></div>')   
                }
            }
            deposit.sort();
            if(!data.message1) return;
            $.ambiance({message: data.message1, type: 'gray'});
        }, 500);
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