from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from . import adminLogin
from .userLogin import user_login
from .logout import logout_user
from . import views 
from .logoutAdmin import logout_admin
urlpatterns = [
    path('api/user/logout-admin/', logout_admin, name='logout_admin'),
    path('admin/', admin.site.urls),
    path('', views.QRStartView, name='qr_login'),
    path('admin/', admin.site.urls),
    path('kamera/', views.KameraView.as_view(), name='kamera'),
    path('sprawdz-dokument/', views.SprawdzDokumentView.as_view(), name='sprawdz-dokument'),
    path('sprawdz-twarz/', views.SprawdzTwarzView.as_view(), name='sprawdz-twarz'),
    path('api/user/logout/', logout_user, name='logout_api'),
    path('api/admin/login/', adminLogin.admin_login, name='admin_login_api'),
    path('api/user/login/', user_login, name='user_login_api'),
    path('success-page/', TemplateView.as_view(template_name="logged.html"), name='logged-success'),
]