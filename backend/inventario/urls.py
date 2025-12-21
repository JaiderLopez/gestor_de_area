from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoriaViewSet, DispositivoViewSet, MovimientoViewSet, ExportInventoryTemplateView, ImportInventoryDataView

router = DefaultRouter()
router.register(r'categorias', CategoriaViewSet)
router.register(r'dispositivos', DispositivoViewSet)
router.register(r'movimientos', MovimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('export-template/', ExportInventoryTemplateView.as_view(), name='inventory-export-template'),
    path('import/', ImportInventoryDataView.as_view(), name='inventory-import'),
]
