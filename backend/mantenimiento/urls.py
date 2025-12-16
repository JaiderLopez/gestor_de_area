from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import MantenimientoViewSet

router = DefaultRouter()
router.register(r'mantenimientos', MantenimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
