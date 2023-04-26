/*
  Initalizing packages
*/
var SteamUser = require('steam-user');
var TradeOfferManager = require('steam-tradeoffer-manager');
var SteamTotp = require('steam-totp');
var SteamCommunity = require('steamcommunity');
var fs = require('fs');
var request = require('request');
var config = require('./config.json');
var CryptoJS = require("crypto-js");
var log4js = require('log4js');
var express = require('express');
var app = express();

var community = new SteamCommunity();
var client = new SteamUser();
var manager = new TradeOfferManager({
  steam: client,
  domain: 'localhost',
  language: 'en'
});


updateLog(time());
function updateLog(time) {
 log4js.configure({
  appenders: [
   { type: 'console' },
   { type: 'file', filename: 'logs/bot_'+time+'.log' }
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

var bot = process.argv[2];

var pendingTrades = {};
var statusItems = {};


loadItemsStatus();
setInterval(function() { loadItemsStatus(); }, 20000);
function loadItemsStatus()
{
  pool.query('SELECT * FROM items', function(err, row) {
    if(err) throw err;
    if(row.length == 0) return;
    statusItems = {};

    for(var i in row)
    {
      statusItems[row[i].assetid] = {
        'id': row[i].id,
        'status': row[i].status
      };
    }

    request('http://46.101.118.105:3291/reloadWithdrawInventory/', function(er, res, body) {
      if(er) throw er;
    });
  });
}



/*
  Polling Steam and Logging On
*/
client.logOn({
  accountName: config.bots[bot].username,
  password: config.bots[bot].password,
  twoFactorCode: SteamTotp.generateAuthCode(config.bots[bot].sharedSecret)
});




app.get('/deposit/', function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://46.101.118.105');

  var hash = req.query['hash'];
  var ids = req.query['ids'];
  var tradeurl = "";
  var steamid = "";

  if(hash && ids)
  {
    pool.query('SELECT tradeurl, steamid FROM users WHERE hash = ' + pool.escape(hash), function(err, row) {
      if(err) throw err;
      if(row.length == 0) return;

      tradeurl = row[0].tradeurl;
      if(!tradeurl.split('token=')[1])
      {
        res.json({
          type: 'error',
          msg: 'You need to set your tradeurl to deposit items!'
        });
        return;
      }
      steamid = row[0].steamid;

      manager.getUserInventoryContents(steamid, AppID, ContextID, true, function(er, inv, curr) {
        if(er) throw er;
        if(inv.length == 0) return;

        var Items = ids.split(',');
        var db = [];
        var totalItems = Items.length;
        var itemsPending = [];
        var currItems = 0;

        for(var i in inv)
        {
          for(var z in Items)
          {
            if(inv[i].assetid == Items[z] && Items[z].ss != 1)
            {
              Items[z].ss = 1;
              currItems++;
              itemsPending.push(inv[i].assetid);
              db.push(inv[i].market_hash_name);
            }
          }
        }

        if(totalItems != currItems)
        {
          res.json({
            type: 'error',
            msg: 'You are trying to deposit items you don\'t have!'
          });
          return;
        }

        var code = makeCode();
        var create = manager.createOffer(steamid, tradeurl.split('token=')[1]);
        create.setMessage('Security code: ' + code);

        for(var i in itemsPending)
        {
          create.addTheirItem({
            "appid": AppID,
            "contextid": ContextID,
            "assetid": itemsPending[i]
          });
        }

        create.send(function(e, status) {
          if(e) throw e;

          pendingTrades[create.id] = {
            'type': 'deposit'
          }

          pool.query('INSERT INTO trades SET user = ' + pool.escape(steamid) + ', tid = ' + pool.escape(create.id) + ', type = ' + pool.escape('deposit') + ', code = ' + pool.escape(code) + ', names = ' + pool.escape(db.join(',')) + ', status = -1');
          deleteTrade(create);

          res.json({
            type: 'success',
            msg: 'Trade #' + create.id + ' with status ' + status + ' (code: ' + code + ') has been created! You have 90 seconds to accept it.'
          });
        });
      });
    });
  }
  else
  {
    res.end();
  }
});


app.get('/withdraw/', function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://46.101.118.105');

  var hash = req.query['hash'];
  var ids = req.query['ids'];
  var tradeurl = "";
  var steamid = "";

  if(hash && ids)
  {
    pool.query('SELECT tradeurl, steamid, balance FROM users WHERE hash = ' + pool.escape(hash), function(err, row) {
      if(err) throw err;
      if(row.length == 0) return;

      tradeurl = row[0].tradeurl;
      if(!tradeurl.split('token=')[1])
      {
        res.json({
          type: 'error',
          msg: 'You need to set your tradeurl to withdraw items!'
        });
        return;
      }
      steamid = row[0].steamid;

      manager.getInventoryContents(AppID, ContextID, true, function(er, inv, curr) {
        if(er) throw er;
        if(inv.lengh == 0) return;

        var Items = ids.split(',');
        var pretul = require('./prices.json');
        var db = [];
        var totalItems = Items.length;
        var itemsPending = [];
        var currItems = 0;
        var needBalance = 0;

        for(var i in inv)
        {
          for(var z in Items)
          {
            if(inv[i].assetid == Items[z] && Items[z].ss != 1)
            {
              if(statusItems[inv[i].assetid]['status'] == 1)
              {
                Items[z].ss = 1;
                currItems++;
                itemsPending.push(inv[i].assetid);
                db.push(inv[i].market_hash_name);
              }
            }
          }
        }

        for(var i in db)
        {
          needBalance += pretul[db[i]]*100;
        }

        if(totalItems != currItems)
        {
          var itemsGot = totalItems - currItems;

          res.json({
            type: 'error',
            msg: itemsGot + ' items are now in other trade. Please refresh and try again!'
          });
          return;
        }

        if(needBalance > row[0].balance)
        {
          res.json({
            type: 'error',
            msg: 'You don\'t have enough coins to withdraw items selected!'
          });
          return;
        }

        var code = makeCode();
        var create = manager.createOffer(steamid, tradeurl.split('token=')[1]);
        create.setMessage('Security code: ' + code);

        for(var i in itemsPending)
        {
          create.addMyItem({
            "appid": AppID,
            "contextid": ContextID,
            "assetid": itemsPending[i]
          });
        }

        create.send(function(e, status) {
          if(e) throw e;

          pendingTrades[create.id] = {
            'type': 'withdraw'
          }

          pool.query('INSERT INTO trades SET user = ' + pool.escape(steamid) + ', tid = ' + pool.escape(create.id) + ', type = ' + pool.escape('withdraw') + ', code = ' + pool.escape(code) + ', names = ' + pool.escape(db.join(',')) + ', status = -1');
          deleteTrade(create);

          for(var i in itemsPending)
          {
            pool.query('UPDATE items SET status = 0 WHERE assetid = ' + pool.escape(itemsPending[i]));
          }

          setTimeout(function() {
            loadItemsStatus();
          }, 1500);

          res.json({
            type: 'success',
            msg: 'Trade #' + create.id + ' with status ' + status + ' (code: ' + code + ') has been created! You have 90 seconds to accept it.'
          });
        });
      });
    });
  }
  else
  {
    res.end();
  }
});

function deleteTrade(offer)
{
  setTimeout(function() {
    pool.query('SELECT status FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
      if(err) throw err;
      if(row.length == 0) return;

      if(row[0].status == '-1')
      {
        declineOffer(offer);
      }
    });
  }, 91000);
}


function getPriceItem(name)
{
  var priceItem = 0;
  if (name) {
    var prices = require('./prices.json');
    priceItem = prices[name];
  }
  return priceItem;
}

function PriceOfItem(offer)
{
  var priceItem = 0;
  if (offer) {
    var prices = require('./prices.json');
    priceItem = prices[offer.market_hash_name];
  }
  return priceItem;
}


/*
  Offer handling
*/
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}
function acceptOffer(offer) {
  offer.accept((err) => {
    if (err) console.log('Unable to accept offer: ' + err);
    community.checkConfirmations();
  });
}

function declineOffer(offer) {
  offer.decline((err) => {
    if (err) return console.log('Unable to decline offer: ' + err);
  });
}



//VERIFICARE ACCEPTARE TRADE:
manager.on('sentOfferChanged', function(offer, oldState) {
  if(offer)
  {
    console.log('Offer #' + offer.id + ' | oldState: ' + oldState + ' | newState: ' + offer.state);

    if(pendingTrades.hasOwnProperty(offer.id))
    {
      if(pendingTrades[offer.id]['type'] == 'deposit')
      {
        if(oldState == 2 && offer.state == 3)
        {
          pool.query('SELECT user, names FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
            if(err) throw err;
            if(row.length == 0) return;

            var Items = row[0].names.split(',');
            var informations = [];
            var addBalance = 0;

            for(var i in Items)
            {
              addBalance += getPriceItem(Items[i])*100;
            }

            offer.getReceivedItems(true, function(caca, jeca) {
              for(var i in jeca)
              {
                informations.push({
                  "assetid": jeca[i].assetid,
                  "name": jeca[i].market_hash_name,
                  "img": jeca[i].icon_url,
                  "exterior": jeca[i]['tags'][jeca[i]['tags'].length-1]['name']
                });
              }

              var reqUrl = 'http://46.101.118.105:3291/sendMessage?steamid=' + encodeURIComponent(row[0].user) + '&type=gray&msg=State for trade #' + offer.id + ' has been changed to accepted!';
              pool.query('UPDATE trades SET status = 1 WHERE tid = ' + pool.escape(offer.id));
              pool.query('UPDATE users SET balance = balance + ' + pool.escape(addBalance) + ' WHERE steamid = ' + pool.escape(row[0].user));
              for(var i in informations)
              {
                pool.query('INSERT INTO items SET trade = ' + pool.escape(offer.id) + ', assetid = ' + pool.escape(informations[i].assetid) + ', exterior = ' + pool.escape(informations[i].exterior) + ', name = ' + pool.escape(informations[i].name.replace(/ *\([^)]*\) */g, "")) + ', market_hash_name = ' + pool.escape(informations[i].name) + ', status = ' + pool.escape('1') + ', img = ' + pool.escape(informations[i].img) + ', botid = ' + pool.escape(process.argv[2]) + ', time = ' + pool.escape(time()), function(aaa, bbb) {
                  if(aaa) throw aaa;
                  if(bbb.length == 0) return;

                  loadItemsStatus();
                });
              }
              request(reqUrl, function(er, response, body) {
                if(er) throw er;
                  logger.trace('Sent a message to ' + row[0].user + ' (State for trade #' + offer.id + ' has been changed to accepted! Coins received: ' + addBalance + ')');
              });
            });
          });
        }
        else if(oldState == 2 && offer.state == 7)
        {
          pool.query('SELECT user FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
            if(err) throw err;
            if(row.length == 0) return;
            pool.query('UPDATE trades SET status = 0 WHERE tid = ' + pool.escape(offer.id));
              var reqUrl = 'http://46.101.118.105:3291/sendMessage?steamid=' + encodeURIComponent(row[0].user) + '&type=error&msg=State for trade #' + offer.id + ' has been changed to declined!';
              request(reqUrl, function(er, response, body) {
                if(er) throw er;
                logger.trace('Sent a message to ' + row[0].user + ' (State for trade #' + offer.id + ' has been changed to declined!)');
              });
          });
        }
        else if(oldState == 2 && offer.state == 6)
        {
          pool.query('UPDATE trades SET status = 0 WHERE tid = ' + pool.escape(offer.id));
        }
      }
      else if(pendingTrades[offer.id]['type'] == 'withdraw')
      {
        if(oldState == 2 && offer.state == 3)
        {
          pool.query('SELECT user, names FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
            if(err) throw err;
            if(row.length == 0) return;

            var Items = row[0].names.split(',');
            var removeBalance = 0;

            for(var i in Items)
            {
              removeBalance += getPriceItem(Items[i])*100;
            }

            var sentItems = offer.itemsToGive;
            for(var i in sentItems)
            {
              pool.query('DELETE FROM items WHERE assetid = ' + pool.escape(sentItems[i].assetid));
            }

            var reqUrl = 'http://46.101.118.105:3291/sendMessage?steamid=' + encodeURIComponent(row[0].user) + '&type=gray&msg=State for trade #' + offer.id + ' has been changed to accepted!';
            pool.query('UPDATE trades SET status = 1 WHERE tid = ' + pool.escape(offer.id));
            pool.query('UPDATE users SET balance = balance - ' + pool.escape(removeBalance) + ' WHERE steamid = ' + pool.escape(row[0].user));
            request(reqUrl, function(er, response, body) {
              if(er) throw er;
                logger.trace('Sent a message to ' + row[0].user + ' (State for trade #' + offer.id + ' has been changed to accepted! Coins removed: ' + removeBalance + ')');
            });

            setTimeout(function() { loadItemsStatus(); }, 20000);
          });
        }
        else if((oldState == 2 && offer.state == 7) || (oldState == 9 && offer.state == 7))
        {
          pool.query('SELECT user FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
            if(err) throw err;
            if(row.length == 0) return;
            pool.query('UPDATE trades SET status = 0 WHERE tid = ' + pool.escape(offer.id));
              var reqUrl = 'http://46.101.118.105:3291/sendMessage?steamid=' + encodeURIComponent(row[0].user) + '&type=error&msg=State for trade #' + offer.id + ' has been changed to declined!';
              request(reqUrl, function(er, response, body) {
                if(er) throw er;
                logger.trace('Sent a message to ' + row[0].user + ' (State for trade #' + offer.id + ' has been changed to declined!)');
              });

            var items = offer.itemsToGive;

            for(var i in items)
            {
              pool.query('UPDATE items SET status = 1 WHERE assetid = ' + pool.escape(items[i].assetid));
            }

              setTimeout(function() { loadItemsStatus(); }, 1500);
          });
        }
        else if(oldState == 9 && offer.state == 2)
        {
          pool.query('SELECT user FROM trades WHERE tid = ' + pool.escape(offer.id), function(err, row) {
            if(err) throw err;
            if(row.length == 0) return;
              var reqUrl = 'http://46.101.118.105:3291/sendMessage?steamid=' + encodeURIComponent(row[0].user) + '&type=gray&msg=State for trade #' + offer.id + ' has been changed to sent!';
              request(reqUrl, function(er, response, body) {
                if(er) throw er;
                logger.trace('Sent a message to ' + row[0].user + ' (State for trade #' + offer.id + ' has been changed to sent!)');
              });
          });
        }
        else if(oldState == 2 && offer.state == 6)
        {
          pool.query('UPDATE trades SET status = 0 WHERE tid = ' + pool.escape(offer.id));
          var items = offer.itemsToGive;

          for(var i in items)
          {
            pool.query('UPDATE items SET status = 1 WHERE assetid = ' + pool.escape(items[i].assetid));
          }

          setTimeout(function() { loadItemsStatus(); }, 1500);
        }
      }
    }
  }
});

//Refresh polldata.json
manager.on('pollData', function(pollData) {
  fs.writeFile('polldata.json', JSON.stringify(pollData));
});

if (fs.existsSync('polldata.json')) {
  manager.pollData = JSON.parse(fs.readFileSync('polldata.json'));
}

client.on('webSession', function(sessionID, cookies) {
  manager.setCookies(cookies, function(err) {
    if (err) return console.log(err);
    console.log('Got API key: ' + manager.apiKey);
    app.listen(3030+parseInt(bot));
  });

  community.setCookies(cookies);
  community.startConfirmationChecker(config.options.confirmationInterval, config.bots[bot].identitySecret);
});



function time()
{
  return parseInt(new Date().getTime()/1000);
}

function makeCode() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(var i=0; i < 6; i++)
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