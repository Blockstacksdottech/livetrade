from django.shortcuts import render,HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,permissions
from .serializer import RegisterSerializer,ConfigSerializer,WalletSerializer
from .models import CustomUser,Config, WalletConfig
from livepannel.handler import get_balances,get_orders,getEthWalletDetails,getAddressDetails

# Create your views here.


class TestSession(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self,request,format=None):
        user = request.user
        if (user.is_superuser):
            url_path = "/adpanel/dashboard"
            super_user = True
        else:
            url_path = "/userpanel/dashboard"
            super_user = False
            
        print(f'User is {user}')
        u = RegisterSerializer(user).data
        u['path'] = url_path
        u['s'] = super_user
        return Response(u)



class AddUser(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self,request,format=None):
        user = request.user
        if (user):
            if user.is_superuser:
                data = request.data 
                print(data)
                s = RegisterSerializer(data=data)
                if s.is_valid():
                    print('valid')
                    resp = s.save()
                    print(resp)
                    return Response(resp)
                else:
                    print('not valid')
                    return Response({'result':'not created'})
        return Response({'failed':True},status.HTTP_401_UNAUTHORIZED)



class ModUsers(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self,request,format=None):
        params = request.query_params
        users = CustomUser.objects.filter(is_superuser = False)
        data = RegisterSerializer(users,many=True).data

        return Response(data)


    def post(self,request,format=None):
        data = request.data
        user = CustomUser.objects.filter(id = int(data['id']))[0]
        user.username = data['username']
        user.email = data['email']
        if (data['password'] != ''):
            user.set_password(data['password'])
        user.save()
        return Response(RegisterSerializer(user).data)


class DelUsers(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self,request,format=None):
        data = request.data
        user = CustomUser.objects.filter(id = int(data['id']))
        if (len(user) > 0):
            user = user[0]
            user.delete()
            return Response({"success":True})
        else:
            return Response({"success":False},status.HTTP_404_NOT_FOUND)
            



class getData(APIView):

    permission_classes = [permissions.IsAuthenticated]


    def get(self,request,format=None):
        user = request.user
        all_balances,ftx_balances,rex_balances,ftx_total,rex_total,binance_balances,binance_total,all_total = get_balances(user)
        #all_orders = get_orders()
        data = {
            "all_balances" : all_balances,
            "ftx_balances" : ftx_balances,
            "rex_balances" : rex_balances,
            "binance_balances" : binance_balances,
            "binance_total" : binance_total,
            "ftx_total" : ftx_total,
            "rex_total" : rex_total,
            "all_total" : all_total,
            #"all_orders" : all_orders
        }
        return Response(data)



class getOrders(APIView):
    permission_classes = [permissions.IsAuthenticated]


    def get(self,request,format=None):
        user = request.user
        all_orders = get_orders(user)
        if all_orders:
            res = all_orders
        else:
            res = []
        return Response(res)

class getWalletDetails(APIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def get(self,request,format=None):
        user = request.user
        config = WalletConfig.objects.filter(user=user)
        if len(config) == 0:
            eth_address = ""
            bsc_address = ""
        else:
            config = config[0]
            eth_address = config.eth_wallet
            bsc_address = config.bsc_wallet
        #eth_address = "0xdE33e58F056FF0f23be3EF83Ab6E1e0bEC95506f"
        #bsc_address = ""
        if eth_address != "":
            try:
                eth_balances = getEthWalletDetails(eth_address)
            except:
                eth_balances = []
        else:
            eth_balances = []
        
        if bsc_address != "":
            try:
                bsc_balances = getAddressDetails(bsc_address)
            except:
                bsc_balances = []
        else:
            bsc_balances = []
        resp = {
            'eth_balances' : eth_balances,
            'bsc_balances' : bsc_balances
        }
        return Response(resp)



class ExchangeHandler(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request,format=None):
        u = request.user
        configs = Config.objects.filter(user=u)
        res = {}
        confs = ConfigSerializer(configs,many=True).data
        for conf in confs:
            res[conf['exchange']] = conf
        
        print(res)
        return Response(res)





    def post(self,request,format=None):
        user = request.user
        data= request.data
        config = Config.objects.filter(user=user,exchange=data['exchange'])
        if len(config) == 0:
            #create new conf for user
            conf = Config.objects.create(user=user,exchange=data['exchange'],public_key=data['public_key'],private_key=data['private_key'])
            conf.save()

        else:
            conf = config[0]
            conf.exchange = data['exchange']
            conf.public_key = data['public_key']
            conf.private_key = data['private_key']
            conf.save()
        
        d = ConfigSerializer(conf).data
        return Response(d)


class WalletHandler(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self,request,format=None):
        user = request.user
        conf = WalletConfig.objects.filter(user=user)
        if (len(conf) == 0):
            resp = {
                'eth_wallet' : "",
                'bsc_wallet' : ""
            }
        else:
            conf = conf[0]
            resp = WalletSerializer(conf).data
        

        return Response(resp)

    def post(self,request,format=None):
        user = request.user
        data=  request.data
        conf = WalletConfig.objects.filter(user=user)
        if len(conf) == 0:
            conf = WalletConfig.objects.create(user = user)
        else:
            conf = conf[0]
        conf.eth_wallet = data.get('eth_wallet','')
        conf.bsc_wallet = data.get('bsc_wallet','')
        conf.save()

        resp = WalletSerializer(conf).data
        return Response(resp)


