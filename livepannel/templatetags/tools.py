from django import template

register = template.Library()


@register.simple_tag
def getel(dct,key):
	return dct[key]


