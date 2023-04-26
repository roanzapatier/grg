/*
  Initalizing packages
*/
var fs = require('fs');
var request = require('request');
var config = require('./config.json');
var CryptoJS = require("crypto-js");
var log4js = require('log4js');
var express = require('express');
var sha256 = require('sha256');
var math = require('mathjs');
var app = express();

var server = require('http').createServer();
var io = require('socket.io')(server);
server.listen(3290);


updateLog(time());
function updateLog(time) {
 log4js.configure({
  appenders: [
   { type: 'console' },
   { type: 'file', filename: 'logs/site_'+time+'.log' }
  ]
 });
}

var logger = log4js.getLogger();

var mysql = require('mysql');
var db_config = {
  //debug: true,
  host: config.options.sql['host'],
  user: config.options.sql['username'],
  password: config.options.sql['password'],
  database: config.options.sql['database']
};
var pool;
handleDisconnect();

process.on('uncaughtException', function (err) {
 logger.error('Strange error');
 logger.error(err);
});

//GAME INFO
var AppID = 730;
var ContextID = 2;
var minDep = config.options.minDeposit;


//ROULETTE
var currentMode = 'NONE';
var currentUsers = {};
var currentColors = {};
var betTimes = {};
var usersBalance = {};
var currentSums = {
  'red': 0,
  'green': 0,
  'black': 0
};
var currentBets = [];
var currentTimer = 20;
var currentLastNumber = -1;
var currentLastWooble = -1;
var currentHash = "";
var currentSecret = "";
var currentLottery = "";
var lastRolls = [];
var withdrawItems = [];

var proxies = config.proxies;

var inventoryTimer = {};
var socketBySteam = {};

var antiFlood = {};
var timesFlooding = {};

var inventoryUser = {};

//CHAT FUNCTIONS
var chatMessages = [];
var usersOnline = {};
var antiSpamChat = {};
//CHAT FUNCTIONS

startRoulette();
loadWithdrawInventory();
function loadWithdrawInventory()
{
  pool.query('SELECT * FROM items', function(err, row) {
    if(err) throw err;
    if(row.length == 0)
    {
      withdrawItems = [];
    }

    withdrawItems = [];
    for(var i in row)
    {
      withdrawItems.push({
        "assetid": row[i].assetid,
        "market_hash_name": row[i].market_hash_name,
        "name": row[i].name,
        "icon_url": row[i].img,
        "bot": row[i].botid,
        "exterior": row[i].exterior,
        "status": row[i].status
      });
    }
  });
}

app.listen(3291);

app.get('/reloadWithdrawInventory/', function(req, res) {
  if(req.connection.remoteAddress.includes('46.101.118.105') || req.connection.remoteAddress.includes('92.84.236.189'))
  {
    res.setHeader('Access-Control-Allow-Origin', 'http://46.101.118.105');
    loadWithdrawInventory();
    logger.trace('[Request] IP: ' + req.connection.remoteAddress + ' -> reloadWithdrawInventory');
    res.send();
  }
  else
  {
    res.send();
  }
});

app.get('/sendMessage/', function (req, res) {
  if(req.connection.remoteAddress.includes('46.101.118.105') || req.connection.remoteAddress.includes('92.84.236.189'))
  {
    res.setHeader('Access-Control-Allow-Origin', 'http://46.101.118.105');

    var steamid = req.query['steamid'];
    var type = req.query['type'];
    var msg = req.query['msg'];
    if(socketBySteam.hasOwnProperty(steamid))
    {
      if(io.sockets.connected[socketBySteam[steamid]['info']])
      {
        io.sockets.connected[socketBySteam[steamid]['info']].emit('msg', {
          tip: type,
          msg: msg
        });
      }
    }

    logger.trace('[Request] IP: ' + req.connection.remoteAddress + ' -> sendMessage');
    res.end();
  }
  else
  {
    res.end();
  }
});

function reloadWithdrawInventory()
{
  app.get('/reloadWithdrawInventory/', function(req, res) {
    if(req.connection.remoteAddress.includes('46.101.118.105') || req.connection.remoteAddress.includes('92.84.236.189'))
    {
      res.setHeader('Access-Control-Allow-Origin', 'http://46.101.118.105');
      loadWithdrawInventory();
      logger.trace('[Request] IP: ' + req.connection.remoteAddress + ' -> reloadWithdrawInventory');
      res.send();
    }
    else
    {
      res.send();
    }
  });
}

io.on('connection', function(socket) {
  socket.on('hash', function(m) {
    var address = socket.client.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    addHistory(socket);

    if(!usersOnline[address])
    {
      usersOnline[address] = 1;
    }
    if(m.hash)
    {
      pool.query('SELECT steamid, balance, tradeurl FROM users WHERE hash = ' + pool.escape(m.hash), function(err, row) {
        if(err) throw err;
        if(row.length == 0) return;

        getInv(row[0].steamid, socket);

        usersBalance[row[0].steamid] = {
          'balance': row[0].balance
        }

        if(socketBySteam.hasOwnProperty(row[0].steamid))
        {
          delete socketBySteam[row[0].steamid];
          socketBySteam[row[0].steamid] = {
            'info': socket.id
          };
        }
        else
        {
          socketBySteam[row[0].steamid] = {
            'info': socket.id
          };
        }

        currentBets.forEach(function(item) {
          socket.emit('roulette_newbet', item.bet, item.color, item.user, item.avatar, item.name);
        });

        var emitRolls = lastRolls.join('/');
        socket.emit('roulette_addroll', emitRolls);
        io.sockets.emit('connections', Object.keys(usersOnline).length);
        socket.emit('roulette_hash', currentHash);
        socket.emit('roulette_bets', currentSums);
        socket.emit('connected', row[0].balance, row[0].steamid, row[0].tradeurl, currentLastNumber, currentLastWooble);
        socket.emit('roulette_start', currentTimer);
      });
    }
    else
    {
      currentBets.forEach(function(item) {
        socket.emit('roulette_newbet', item.bet, item.color, item.user, item.avatar, item.name);
      });

      var emitRolls = lastRolls.join('/');
      socket.emit('roulette_addroll', emitRolls);
      io.sockets.emit('connections', Object.keys(usersOnline).length);
      socket.emit('roulette_hash', currentHash);
      socket.emit('roulette_bets', currentSums);
      socket.emit('connected', 0, 'not logged in', 'not logged in', currentLastNumber, currentLastWooble);
      socket.emit('roulette_start', currentTimer);
    }
  });



  //STEAMID EDITOR
  socket.on('setSteamid', function(hash, turl) {
    if(hash && turl)
    {
      pool.query('UPDATE users SET tradeurl = ' + pool.escape(turl) + ' WHERE hash = ' + pool.escape(hash));
      socket.emit('msg', {
        tip: 'alert',
        msg: 'You have set your tradeurl!'
      });
    }
  });


  //WITHDRAW INVENTORY
  socket.on('withdraw_inventory', function(hash) {
    if(hash)
    {
      var assetids = [];
      var names = [];
      var exteriors = [];
      var prices = [];
      var images = [];
      var bots = [];
      var statuss = [];

      var pretul = require('./prices.json');

      for(var i in withdrawItems)
      {
        assetids.push(withdrawItems[i].assetid);
        names.push(withdrawItems[i].name);
        exteriors.push(withdrawItems[i].exterior);
        prices.push(pretul[withdrawItems[i].market_hash_name]);
        images.push(withdrawItems[i].icon_url);
        bots.push(withdrawItems[i].bot);
        statuss.push(withdrawItems[i].status);
      }

      socket.emit('getWithdraw', {
        id: assetids.join('/'),
        name: names.join('/'),
        bot: bots.join('/'),
        price: prices.join('/'),
        img: images.join('/'),
        exterior: exteriors.join('/'),
        status: statuss.join('/')
      });
    }
  });





//INVENTORY TIMER
socket.on('deposit.force_reload', function(hash) {
  if(hash)
  {
    pool.query('SELECT steamid FROM users WHERE hash = ' + pool.escape(hash), function(err, row) {
      if(err) throw err;

      if(row.length == 0) return;

      if(row.length > 0 && !inventoryTimer.hasOwnProperty(row[0].steamid))
      {
        getInv(row[0].steamid, socket);
        inventoryTimer[row[0].steamid] = {
          'timer': time()+45
        };
      }
      else if(row.length > 0 && inventoryTimer.hasOwnProperty(row[0].steamid))
      {
        if(inventoryUser.hasOwnProperty(row[0].steamid) && inventoryTimer[row[0].steamid]['timer']-time() > 0)
        {
          var id = inventoryUser[row[0].steamid]['id'];
          var name = inventoryUser[row[0].steamid]['name'];
          var price = inventoryUser[row[0].steamid]['price'];
          var img = inventoryUser[row[0].steamid]['img'];
          var exterior = inventoryUser[row[0].steamid]['exterior'];

          socket.emit('getInventory', {
            id: id,
            name: name,
            price: price,
            img: img,
            exterior: exterior,
            message1: 'User inventory loaded from cache!',
            message2: 'You can refresh the inventory again in ' + inventoryTimer[row[0].steamid]['timer']-time() + ' seconds!'
          });
        }
        else if(inventoryTimer[row[0].steamid]['timer']-time() <= 0)
        {
          inventoryTimer[row[0].steamid] = {
            'timer': time()+45
          };

          getInv(row[0].steamid, socket);

          socket.emit('msg', {
            tip: 'error',
            msg: 'You can refresh the inventory again in ' + inventoryTimer[row[0].steamid]['timer']-time() + ' seconds!'
          });
        }
      }
    });
  }
});


socket.on('roulette_addbet', function(value, bet, hash) {
  logger.trace(value + ' ' + bet);
  if(currentMode == 'WAITING')
  {
    pool.query('SELECT name, avatar, steamid, balance FROM users WHERE hash = ' + pool.escape(hash), function(err, row) {
      if(err) throw err;
      if(row.length == 0) return;

      if(value > row[0].balance)
      {
        socket.emit('msg', {
          tip: 'error',
          msg: 'You do not have enough money!'
        });
        return;
      }

      if(value <= 0 || value >= 500000)
      {
        socket.emit('msg', {
          tip: 'error',
          msg: 'You can bet more than $0.01 and less than $500 coins!'
        });
        return;
      }

      if(currentUsers[row[0].steamid] == undefined)
      {
          currentUsers[row[0].steamid] = {
            "bet": value,
            "color": bet,
            "user": row[0].steamid
          };
      }
      if(!currentColors.hasOwnProperty(row[0].steamid))
      {
        currentColors[row[0].steamid] = {
          'red': 0,
          'green': 0,
          'black': 0
        };
      }

      if(currentColors[row[0].steamid]['red'] == 1 && bet == 'red')
      {
        socket.emit('msg', {
          tip: 'error',
          msg: 'You can\'t bet on same color twice!'
        });
        return;
      }
      else if(currentColors[row[0].steamid]['green'] == 1 && bet == 'green')
      {
        socket.emit('msg', {
          tip: 'error',
          msg: 'You can\'t bet on same color twice!'
        });
        return;
      }
      else if(currentColors[row[0].steamid]['black'] == 1 && bet == 'black')
      {
        socket.emit('msg', {
          tip: 'error',
          msg: 'You can\'t bet on same color twice!'
        });
        return;
      }
      else
      {

        pool.query('UPDATE users SET balance = balance - ' + pool.escape(value) + ' WHERE steamid = ' + pool.escape(row[0].steamid), function(er, ro) {
          if(er) throw er;
          if(ro.length == 0) return;
            pool.query('INSERT INTO bets SET user = ' + pool.escape(row[0].steamid) + ', color = ' + pool.escape(bet) + ', amount = ' + pool.escape(value) + ', won = 0', function(e, r) {
              if(e) throw e;
              if(r.length == 0) return;

                getBalance(socket, row[0].steamid);

                currentBets.push({
                  "id": r.insertId,
                  "bet": value,
                  "color": bet,
                  "user": row[0].steamid,
                  "avatar": row[0].avatar,
                  "name": row[0].name
                });

                if(!betTimes.hasOwnProperty(row[0].steamid))
                {
                  betTimes[row[0].steamid] = 0;
                  betTimes[row[0].steamid] += 1;
                }
                else
                {
                  betTimes[row[0].steamid] += 1;
                }

                currentSums[bet] += value;
                currentColors[row[0].steamid][bet] = 1;

                io.sockets.emit('roulette_newbet', value, bet, row[0].steamid, row[0].avatar, row[0].name);
                socket.emit('msg', {
                  tip: 'alert',
                  msg: 'You successfully placed bet #' + r.insertId + ' (' + betTimes[row[0].steamid] +'/3)'
                });
                io.sockets.emit('roulette_bets', currentSums);
            });
        });
      }
    });
  }
});


//CHAT FUNCTIONS
socket.on('nMsg', function(m)  {
    var mesaj = m.message;
    var utilizator = m.user;
    var hide = 0;
    var address = socket.client.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
 
    pool.query('SELECT `name`,`avatar`,`steamid`,`rank`,`mute` FROM `users` WHERE `hash` = ' + pool.escape(utilizator), function(err, res) {
        if (err) throw err;
        var row = res;
 
        if (!res[0]) return err;
 
        if (mesaj.length > 128 || mesaj.length < 6 && res[0].rank != 69) {
            socket.emit('msg', {
                tip: 'alert',
                msg: 'Error: Minimum length 6 and maximum length 128 to send a message.'
            });
            return;
        } else {
            if (antiSpamChat[res[0].steamid] + 2 >= time() && res[0].rank != 69) {
                socket.emit('msg', {
                    tip: 'alert',
                    msg: 'Error: You need to wait before sending another message.'
                });
                return;
            } else {
                antiSpamChat[res[0].steamid] = time();
            }
 
            var caca = null;
            if (caca = /^\/clear/.exec(mesaj)) {
                if (row[0].rank == 69 || row[0].rank == 92) {
                    io.sockets.emit('addMessage', {
                        tip: 'clear',
                        name: 'Alert',
                        rank: '0',
                        avatar: 'http://services.imobbr.com/galeria/78/avatar.png',
                        msg: 'Chat was cleared by Admin ' + row[0].name + '.'
                    });
 
                    chatMessages = [];
                    logger.trace('Chat: Cleared by Admin ' + row[0].name + '.');
                }
            } else if (caca = /^\/mute ([0-9]*) ([0-9]*)/.exec(mesaj)) {
                if (row[0].rank == 69 || row[0].rank == 92) {
                    var t = time();
                    pool.query('UPDATE `users` SET `mute` = ' + pool.escape(parseInt(t) + parseInt(caca[2])) + ' WHERE `steamid` = ' + pool.escape(caca[1]), function(err2, row2) {
                        if (err2) throw err2;
                        if (row2.affectedRows == 0) {
                            socket.emit('msg', {
                                tip: 'alert',
                                msg: 'Steamid not found in database.'
                            });
                            logger.trace('Mute: Steamid not found in database (' + caca[1] + ').');
                            return;
                        }
 
                        socket.emit('msg', {
                            tip: 'alert',
                            msg: 'You have muted user for ' + caca[2] + ' seconds.'
                        });
                        logger.trace('Mute: Steamid ' + caca[1] + ' has been muted for ' + caca[2] + ' seconds by ' + row[0].name + ' (' + row[0].steamid + ').');
                    });
                }
            } else if (caca = /^\/wload/.exec(mesaj)) {
                if (row[0].rank == 69) {
                    reloadWithdrawInventory()
                }
            } else {
 
                if (row[0].mute > time() && row[0].mute != 0) {
                    socket.emit('msg', {
                        tip: 'alert',
                        msg: 'You are muted (seconds remaining: ' + parseInt(row[0].mute - time()) + ').'
                    });
                    logger.trace('Mute: ' + row[0].name + ' (' + row[0].steamid + ') tried to speak (' + mesaj + ') while muted (seconds remaining: ' + parseInt(row[0].mute - time()) + ').');
                    return;
                }
 
                if (chatMessages.length > 20) {
                    chatMessages.shift();
                }
 
 
                chatMessages.push({
                    name: res[0].name,
                    avatar: res[0].avatar,
                    steamid: res[0].steamid,
                    rank: res[0].rank,
                    message: mesaj
                });
 
                io.sockets.emit('addMessage', {
                    msg: mesaj,
                    avatar: res[0].avatar,
                    steamid: res[0].steamid,
                    rank: res[0].rank,
                    name: res[0].name
                });
                logger.trace('Chat: Message from ' + row[0].name + ' (SID: ' + row[0].steamid + ', IP: ' + address + ', hide: ' + hide + ') --> ' + mesaj);
            }
        }
    });
});

  socket.on('disconnect', function(m) {
      var address = socket.client.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
      if(usersOnline[address])
      {
        delete usersOnline[address];
      }
      io.sockets.emit('connections', Object.keys(usersOnline).length);
  });
});


function startRoulette()
{
  if(currentMode == 'NONE')
  {
    currentHash = sha256('CSGOEcho-' + time() + '-' + Math.floor(Math.random() * (690 - 1 + 1)) + 1);
    currentLottery = time();
    currentSecret = makeCode();
    logger.trace('[Roulette] nextRoll --> Round hash: ' + currentHash + ', Lottery: ' + currentLottery + ', Secret: ' + currentSecret + ', Cifra: ' + getCifra(currentHash, currentSecret, currentLottery));
    io.sockets.emit('roulette_hash', currentHash);
    currentMode = 'WAITING';
    var rolls = setInterval(function() {
      currentTimer = currentTimer - 1;
      if(currentTimer == 0)
      {
        clearInterval(rolls);
        currentMode = 'ROLLING';
        setTimeout(function() {
          startRolling();
        }, 600);
      }
    }, 1000);
  }
  else if(currentMode == 'ENDED')
  {
    currentHash = sha256('CSGOEcho-' + time() + '-' + Math.floor(Math.random() * (690 - 1 + 1)) + 1);
    currentLottery = time();
    currentSecret = makeCode();
    logger.trace('[Roulette] nextRoll --> Round hash: ' + currentHash + ', Lottery: ' + currentLottery + ', Secret: ' + currentSecret + ', Cifra: ' + getCifra(currentHash, currentSecret, currentLottery));
    io.sockets.emit('roulette_hash', currentHash);
    currentTimer = 20;
    currentMode = 'WAITING';
    var rolls = setInterval(function() {
      currentTimer = currentTimer - 1;
      if(currentTimer == 0)
      {
        clearInterval(rolls);
        currentMode = 'ROLLING';
        setTimeout(function() {
          startRolling();
        }, 600);
      }
    }, 1000);
    io.sockets.emit('roulette_start', currentTimer);
  }
}

function startRolling()
{
  var cifra = getCifra(currentHash, currentSecret, currentLottery);
  var wooble = Math.random() * (1 - 0.1) + 0.1;

  io.sockets.emit('roulette_roll', cifra, wooble);

  setTimeout(function() {
    io.sockets.emit('roulette_secret', currentSecret);
    setTimeout(function() {
      currentLastNumber = cifra;
      currentLastWooble = wooble;
      pool.query('INSERT INTO rolls SET cifra = ' + pool.escape(cifra) + ', hash = ' + pool.escape(currentHash) + ', lottery = ' + pool.escape(currentLottery) + ', secret = ' + pool.escape(currentSecret));

      if(lastRolls.length >= 10)
      {
        lastRolls.shift();
      }
      lastRolls.push(cifra);
      winnerRoulette(cifra);
    }, 2500);
  }, 7000);
}

function winnerRoulette(cifra)
{
  var number = getCifra(currentHash, currentSecret, currentLottery);
  currentMode = 'ENDED';
  currentBets.forEach(function(i) {
    if(i.color == 'red' && (number >= 1 && number <= 7))
    {
      pool.query('UPDATE users SET balance = balance + ' + pool.escape(i.bet*2) + ' WHERE steamid = ' + i.user);
      pool.query('UPDATE bets SET won = 1 WHERE id = ' + pool.escape(i.id));
      usersBalance[i.user]['balance'] += i.bet*2;
      if(io.sockets.connected[socketBySteam[i.user]['info']])
      {
        io.sockets.connected[socketBySteam[i.user]['info']].emit('roulette_balance', usersBalance[i.user]['balance']);
      }
    }
    else if(i.color == 'black' && (number >= 8 && number <= 14))
    {
      pool.query('UPDATE users SET balance = balance + ' + pool.escape(i.bet*2) + ' WHERE steamid = ' + i.user);
      pool.query('UPDATE bets SET won = 1 WHERE id = ' + pool.escape(i.id));
      usersBalance[i.user]['balance'] += i.bet*2;
      if(io.sockets.connected[socketBySteam[i.user]['info']])
      {
        io.sockets.connected[socketBySteam[i.user]['info']].emit('roulette_balance', usersBalance[i.user]['balance']);
      }
    }
    else if(i.color == 'green' && (number == 0))
    {
      pool.query('UPDATE users SET balance = balance + ' + pool.escape(i.bet*14) + ' WHERE steamid = ' + i.user);
      pool.query('UPDATE bets SET won = 1 WHERE id = ' + pool.escape(i.id));
      usersBalance[i.user]['balance'] += i.bet*14;
      if(io.sockets.connected[socketBySteam[i.user]['info']])
      {
        io.sockets.connected[socketBySteam[i.user]['info']].emit('roulette_balance', usersBalance[i.user]['balance']);
      }
    }
  });
  startRoulette();
  currentUsers = {};
  currentColors = {};
  currentBets = [];
  betTimes = {};
  currentSums = {
    'red': 0,
    'green': 0,
    'black': 0
  };
}

function getCifra(hash, secret, lottery)
{
  var cifra = sha256(hash+'-'+secret+'-'+lottery);
  cifra = hexdec(cifra.substr(0, 8)) % 15;
  return cifra;
}

function hexdec(hexString) {
  hexString = (hexString + '').replace(/[^a-f0-9]/gi, '')
  return parseInt(hexString, 16)
}

function getBalance(socket, steamid)
{
  pool.query('SELECT balance FROM users WHERE steamid = ' + pool.escape(steamid), function(err, row) {
    if(err) throw err;
    if(row.length == 0) return;

    var balanta = row[0].balance;
    usersBalance[steamid]['balance'] = row[0].balance;
    socket.emit('roulette_balance', balanta);
  });
}


/*
  Getting prices
*/
var priceUrl = 'https://api.csgofast.com/price/all';

function getPriceList() {
  request(priceUrl, function(dataAndEvents, r, actual) {    
    ok = JSON.parse(actual);
    if (200 != r.statusCode) {
      if (fs.existsSync("/var/Bot/project/prices.json")) {
        ok = JSON.parse(fs.readFileSync("/var/Bot/project/prices.json"));
        ok = JSON.parse(fs.readFileSync("/var/www/project/prices.json"));
        console.log("[SERVER] Loading Prices - Server sided prices loaded!");
      }
    } else {
      fs.writeFileSync("/var/Bot/project/prices.json", actual);
      fs.writeFileSync("/var/www/project/prices.json", actual);
      console.log("[SERVER] Loading Prices - API prices loaded!");
    }
  });
}

getPriceList();
setInterval(getPriceList, config.options.priceRefreshInterval * 1000);

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function time()
{
  return parseInt(new Date().getTime()/1000);
}

function addHistory(socket)
{
  chatMessages.forEach(function(itm) {
    socket.emit('addMessage', {
      msg: itm.message,
      avatar: itm.avatar,
      steamid: itm.steamid,
      rank: itm.rank,
      name: itm.name
    });
  })
}

function makeCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i=0; i < 12; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getProxy()
{
  return "http://" + proxies[random(0,proxies.length-1)];
}

function random(min, max) {
 return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getInv(user, socket)
{
  var pret = require('./prices.json');

  if(config['proxyON'] == true)
  {
    var reqOpts = {
      url: 'http://steamcommunity.com/inventory/' + encodeURIComponent(user) + '/' + AppID + '/' + ContextID + '?l=eng&count=5000',
      proxy: getProxy()
    };
  }
  else
  {
    var reqOpts = {
      url: 'http://steamcommunity.com/inventory/' + encodeURIComponent(user) + '/' + AppID + '/' + ContextID + '?l=eng&count=5000'
    };
  }

  request(reqOpts, function(err, response, body) {
    if(err) throw err;
    if(response && response.statusCode == 200)
    {
      var bodiul = JSON.parse(body);

      var assets = bodiul['assets'];
      var descriptions = bodiul['descriptions'];

      var counter = 0;

      var idss = [];
      var namess = [];
      var pricess = [];
      var imgss = [];
      var exteriorss = [];

      var Ids = '';
      var Names = '';
      var Prices = '';
      var Imgs = '';
      var Exteriors = '';

      if(!assets) return;

      assets.forEach(function(valuey, y) {
        descriptions.forEach(function(valuez, z) {
          if(valuey['classid'] == valuez['classid'] && valuey['instanceid'] == valuez['instanceid'])
          {
            var isTradable = valuez['tradable'];
            if(isTradable == 1)
            {
              if(/(Souvenir)/.exec(valuez['market_hash_name'])) return;

              var id = valuey['assetid'];
              var name = valuez['market_hash_name'].replace(/ *\([^)]*\) */g, "");
              var price = pret[valuez['market_hash_name']];
              var img = valuez['icon_url'];
              var exterior = valuez['descriptions'][0]['value'].split('Exterior: ')[1];

              idss.push(id);
              namess.push(name);
              pricess.push(price);
              imgss.push(img);
              exteriorss.push(exterior);
            }
          }
        });
      });

      Ids = idss.join('/');
      Names = namess.join('/');
      Prices = pricess.join('/');
      Imgs = imgss.join('/');
      Exteriors = exteriorss.join('/');

      socket.emit('getInventory', {
        id: Ids,
        name: Names,
        price: Prices,
        img: Imgs,
        exterior: Exteriors
      });

      inventoryUser[user] = {
        id: Ids,
        name: Names,
        price: Prices,
        img: Imgs,
        exterior: Exteriors
      }
    }
    else
    {

    }
  });
}

function getRandomFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(10);
}

function handleDisconnect() {
  pool = mysql.createConnection(db_config);

  pool.connect(function(err) {
    if(err) {
      logger.trace('Error: Connecting to database: ', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  pool.on('error', function(err) {
    logger.trace('Error: Database error: ', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}