from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteViewSet, PublicReporteView, ReporteStatsView

router = DefaultRouter()
router.register(r'gestion', ReporteViewSet, basename='reporte')

urlpatterns = [
    # API Router (Gestión Admin)
    path('', include(router.urls)),
    
    # Endpoints específicos
    path('public/create/', PublicReporteView.as_view(), name='public-create-reporte'),
    path('stats/general/', ReporteStatsView.as_view(), name='reporte-stats'),
]
