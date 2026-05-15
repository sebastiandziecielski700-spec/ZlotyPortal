import pytesseract
from PIL import Image
import re
from supabase import create_client, Client
import easyocr
import numpy as np
from insightface.app import FaceAnalysis
import ast 
import re
SUPABASE_URL = "https://wbkqwqfarrnpdcvcsxrq.supabase.co"
SUPABASE_KEY = "sb_secret_ugWB8Dun3gJUoNvRgLK_zg_rRvhkuxq" 
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
reader = easyocr.Reader(['pl', 'en']) 
app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=0) 
def parsuj_zdjecie(plik):
    """Odczytuje tekst z dokumentu i wyciąga imię, nazwisko oraz klasę."""
    try:
        obraz = Image.open(plik)
        obraz_np = np.array(obraz) 
        wyniki = reader.readtext(obraz_np, detail=0) 
        tekst = " ".join(wyniki) 
        print(f"DEBUG OCR (surowy tekst): {tekst}")
        dane = {"imie": None, "nazwisko": None, "klasa": None}
        imie_match = re.search(r"Imi[eę]:?\s*(\w+)", tekst, re.IGNORECASE)
        nazwisko_match = re.search(r"Nazwisko:?\s*(\w+)", tekst, re.IGNORECASE)
        klasa_match = re.search(r"Klasa:?\s*([\w\d]+)", tekst, re.IGNORECASE)
        if imie_match:
            dane["imie"] = imie_match.group(1).strip()      
        if nazwisko_match:
            dane["nazwisko"] = nazwisko_match.group(1).strip()
        if klasa_match:
            dane["klasa"] = klasa_match.group(1).strip()
        print("DEBUG OCR (wykryte):", dane)
        return dane
    except Exception as e:
        print(f"BŁĄD PARSOWANIA: {e}")
        return None
def pobierz_id_po_nazwisku(nazwisko):
    """Szuka user_id w tabeli users na podstawie kolumny surename."""
    try:
        query = supabase.table("users") \
            .select("user_id") \
            .eq("surename", nazwisko) \
            .execute()
        if query.data:
            return query.data[0].get("user_id")
        return None
    except Exception as e:
        print(f"BŁĄD POBIERANIA ID: {e}")
        return None
def sprawdz_uzytkownika(imie, nazwisko, klasa):
    try:
        print(f"DEBUG: Szukam w tabeli 'users': {imie}, {nazwisko}, {klasa}")
        query = supabase.table("users") \
            .select("*") \
            .eq("name", imie) \
            .eq("surename", nazwisko) \
            .eq("clase", klasa) \
            .execute()
        if query.data and len(query.data) > 0:
            print(f"DEBUG: Znalazłem rekord: {query.data[0]}")
            return query.data[0]
        print("DEBUG: Baza zwróciła pustą listę (brak dopasowania).")
        return None
    except Exception as e:
        print(f"BŁĄD SUPABASE W UTILS: {e}")
        return None
def wyciagnij_embedding(plik):
    """Generuje wektor 512-wymiarowy z twarzy na zdjęciu."""
    try:
        img = np.array(Image.open(plik).convert("RGB"))
        faces = app.get(img)
        if not faces:
            print("DEBUG BIOMETRIA: Nie znaleziono twarzy.")
            return None
        embedding = faces[0].embedding.astype(float).tolist()
        print(f"DEBUG BIOMETRIA: Wygenerowano wektor o długości {len(embedding)}")
        return embedding
    except Exception as e:
        print(f"BŁĄD BIOMETRII: {e}")
        return None
def porownaj_twarze(emb1, emb2, prog=0.45):
    if emb1 is None or emb2 is None:
        return False
    def na_numpy(v):
        if isinstance(v, (list, np.ndarray)):
            return np.array(v).astype(np.float32)
        if isinstance(v, str):
            import re
            clean = re.sub(r'[^0-9.,\-]', '', v)
            try:
                lista_liczb = [float(x) for x in clean.split(',') if x.strip()]
                return np.array(lista_liczb).astype(np.float32)
            except Exception as e:
                print(f"BŁĄD KONWERSJI W UTILS: {e}")
                return np.zeros(512).astype(np.float32)
        return np.array(v).astype(np.float32)
    try:
        e1 = na_numpy(emb1)
        e2 = na_numpy(emb2)
        if e1.shape != e2.shape or e1.shape[0] == 0:
            print(f"BŁĄD WYMIARÓW: {e1.shape} vs {e2.shape}")
            return False
        dot = np.dot(e1, e2)
        norm1 = np.linalg.norm(e1)
        norm2 = np.linalg.norm(e2)
        if norm1 == 0 or norm2 == 0:
            similarity = 0
        else:
            similarity = dot / (norm1 * norm2)
        print("\n" + "="*40)
        print(f" ANALIZA BIOMETRYCZNA (COSINE)")
        print(f" Wynik: {similarity:.4f}")
        print(f" Próg: {prog}")
        print(f" Werdykt: {'ZATWIERDZONO' if similarity > prog else 'ODRZUCONO'}")
        print("="*40 + "\n")
        return similarity > prog
    except Exception as e:
        print(f"KRYTYCZNY BŁĄD PORÓWNANIA: {e}")
        return False