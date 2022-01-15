from django.shortcuts import render
from django.views.generic import View
from .handler import get_balances,get_orders

# Create your views here.


class Index(View):

	def get(self,request):
		all_balances,ftx_balances,rex_balances,ftx_total,rex_total,all_total = get_balances()
		all_orders = get_orders()
		data = {
			"all_balances" : all_balances,
			"ftx_balances" : ftx_balances,
			"rex_balances" : rex_balances,
			"ftx_total" : ftx_total,
			"rex_total" : rex_total,
			"all_total" : all_total,
			"all_orders" : all_orders
		}
		return render(request,'index.html',data)