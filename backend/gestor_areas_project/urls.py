"""
URL configuration for gestor_areas_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/inventario/', include('inventario.urls')),
    path('api/reportes/', include('reportes.urls')),
    path('api/mantenimiento/', include('mantenimiento.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/discos/', include('discos.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)