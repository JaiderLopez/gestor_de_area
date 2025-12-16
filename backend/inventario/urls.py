from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, DispositivoViewSet, MovimientoViewSet

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'dispositivos', DispositivoViewSet)
router.register(r'movimientos', MovimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
