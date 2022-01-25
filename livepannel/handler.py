import time
import hmac
from requests import Request
from bs4 import BeautifulSoup
import requests as req
import json
from datetime import datetime,timedelta
from dateutil import parser
import ccxt
import json
from livetradeapi.bitcointrade import PrivateApi


from livetradeapi.models import *




eth_key = "EK-fZRdX-dvqELs7-51yUh"

api_key = "CaCXlR6drGKeSyq4mQpvjDfWn7K_wOJhG3qHEUcz"
api_secret = "a5S3MuyGlW49vQS8RvP4Lyng9mr3am2Ul60AkCqN"
api_key_2 = "b1eeb81485cf62c25c3407cacc2a837f81bd989cf6d1266507efd9736547d83f"
api_base_2 = "https://api.exchange.ripio.com/api/v1/"

binance_key = "L9BX0FipVJE27oRLNiRCfpivHhG8659M8z9WpPEl4TeLUdHkvcFicd1baxnIdcXU"
binance_secret = "1Kh9CGPJWp4zDzO4MgRdgBGLVPgoTf68lgT8m9IoDUhw4E4fUj14ojTRlgrF4QMd"


def get_bitcoin_trade(user):
    #BitcoinTrade ==> id 3 
    conf = Config.objects.filter(user=user,exchange=3)
    #conf = []
    if len(conf) > 0:
        conf = conf[0]
        print(conf.public_key)
        ap = PrivateApi(conf.public_key)
    else:
        ap = False

    return ap



def get_exchanger_handlers(user):
    ex_class = getattr(ccxt,ccxt.exchanges[96])
    ex_class_2 = getattr(ccxt,ccxt.exchanges[61])
    ex_class_3 = getattr(ccxt,ccxt.exchanges[6])

    #FTX ==> id 2 
    conf = Config.objects.filter(user=user,exchange=2)
    #conf = []
    if len(conf) > 0:
        conf = conf[0]
        ex = ex_class_2({
        'apiKey' : conf.public_key,
        'secret' : conf.private_key
    })
    else:
        ex = False



    #Ripio ==> id 1
    conf = Config.objects.filter(user=user,exchange=1)
    
    #conf = []
    if len(conf) > 0:
        conf = conf[0]
        exc = ex_class({
        'apiKey' : conf.public_key,
        'secret' : conf.private_key
    })
    else:
        exc = False


    
    #Binance ==> id 4
    conf = Config.objects.filter(user=user,exchange=4)
    #conf = []
    if len(conf) > 0:
        conf = conf[0]
        exc2 = ex_class_3({
        'apiKey' : conf.public_key,
        'secret' : conf.private_key
    })
    else:
        exc2 = False

    return ex,exc,exc2



def call_api(endpoint):
    ts = int(time.time() * 1000)
    api_base = "https://ftx.com/api/"
    request = Request('GET', api_base  + endpoint)
    prepared = request.prepare()
    print(prepared.method)
    print(prepared.path_url)
    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
    signature = hmac.new(api_secret.encode(), signature_payload, 'sha256').hexdigest()
    headers = {}
    headers['FTX-KEY'] = api_key
    headers['FTX-SIGN'] = signature
    headers['FTX-TS'] = str(ts)


    resp = req.get(api_base  + endpoint , headers=headers)
    print(resp)
    print(resp.content.decode()) 
    return json.loads(resp.content.decode())




def call_api_2(endpoint):
    headers = {
        "Content-Type" : "application/json",
        "Authorization" : "Bearer "+api_key_2
    }
    print(headers)
    url = api_base_2+endpoint
    print(url)
    resp = req.get(url,headers=headers)
    print(resp)
    return json.loads(resp.content.decode())

def convertstamp(stamp):
    return datetime.fromtimestamp(stamp)

def getYest():
    return int((datetime.now() - timedelta(days=1)).timestamp() * 1000)

def convertStamp(stamp):
    d = datetime.fromtimestamp(stamp)
    return d.strftime("%m/%d/%Y, %H:%M:%S")

def getBitcoinTradeTimeStamp(dt):
    date_obj = parser.parse(dt)
    return date_obj.timestamp()



def get_org_symbols(exc):
    symbols = exc.symbols
    usdc_symbols = []
    ars_symbols = []
    other = []
    for sym in symbols:
        if '/USDC' in sym:
            usdc_symbols.append(sym)
        elif '/ARS' in sym:
            ars_symbols.append(sym)
        else:
            other.append(sym)
    return usdc_symbols,ars_symbols,other


    

def format_float(amount,amount_usd):
    amount = float(amount)
    amount_usd = float(amount_usd)
    if amount_usd != -1:
        return "{:.2f}".format(amount),"{:.2f} USD".format(amount_usd)
    else:
        return "{:.2f}".format(amount),"???"

def format_single_float(amount):
    return "{:.2f}".format(float(amount))

def convert_ripio_usd(coin,total_c,ex):
    usdc_s,ars_s,other = get_org_symbols(ex)
    total = 0
    total_usd = 0
    if coin+'/USDC' in usdc_s:
        price = ex.fetchTicker(coin+'/USDC')
        total += total_c
        total_usd += total_c * float(price['average'])
    elif coin+'/ARS' in ars_s:
        if coin == 'USDC':
            total += total_c
            total_usd += total_c
        else:
            ars_price = ex.fetchTicker('USDC/ARS')
            coin_price = ex.fetchTicker(coin+'/ARS')
            ars_rate = 1/float(ars_price['average'])
            total += total_c
            total_usd += total_c * float(coin_price['average']) * ars_rate
    elif coin+'/BTC' in other:
        btc_price = ex.fetchTicker('BTC/USDC')
        coin_price = ex.fetchTicker(coin+'/BTC')
        btc_rate = float(btc_price['average'])
        total += total_c
        total_usd += total_c * btc_rate
    elif coin == 'ARS':
        ars_price = ex.fetchTicker('USDC/ARS')
        ars_rate = 1/float(ars_price['average'])
        total += total_c
        total_usd += total_c * ars_rate
    else:
        total += total_c
        total_usd = -1

    resp1,resp2 = format_float(total,total_usd)
    
    return resp1,resp2,total_usd

def format_rex_balance(ex):
    balance = ex.fetchBalance()
    balances = [(k,v) for k,v in balance['total'].items() if float(v) != 0]
    res = []
    total_r = 0
    for elem in balances:
        total,total_usd,ttl = convert_ripio_usd(elem[0],elem[1],ex)
        total_r += ttl
        res.append({
            "coin" : elem[0].upper(),
            "total" : total,
            "total_usd" : total_usd
        })
    res = sorted(res,key= lambda k : float(k['total_usd'].split(' ')[0]),reverse=True)
    return res,total_r

def format_ftx_balance(ex):
    balance = ex.fetchBalance()
    #balances = [ {"coin":elem['coin'].upper(),"total":elem["total"],"total_usd" : elem['usdValue']+" USD"}   for elem in balance['info']['result'] if float(elem['total']) != 0]
    balances = []
    total = 0
    for elem in balance['info']['result'] :
        if float(elem['total']) != 0:
            total += float(elem['usdValue'])
            balances.append({"coin":elem['coin'].upper(),"total": format_single_float(elem["total"]),"total_usd" : format_single_float(elem['usdValue'])+" USD"})
    balances = sorted(balances,key= lambda k : float(k['total_usd'].split(' ')[0]),reverse=True)
    return balances,total


def getPriceUsd(c,coin,val):
    if 'usd' in coin.lower():
        return val
    else:
        ticker = c.fetchTicker(coin.upper()+'/BUSD')
        return '{0:.2f}'.format(round(float(ticker['average']) * val,2))


def formatBinanceBalance(ex):
    balance = ex.fetchBalance()
    res = []
    total = 0
    for elem in balance['info']['balances']:
        if float(elem['free']) != 0 and not elem['asset'].startswith('LD'):
            print(elem['asset'])
            price =  str(getPriceUsd(ex,elem["asset"],float(elem['free'])))
            print(price)
            total += float(price)
            dct = {"coin":elem['asset'].upper(),"total":elem["free"],"total_usd" : price+" USD"}
            res.append(dct)
    return res,total


def formatBitcoinTradeBalance(ex):
    balance = ex.balance()
    usd_rate = ex.estimated_price(pair="BRLUSDC",amount=float(1),type="buy")
    
    usd_rate = usd_rate['price']
    
    res = []
    total = 0
    for elem in balance:
        if float(elem['available_amount']) == 0 :
            continue
        if elem['currency_code'] != "BRL":
            print(float(elem['available_amount']))
            brl_rate = ex.estimated_price(pair="BRL"+elem['currency_code'],amount=float(elem['available_amount']),type="buy")
            brl_rate = brl_rate['price']
            price = roudn(brl_rate / usd_rate,2)
        else:
            price = round(float(elem['available_amount']) / usd_rate,2)
        
        total += price
        dct = {"coin" : elem['currency_code'],"total":elem["available_amount"],"total_usd": str(price) + " USD"}
        res.append(dct)
    return res,total

def group_balances(*args):
    coin_b = {}
    for arg in args:
        for cont in arg:
            if coin_b.get(cont['coin'],False):
                d = coin_b[cont['coin']]
                d['total'] += float(cont['total'])
                if '?' not in  cont['total_usd']:
                    d['total_usd'] += float(cont['total_usd'].split(' ')[0])
                else:
                    d['total_usd'] += 0
            else:
                if '?' not in  cont['total_usd']:
                    coin_b[cont['coin']] = {
                        'total' : float(cont['total']),
                        'total_usd' : float(cont['total_usd'].split(' ')[0])
                    }
                else:
                    coin_b[cont['coin']] = {
                        'total' : float(cont['total']),
                        'total_usd' : 0
                    }
    

    return coin_b
        

def get_balances(user):
    ex,exc,exc2 = get_exchanger_handlers(user)
    ap = get_bitcoin_trade(user)

    try:
        if ex:

            ex.load_markets()
            ftx_balances,ftx_total = format_ftx_balance(ex)
        else:
            ftx_balances,ftx_total = [],0
    except Exception as e:
        print(str(e))
        ftx_balances,ftx_total = [],0
    try:
        if exc:
            exc.load_markets()
            rex_balances,rex_total = format_rex_balance(exc)
        else:
            rex_balances,rex_total = [],0
    except Exception as e:
        print(str(e))
        rex_balances,rex_total = [],0
    
    try:
        if exc2:
            exc2.load_markets()
            binance_balances,binance_total = formatBinanceBalance(exc2)
        else:
            binance_balances,binance_total = [],0
    except Exception as e:
        print(str(e))
        binance_balances,binance_total = [],0

    try:
        if ap:
            bitcoinTrade_balances,bitcoinTrade_total = formatBitcoinTradeBalance(ap)
        else:
            bitcoinTrade_balances,bitcoinTrade_total = [],0
    except Exception as e:
        print(str(e))
        bitcoinTrade_balances,bitcoinTrade_total = [],0
    
    
    all_total = ftx_total + rex_total + binance_total + bitcoinTrade_total
    pre_res = group_balances(ftx_balances,rex_balances,binance_balances,bitcoinTrade_balances)
    res = []
    for coin in pre_res:
        total,total_usd = format_float(pre_res[coin]['total'],pre_res[coin]['total_usd'])
        res.append({
            "coin" : coin,
            "total" : total,
            "total_usd" : total_usd
        })
    res = sorted(res,key=lambda  k :  float(k['total_usd'].split(' ')[0]),reverse=True)
    return (res,
    ftx_balances,
    rex_balances,
    format_single_float(ftx_total),
     format_single_float(rex_total),
     binance_balances,
     format_single_float(binance_total),
     format_single_float(all_total),
     bitcoinTrade_balances,
     format_single_float(bitcoinTrade_total)
        
    )

def get_ftx_orders(ex):
    trades = ex.fetchOrders( since=None, limit=None, params={})
    all_trades = []
    for trade in trades:
        if not trade['average']:
            continue
        all_trades.append({
            'exc':'FTX',
            'market' : trade['info']['market'],
            'side' : trade['info']['side'],
            'price' : trade['average'],
            'total' : trade['cost'],
            'size' : trade['info']['size'],
            'timestamp' : trade['timestamp'] / 1000,
            'stamp' : convertStamp(trade['timestamp']/1000)
        })
    return all_trades

def get_rex_orders(exc):
    all_trades = []

    for sym in exc.symbols:
        trades = exc.fetchOrders(symbol=sym, since=None, limit=None, params={})
        if len(trades) > 0:
            for trade in trades:
                all_trades.append({
                    'exc':'REX',
                    'market' : trade['info']['pair'].replace('_','/'),
                    'side' : trade['info']['side'],
                    'price' : trade['info']['fill_price'],
                    'total' : trade['info']['notional'],
                    'size' : trade['info']['amount'],
                    'timestamp' : int(trade['info']['created_at']),
                    'stamp' : convertStamp(int(trade['info']['created_at']))
                })
    return all_trades


def getBinanceOrders(ex):
    bals,tot = formatBinanceBalance(ex)
    print(bals)
    keyss = [k["coin"] for k in bals]
    def checkPair(pair):
        if pair.split('/')[0] in keyss:
            return True
        else:
            return False
    ress = list(filter(checkPair,ex.symbols))
    trades = []
    for pair in ress:
        partial = ex.fetchOrders(symbol=pair,since=None,limit=None,params={})
        trades += partial
    all_trades = []
    for trade in trades:
        if not trade['average']:
            print(trade)
            continue
        all_trades.append({
            'exc':'Binance',
            'market' : trade['info']['symbol'],
            'side' : trade['info']['side'],
            'price' : trade['average'],
            'total' : trade['cost'],
            'size' : trade['info']['executedQty'],
            'timestamp' : trade['timestamp'] / 1000,
            'stamp' : convertStamp(trade['timestamp']/1000)
        })
    return all_trades


def getBitcoinTradeOrders(ap):
    pairs = ['BRL1INCH',  'BRLBCH', 'BRLBTC', 'BRLDAI', 'BRLDOT', 'BRLENS', 'BRLEOS', 'BRLETH', 'BRLKSM', 'BRLLTC', 'BRLRPC', 'BRLSPELL', 'BRLUNI', 'BRLUSDC', 'BRLXRP']
    
    all_trades = []
    for pair in pairs:
        orders = ap.get_user_orders(pair = pair)
        orders = orders['orders']
        for trade in orders:
            stamp = getBitcoinTradeTimeStamp(trade['create_date'])
            all_trades.append({
                'exc':'BitcoinTrade',
                'market' : trade['pair'],
                'side' : trade['type'],
                'price' : trade['unit_price'],
                'total' : trade['total_price'],
                'size' : trade['executed_amount'],
                'timestamp' : stamp,
                'stamp' : convertStamp(stamp)
            })
    return all_trades


def get_orders(user):
    ex,exc,exc2 = get_exchanger_handlers(user)
    ap = get_bitcoin_trade(user)
    all_trades = []
    try:
        if ex:
            ex.load_markets()
            ftx_trades = get_ftx_orders(ex)
        else:
            ftx_trades = []
    except Exception as e:
        print(str(e))
        ftx_trades = []
    
    try:
        if exc:
            exc.load_markets()
            rex_trades = get_rex_orders(exc)
        else:
            rex_trades = []
    except Exception as e:
        print(str(e))
        rex_trades = []
    
    try:
        if exc2:
            exc2.load_markets()
            binance_trades = getBinanceOrders(exc2)
        else:
            binance_trades = []
    except Exception as e:
        print(str(e))
        binance_trades = []

    try:
        if ap:
            bitcoinTradeOrders = getBitcoinTradeOrders(ap)
        else:
            bitcoinTradeOrders = []
    except Exception as e:
        print(str(e))
        bitcoinTradeOrders = []
    
    rex_trades = []
    all_trades += ftx_trades + rex_trades + binance_trades + bitcoinTradeOrders
    all_trades = sorted(all_trades,key = lambda k : k['timestamp'],reverse=True)
    return all_trades
    
    


def getEthWalletDetails(address):
    base = "https://api.ethplorer.io/"
    url = base+'getAddressInfo/'+address+'?apiKey='+eth_key
    print(url)
    rep = req.get(url)
    data = json.loads(rep.content.decode())
    return data




def getSymbol(url):
    base = "https://bscxplorer.com"+url
    resp = req.get(base)
    b = BeautifulSoup(resp.content.decode(),"html.parser")
    h1 = b.find('h1')
    symbol = h1.text.split(')')[-2].split('(')[-1]
    return symbol

def getAddressDetails(add):
    resp = req.get("https://bscxplorer.com/address/"+add)
    soup = BeautifulSoup(resp.content.decode(),"html.parser")
    content = soup.find('table',{'class':"table-borderless"})
    data = []
    trs = content.findAll('tr')
    for tr in trs:
        try:
            tds = tr.findAll('td')
            a_tag = tds[0].find('a')
            balance = tds[1].text
            if float(balance) == 0:
                continue
            symbol = getSymbol(a_tag['href'])
            
            data.append({'coin' : symbol,'balance': format_single_float(tds[1].text)})
        except:
            print(tr)
    return data

def getEthWalletDetails(address):
    base = "https://api.ethplorer.io/"
    url = base+'getAddressInfo/'+address+'?apiKey='+eth_key
    print(url)
    rep = req.get(url)
    data = json.loads(rep.content.decode())
    tokens = data['tokens']
    res = []
    for tok in tokens:
        res.append({
            'coin' : tok['tokenInfo']['symbol'],
            'balance' : format_single_float(tok['balance'])
        })
    return res

    
            
#format_ripio_balance(exc)     
#format_ftx_balance(ex)

#get_orders()
#get_balances()