<?php
if (!isset($_GET['page'])) {
	header('Location: main');
	exit();
}

ini_set('display_errors','Off');
include 'include/config.php';

if (isset($_COOKIE['hash'])) {
	$sql = $db->query("SELECT * FROM `users` WHERE `hash` = " . $db->quote($_COOKIE['hash']));
	if ($sql->rowCount() != 0) {
		$row = $sql->fetch();
		$user = $row;
	}
	else
	{
		setcookie('hash', null, -1, '/');
	}
}

$apikey = 'CFFC94B1241701E3F19742E1F9129411';
$min = 150;
$ip = 'localhost';

switch ($_GET['page']) {
	case 'main':
		$page = getTemplate('main.php', array('user'=>$user));
		echo $page;
		break;

	case 'deposit':
		$page = getTemplate('deposit.php', array('user'=>$user));
		echo $page;
		break;

	case 'withdraw':
		$page = getTemplate('withdraw.php', array('user'=>$user));
		echo $page;
		break;

	case 'affiliates':
		$page = getTemplate('affiliates.php', array('user'=>$user));
		echo $page;
		break;

	case 'fair':
		$sql = $db->query('SELECT * FROM rolls ORDER BY id DESC LIMIT 50');
		$row = $sql->fetchAll();
		$page = getTemplate('fair.php', array('user'=>$user, 'rolls'=>$row));
		echo $page;
		break;

	case 'login':
		include 'openid.php';
		try
		{
			$openid = new LightOpenID('http://'.$_SERVER['SERVER_NAME'].'/');
			if (!$openid->mode) {
				$openid->identity = 'http://steamcommunity.com/openid/';
				header('Location: ' . $openid->authUrl());
			} elseif ($openid->mode == 'cancel') {
				echo '';
			} else {
				if ($openid->validate()) {

					$id = $openid->identity;
					$ptn = "/^http:\/\/steamcommunity\.com\/openid\/id\/(7[0-9]{15,25}+)$/";
					preg_match($ptn, $id, $matches);

					$url = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" . $apikey . "&steamids=$matches[1]";
					$json_object = file_get_contents($url);
					$json_decoded = json_decode($json_object);
					foreach ($json_decoded->response->players as $player) {
						$steamid = $player->steamid;
						$name = $player->personaname;
						$avatar = $player->avatarfull;
					}

					$hash = md5($steamid . time() . rand(1, 999));
					$sql = $db->query("SELECT * FROM `users` WHERE `steamid` = '" . $steamid . "'");
					$row = $sql->fetchAll(PDO::FETCH_ASSOC);
					if (count($row) == 0) {
						$db->exec("INSERT INTO `users` (`hash`, `steamid`, `name`, `avatar`) VALUES ('" . $hash . "', '" . $steamid . "', " . $db->quote($name) . ", '" . $avatar . "')");
					} else {
						$db->exec("UPDATE `users` SET `hash` = '" . $hash . "', `name` = " . $db->quote($name) . ", `avatar` = '" . $avatar . "' WHERE `steamid` = '" . $steamid . "'");
					}
					setcookie('hash', $hash, time() + 3600 * 24 * 7, '/');
					header('Location: sets.php?id=' . $hash);
				}
			}
		} catch (ErrorException $e) {
			exit($e->getMessage());
		}
		break;

	case 'get_inv':
	if(!$user) exit(json_encode(array('success'=>false, 'error'=>'You must login to access the deposit.')));
		if((file_exists('cache/'.$user['steamid'].'.txt')) && (!isset($_GET['nocache']))) {
			$array = file_get_contents('cache/'.$user['steamid'].'.txt');
			$array = unserialize($array);
			$array['fromcache'] = true;
			if(isset($_COOKIE['tid'])) {
				$sql = $db->query('SELECT * FROM `trades` WHERE `id` = '.$db->quote($_COOKIE['tid']).' AND `status` = 0');
				if($sql->rowCount() != 0) {
					$row = $sql->fetch();
					$array['code'] = $row['code'];
					$array['amount'] = $row['summa'];
					$array['tid'] = $row['id'];
					$array['bot'] = "Bot #".$row['bot_id'];
				} else {
					setcookie("tid", "", time() - 3600, '/');
				}
			}
			exit(json_encode($array));
		}
		$prices = file_get_contents('prices.txt');
		$prices = json_decode($prices, true);
		$inv = curl('https://steamcommunity.com/profiles/'.$user['steamid'].'/inventory/json/730/2/');
		$inv = json_decode($inv, true);
		if($inv['success'] != 1) {
			exit(json_encode(array('error'=>'Your profile is private. Please <a href="http://steamcommunity.com/my/edit/settings" target="_blank">set your inventory to public</a> and <a href="javascript:loadLeft(\'nocache\')">try again</a>.')));
		}
		$items = array();
		foreach ($inv['rgInventory'] as $key => $value) {
			$id = $value['classid'].'_'.$value['instanceid'];
			$trade = $inv['rgDescriptions'][$id]['tradable'];
			if(!$trade) continue;
			$name = $inv['rgDescriptions'][$id]['market_hash_name'];
			$price = $prices['response']['items'][$name]['value']*10;
			$img = 'http://steamcommunity-a.akamaihd.net/economy/image/'.$inv['rgDescriptions'][$id]['icon_url'];
			if((preg_match('/(Souvenir)/', $name)) || ($price < $min)) {
				$price = 0;
				$reject = 'Junk';
			} else {
				$reject = 'unknown item';
			}
			$items[] = array(
				'assetid' => $value['id'],
				'bt_price' => "0.00",
				'img' => $img,
				'name' => $name,
				'price' => $price,
				'reject' => $reject,
				'sa_price' => $price,
				'steamid' => $user['steamid']);
		}

		$array = array(
			'error' => 'none',
			'fromcache' => false,
			'items' => $items,
			'success' => true);
		if(isset($_COOKIE['tid'])) {
			$sql = $db->query('SELECT * FROM `trades` WHERE `id` = '.$db->quote($_COOKIE['tid']).' AND `status` = 0');
			if($sql->rowCount() != 0) {
				$row = $sql->fetch();
				$array['code'] = $row['code'];
				$array['amount'] = $row['summa'];
				$array['tid'] = $row['id'];
				$array['bot'] = "Bot #".$row['bot_id'];
			} else {
				setcookie("tid", "", time() - 3600, '/');
			}
		}
		file_put_contents('cache/'.$user['steamid'].'.txt', serialize($array), LOCK_EX);
		exit(json_encode($array));
		break;

	case 'deposit_js':
		if(!$user) exit(json_encode(array('success'=>false, 'error'=>'You must login to access the deposit.')));
		if($_COOKIE['tid']) {
			exit(json_encode(array('success'=>false, 'error'=>'You isset active tradeoffer.')));
		}
		$sql = $db->query('SELECT `id`,`name` FROM `bots` ORDER BY rand() LIMIT 1');
		$row = $sql->fetch();
		$bot = $row['id'];
		$partner = extract_partner($_GET['tradeurl']);
		$token = extract_token($_GET['tradeurl']);
		setcookie('tradeurl', $_GET['tradeurl'], time() + 3600 * 24 * 7, '/');
		$checksum = intval($_GET['checksum']);
		$prices = file_get_contents('prices.txt');
		$prices = json_decode($prices, true);
		$out = curl('http://'.$ip.':'.(3000+$bot).'/sendTrade/?assetids='.$_GET['assetids'].'&partner='.$partner.'&token='.$token.'&checksum='.$_GET['checksum'].'&steamid='.$user['steamid']);
		$out = json_decode($out, true);
		$out['bot'] = $row['name'];
		if($out['success'] == true) {
			$s = 0;
			foreach ($out['items'] as $key => $value) {
				$db->exec('INSERT INTO `items` SET `trade` = '.$db->quote($out['tid']).', `market_hash_name` = '.$db->quote($value['market_hash_name']).', `img` = '.$db->quote($value['icon_url']).', `botid` = '.$db->quote($bot).', `time` = '.$db->quote(time()));
				$s += $prices['response']['items'][$value['market_hash_name']]['value']*10;
			}
			$db->exec('INSERT INTO `trades` SET `id` = '.$db->quote($out['tid']).', `bot_id` = '.$db->quote($bot).', `code` = '.$db->quote($out['code']).', `status` = 0, `user` = '.$db->quote($user['steamid']).', `summa` = '.$db->quote($s).', `time` = '.$db->quote(time()));
			$out['amount'] = $s;
			setcookie('tid', $out['tid'], time() + 3600 * 24 * 7, '/');
		}
		exit(json_encode($out));
		break;

	case 'confirm':
	if(!$user) exit(json_encode(array('success'=>false, 'error'=>'You must login to access the confirm.')));
		$tid = (int)$_GET['tid'];
		$sql = $db->query('SELECT * FROM `trades` WHERE `id` = '.$db->quote($tid));
		$row = $sql->fetch();
		$out = curl('http://'.$ip.':'.(3000+$row['bot_id']).'/checkTrade?tid='.$row['id']);
		$out = json_decode($out, true);
		if(($out['success'] == true) && ($out['action'] == 'accept') && ($row['status'] != 1)) {
			if($row['summa'] > 0) $db->exec('UPDATE `users` SET `balance` = `balance` + '.$row['summa'].' WHERE `steamid` = '.$db->quote($user['steamid']));
			if($row['summa'] > 0) $db->exec('UPDATE `items` SET `status` = 1 WHERE `trade` = '.$db->quote($row['id']));
			if($row['summa'] > 0) $db->exec('UPDATE `trades` SET `status` = 1 WHERE `id` = '.$db->quote($row['id']));
			setcookie("tid", "", time() - 3600, '/');
		} elseif(($out['success'] == true) && ($out['action'] == 'cross')) {
			setcookie("tid", "", time() - 3600, '/');
			$db->exec('DELETE FROM `items` WHERE `trade` = '.$db->quote($row['id']));
			$db->exec('DELETE FROM `trades` WHERE `id` = '.$db->quote($row['id']));
		} else {
			exit(json_encode(array('success'=>false, 'error'=>'Trade is in process or the coins are already credited')));
		}
		exit(json_encode($out));
		break;

	case 'get_bank_safe':
		if(!$user) exit(json_encode(array('success'=>false, 'error'=>'You must login to access the widthdraw.')));
		$g = curl('https://www.google.com/recaptcha/api/siteverify?secret=6LcFKx4TAAAAAA5RfMEEYHfSFj3met8MV_FWsZ2a&response='.$_GET['g-recaptcha-response']);
		$g = json_decode($g, true);
		if($g['success'] == true) {
			$array = array('balance'=>$user['balance'],'error'=>'none','items'=>array(),'success'=>true);
			$sql = $db->query('SELECT * FROM `items` WHERE `status` = 1');
			$prices = file_get_contents('prices.txt');
			$prices = json_decode($prices, true);
			while ($row = $sql->fetch()) {
				$array['items'][] = array('botid'=>$row['botid'],'img'=>'http://steamcommunity-a.akamaihd.net/economy/image/'.$row['img'],'name'=>$row['market_hash_name'],'assetid'=>$row['id'],'price'=>$prices['response']['items'][$row['market_hash_name']]['value']*10,'reject'=>'unknown items');
			}
			exit(json_encode($array));
		}
		break;

	case 'withdraw_js':
		if(!$user) exit(json_encode(array('success'=>false, 'error'=>'You must login to access the widthdraw.')));
		$items = array();
		$assetids = explode(',', $_GET['assetids']);
		$sum = 0;
		$prices = file_get_contents('prices.txt');
		$prices = json_decode($prices, true);
		$norm_itms = '';
		foreach ($assetids as $key) {
			if($key == "") continue;
			$sql = $db->query('SELECT * FROM `items` WHERE `id` = '.$db->quote($key));
			$row = $sql->fetch();
			$items[$row['botid']] = $row['market_hash_name'];
			$sum += $prices['response']['items'][$row['market_hash_name']]['value']*10;
			$norm_itms = $norm_itms.$row['market_hash_name'].',';
		}
		$out = array('success'=>false,'error'=>'');
		if(count($items) > 1) {
			$out = array('success'=>false,'error'=>'You choose more bots');
		} elseif($user['balance'] < $sum) {
			$out = array('success'=>false,'error'=>'You dont have coins!');
		} else {
			reset($items);
			$bot = key($items);
			$s = $db->query('SELECT `name` FROM `bots` WHERE `id` = '.$db->quote($bot));
			$r = $s->fetch();
			$db->exec('UPDATE `users` SET `balance` = `balance` - '.$sum.' WHERE `steamid` = '.$user['steamid']);
			$partner = extract_partner($_GET['tradeurl']);
			$token = extract_token($_GET['tradeurl']);
			$out = curl('http://'.$ip.':'.(3000+$bot).'/sendTradeMe/?names='.urlencode($norm_itms).'&partner='.$partner.'&token='.$token.'&checksum='.$_GET['checksum'].'&steamid='.$user['steamid']);
			$out = json_decode($out, true);
			if($out['success'] == false) {
				$db->exec('UPDATE `users` SET `balance` = `balance` + '.$sum.' WHERE `steamid` = '.$user['steamid']);
			} else {
				foreach ($assetids as $key) {
					$db->exec('DELETE FROM `items` WHERE `id` = '.$db->quote($key));
				}
				$out['bot'] = $r['name'];
				$db->exec('INSERT INTO `trades` SET `id` = '.$db->quote($out['tid']).', `bot_id` = '.$db->quote($bot).', `code` = '.$db->quote($out['code']).', `status` = 2, `user` = '.$db->quote($user['steamid']).', `summa` = '.'-'.$db->quote($_GET['checksum']).', `time` = '.$db->quote(time()));
			}
		}
		exit(json_encode($out));
		break;

	case 'exit':
		setcookie("hash", "", time() - 3600, '/');
		header('Location: main');
		exit();
		break;
}

function getTemplate($name, $in = null) {
	extract($in);
	ob_start();
	include "pages/" . $name;
	$text = ob_get_clean();
	return $text;
}

function curl($url) {
	$ch = curl_init();

	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_COOKIEFILE, 'cookies.txt');
	curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookies.txt');
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); 

	$data = curl_exec($ch);
	curl_close($ch);

	return $data;
}

function extract_token($url) {
    parse_str(parse_url($url, PHP_URL_QUERY), $queryString);
    return isset($queryString['token']) ? $queryString['token'] : false;
}

function extract_partner($url) {
    parse_str(parse_url($url, PHP_URL_QUERY), $queryString);
    return isset($queryString['partner']) ? $queryString['partner'] : false;
}

function getUserSteamAvatar($steamid){
    $link = file_get_contents('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' . $apikey . '&steamids='.$steamid.'&format=json');
    $link_decoded = json_decode($link, true);

    echo $link_decoded['response']['players'][0]['avatarfull'];
}


function getUserSteamNickname($steamid){
    $link = file_get_contents('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' . $apikey . '&steamids='.$steamid.'&format=json');
    $link_decoded = json_decode($link, true);

    return $link_decoded['response']['players'][0]['personaname'];
}
