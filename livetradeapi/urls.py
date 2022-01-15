from django.contrib import admin
from django.urls import path,re_path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [

    path('token',TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('session',TestSession.as_view()),

    # admin links 
    path('adduser',AddUser.as_view()),
    path('users',ModUsers.as_view()),
    path('users',ModUsers.as_view()),
    path('deluser',DelUsers.as_view()),

    #user link

    path('getdata',getData.as_view()),
    path('getwallet',getWalletDetails.as_view()),
    path('getOrders',getOrders.as_view()),

    #config links

    path('exchanges',ExchangeHandler.as_view()),
    path('wallet',WalletHandler.as_view()),


]