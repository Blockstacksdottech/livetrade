from rest_framework.serializers import ModelSerializer
from .models import CustomUser,Config,WalletConfig


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id','username','email','password']
        extra_kwargs = {'password': {'write_only':True}}

    def create(self,validated,*args,**kwargs):
        u = CustomUser.objects.create(username = validated['username'],email=validated['email'])
        u.set_password(validated['password'])
        u.save()

        return RegisterSerializer(u).data

class ConfigSerializer(ModelSerializer):
    class Meta:
        model = Config
        fields = ['id','exchange','public_key','private_key']


class WalletSerializer(ModelSerializer):
    class Meta:
        model = WalletConfig
        fields = ['id','eth_wallet','bsc_wallet']
        