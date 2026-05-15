from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from rest_framework.views import APIView
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

import numpy as np
import re
import base64
from io import BytesIO
import qrcode
from .utils import (
    parsuj_zdjecie,
    sprawdz_uzytkownika,
    wyciagnij_embedding,
    porownaj_twarze,
    supabase
)
@csrf_exempt


class QRStartView(APIView):
    def get(self, request):
        
    
        url = "https://ethyl-unillusory-aaron.ngrok-free.dev/kamera/" 

        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url.strip())
        qr.make(fit=True)
        img = qr.make_image(fill_color='black', back_color='white')
        
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
   
        return Response({
            "qr_code_base64": qr_base64,
            "scan_url": url,
            "supabase_url": "https://wbkqwqfarrnpdcvcsxrq.supabase.co",
            "supabase_key": "sb_publishable_hwpw0HQMDlKTqCOGgiwO0w_RY0gETBx" # Najlepiej trzymać w env
        })
class KameraView(APIView):
    def get(self, request):
        return render(request, "kamera.html")
class HomeView(APIView):
    def get(self, request):
        return redirect('qr-start')
class SprawdzDokumentView(APIView):
    def post(self, request):
        plik = request.FILES.get("zdjecie")
        if not plik:
            return JsonResponse({"message": "Brak zdjęcia"}, status=400)
        dane = parsuj_zdjecie(plik)
        if not dane or not dane.get("imie"):
            return JsonResponse({"message": "Nie udało się odczytać danych"}, status=400)
        user = sprawdz_uzytkownika(
            dane.get("imie"),
            dane.get("nazwisko"),
            dane.get("klasa")
        )
        if user:
            return JsonResponse({
                "status": "OK",
                "message": "Użytkownik znaleziony",
                "can_face": True,
                "imie": user.get("name"),
                "nazwisko": user.get("surename"),
                "klasa": user.get("clase"),
                "user_id": user.get("user_id")
            })
        return JsonResponse({"status": "FAIL", "can_face": False})
class SprawdzTwarzView(APIView):
    def post(self, request):
        plik = request.FILES.get("zdjecie")
        nazwisko_z_ocr = request.POST.get("nazwisko")
        if not plik:
            return JsonResponse({"message": "Brak zdjęcia"}, status=400)
        try:
            user_data = supabase.table("users").select("user_id").eq("surename", nazwisko_z_ocr).execute()
            if not user_data.data:
                return JsonResponse({"message": "Błąd bazy"}, status=404)
            target_id = user_data.data[0].get("user_id")
            embedding_nowy_raw = wyciagnij_embedding(plik)
            if embedding_nowy_raw is None:
                return JsonResponse({"message": "Brak twarzy"}, status=400)
            embedding_nowy = [float(x) for x in embedding_nowy_raw]
            res = supabase.table("face_embeddings").select("face_embedding").eq("user_id", target_id).execute()
            if not res.data:
                supabase.table("face_embeddings").insert({"user_id": target_id, "face_embedding": embedding_nowy}).execute()
                return JsonResponse({"status": "SUCCESS", "message": "Zarejestrowano wzorzec!"})
            raw_baza = res.data[0].get("face_embedding")
            if isinstance(raw_baza, str):
                clean_string = re.sub(r'[^0-9.,\-]', '', raw_baza)
                embedding_baza = [float(x) for x in clean_string.split(",") if x.strip()]
            else:
                embedding_baza = raw_baza
            emb_n = np.array(embedding_nowy, dtype=np.float32)
            emb_b = np.array(embedding_baza, dtype=np.float32)
            similarity = np.dot(emb_n, emb_b) / (np.linalg.norm(emb_n) * np.linalg.norm(emb_b))
            if similarity > 0.45:
                supabase.table("users").update({"logged": True}).eq("user_id", target_id).execute()
                return JsonResponse({"status": "SUCCESS", "score": float(similarity)})
            else:
                return JsonResponse({"status": "FAIL", "score": float(similarity)}, status=403)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)