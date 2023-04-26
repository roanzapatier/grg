$(function() {
    "use strict";

    window.withdraw = ({
        _totalValue: 0,
        _bot: null,
        _algorithm: 'price desc',
        _inventory: $('.items.inventory'),
        _userChoice: $('.items.user'),
        _confirmationButton: $('.confirm-button'),
        _selected: [],
        _inProgress: false,
        set totalValue(x) {
            this._totalValue = x;
            $('.withdraw-value').text(x);
        },
        get totalValue() {
            return this._totalValue;
        },
        set algorithm(x) {
            this._algorithm = x;
            this.sort();
        },
        sort: function() {
            $('.item', withdraw._inventory).each(function() {
                if (withdraw._bot && $(this).data('bot') !== withdraw._bot) {
                    $(this).hide();
                } else {
                    if ($(this).data('filter') !== 'true') $(this).show();
                }
            });
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

    $('.select-box').on('change', function() {
        withdraw.algorithm = $(this).val();
    });

    $('.search').on('input', function() {
        $('.item', withdraw._inventory).each(function() {
            if ($(this).data('market-hash-name').toLowerCase().indexOf($('.search').val().toLowerCase()) === -1) {
                $(this).data('filter', 'true').hide();
            } else {
                $(this).data('filter', 'false').show();
            }
        });
        withdraw.sort();
    });

    withdraw._inventory.on('click', '.item', function() {
        if (withdraw._inProgress) return;
        if ($(this).hasClass('junk')) return;
        if (withdraw._bot && withdraw._bot !== $(this).data('bot')) return;
        if (withdraw._selected.length >= 20) return $.ambiance({message: 'You can add only 20 items at once!', type: 'error'});
        $(this).detach().appendTo(withdraw._userChoice);
        withdraw.totalValue = withdraw.totalValue + parseInt($(this).data('price'));
        withdraw._selected.push($(this).data('id'));
        if (!withdraw._bot) withdraw._bot = $(this).data('bot');
        withdraw.sort();
    });

    withdraw._userChoice.on('click', '.item', function() {
        if (withdraw._inProgress) return;
        $(this).detach().appendTo(withdraw._inventory);
        withdraw.totalValue = withdraw.totalValue - parseInt($(this).data('price'));
        withdraw._selected.splice(withdraw._selected.indexOf($(this).data('id')), 1);
        if (withdraw._selected.length === 0) withdraw._bot = null;
        withdraw.sort();
    });

    withdraw._confirmationButton.on('click', function() {
        if (withdraw._inProgress) return;
        $(this).addClass('disabled');
        withdraw._inProgress = true;
        $.ambiance({message: 'Withdraw request sent to bot!', type: 'success'});
        var bot = withdraw._bot;
        var pickBot = 3030 + bot;
        $.ajax({
            url: 'http://46.101.118.105:' + pickBot + '/withdraw?ids=' + withdraw._selected.join(',') + '&hash=' + getCookie('hash'),
            type: 'GET',
            success: function(data) {
                if(data)
                {
                    $.ambiance({message: data.msg, type: data.type});
                    $('.withdraw-item-button').removeClass('disabled');
                    withdraw._inProgress = false;
                }
            },
            error: function(error) {
                $.ambiance({message: 'An error ocurred while contacting bot! Try again!', type: 'error'});
                $('.withdraw-item-button').removeClass('disabled');
                withdraw._inProgress = false;
            }
        });
    });

    socket.on('getWithdraw', function(data) {
        $('.inventory').empty();
        setTimeout(function() {
            data.id = data.id.split('/');
            data.name = data.name.split('/');
            data.bot = data.bot.split('/');
            data.price = data.price.split('/');
            data.img = data.img.split('/');
            data.exterior = data.exterior.split('/');
            data.status = data.status.split('/');
            if(data.id == '')
            {
                $.ambiance({message: 'Site inventory could\'t load because it has 0 items!', type: 'error'});
                return;
            }
            for(var i in data.id)
            {
                if(data.status[i] == '0')
                {
                    $('.inventory').append('<div class="item junk" data-id="' + data.id[i] + '" data-market-hash-name="' + data.name[i] + '" data-price="' + parseInt(data.price[i]*100) + '" data-bot="' + data.bot[i] + '"><span class="item-name">' + data.name[i] + '<br><span class="item-extrior">' + data.exterior[i] + '</span></span><img src="https://steamcommunity-a.akamaihd.net/economy/image/' + data.img[i] + '/130fx130f"><span class="price"><span class="coin_icon2"></span>' + parseInt(data.price[i]*100) + '</span></div>')  
                }
                else
                {
                    $('.inventory').append('<div class="item" data-id="' + data.id[i] + '" data-market-hash-name="' + data.name[i] + '" data-price="' + parseInt(data.price[i]*100) + '" data-bot="' + data.bot[i] + '"><span class="item-name">' + data.name[i] + '<br><span class="item-extrior">' + data.exterior[i] + '</span></span><img src="https://steamcommunity-a.akamaihd.net/economy/image/' + data.img[i] + '/130fx130f"><span class="price"><span class="coin_icon2"></span>' + parseInt(data.price[i]*100) + '</span></div>')  
                }
            }
            withdraw.sort();
            $.ambiance({message: 'Site inventory loaded!', type: 'success'});
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

    socket.emit('withdraw_inventory', getCookie('hash'));
});