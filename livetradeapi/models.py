from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.



class CustomUser(AbstractUser):
    email = models.EmailField(default='',null=True)
    isAdmin = models.BooleanField(default=False)



    def __str__(self):
        return self.username


class Config(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    exchange = models.CharField(default="",max_length=255)
    public_key = models.CharField(default="",max_length=255)
    private_key = models.CharField(default="",max_length=255)


    def __str__(self):
        return self.exchange

class WalletConfig(models.Model):
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE)
    eth_wallet = models.CharField(default="",max_length=255)
    bsc_wallet = models.CharField(default="",max_length=255)


    def __str__(self):
        return str(self.user)