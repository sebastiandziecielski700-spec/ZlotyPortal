# 🏆 Złoty Portal — Szkolna Platforma Aktywności

> Nowoczesna platforma webowa dla uczniów i administracji szkoły, łącząca w jednym miejscu zarządzanie olimpiadami, stypendiami, głosowaniami, ankietami i ogłoszeniami.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## 🎯 O Projekcie

**Złoty Portal** to fullstack aplikacja webowa zbudowana na potrzeby szkolnego środowiska. Umożliwia zarówno uczniom jak i administratorom wygodne zarządzanie aktywnościami szkoły z poziomu przeglądarki.

Aplikacja integruje się z **Supabase** jako backendem bazy danych (PostgreSQL) oraz posiada zaplecze w **Django** do obsługi rozpoznawania legitymacji szkolnych metodami OCR i biometrią twarzy.

---

## 🗂️ Struktura Aplikacji

```
z_app/
├── app/                        # Next.js App Router
│   ├── admin/                  # Panel Administratora
│   │   ├── page.tsx            # Dashboard admina
│   │   ├── uzytkownicy/        # Zarządzanie użytkownikami
│   │   ├── klasy/              # Zarządzanie klasami + przypisywanie uczniów
│   │   ├── olimpiady/          # CRUD olimpiad + lista uczestników
│   │   ├── stypendia/          # CRUD stypendiów + lista aplikantów
│   │   ├── glosowania/         # Tworzenie głosowań, ankiet i petycji
│   │   ├── ogloszenia/         # Publikacja ogłoszeń szkolnych
│   │   └── raporty/            # Statystyki i raporty aktywności
│   ├── components/             # Komponenty współdzielone
│   │   ├── PasekBoczny.tsx     # Sidebar z nawigacją + wylogowanie
│   │   ├── ModalUstawien.tsx   # Ustawienia (motyw, debug login)
│   │   ├── ModalUczestnicy.tsx # Modal listy uczestników/aplikantów
│   │   ├── ModalPotwierdzenia.tsx
│   │   └── ModalAplikacjiStypendium.tsx
│   ├── logowanie/              # Strona logowania QR
│   │   └── reczne/             # Logowanie ręczne (imię + nazwisko)
│   ├── olimpiady/              # Panel ucznia — przeglądanie i zapis
│   ├── stypendia/              # Panel ucznia — przeglądanie i aplikacja
│   ├── glosowania/             # Panel ucznia — głosowanie/petycje/ankiety
│   └── ogloszenia/             # Panel ucznia — tablica ogłoszeń
├── zlota_apka/                 # Backend Django
│   ├── views.py                # Endpointy API (rejestracja, user info)
│   └── getUserInfo.py          # Pobieranie danych użytkownika z Supabase
├── utils/
│   └── supabase/               # Klienty Supabase (client/server)
└── requirements.txt            # Zależności Python
```

---

## ✨ Funkcjonalności

### 👨‍🎓 Panel Ucznia
| Moduł | Opis |
|-------|------|
| **Strona Główna** | Skrót aktywności — głosowania, olimpiady, ogłoszenia |
| **Olimpiady** | Przeglądanie konkursów, rejestracja, podgląd statusu |
| **Stypendia** | Wyszukiwarka z filtrami (klasa, wiek, zainteresowania), składanie wniosków |
| **Głosowania** | Udział w głosowaniach, podpisywanie petycji, wypełnianie ankiet |
| **Ogłoszenia** | Tablica ogłoszeń szkolnych z kategoriami |

### 🛡️ Panel Administratora
| Moduł | Opis |
|-------|------|
| **Dashboard** | Przegląd statystyk i ostatniej aktywności |
| **Użytkownicy** | Lista uczniów, dodawanie i usuwanie kont |
| **Klasy** | Zarządzanie klasami, przypisywanie uczniów |
| **Olimpiady** | Tworzenie/usuwanie olimpiad, podgląd zapisanych |
| **Stypendia** | Tworzenie/usuwanie stypendiów, podgląd aplikantów |
| **Głosowania** | Tworzenie głosowań / ankiet / petycji |
| **Ogłoszenia** | Publikowanie ogłoszeń szkolnych |
| **Raporty** | Statystyki użytkowników i aktywności |

### 🔐 Logowanie
- **Skanowanie QR** — główna metoda logowania przez legitymację szkolną
- **Logowanie ręczne** — podanie imienia i nazwiska (tryb debug / fallback)
- **Logowanie przez Django backend** — przez OCR i biometrię twarzy (ngrok)

---

## 🛠️ Stack Technologiczny

### Frontend
- **[Next.js 16](https://nextjs.org/)** — React framework z App Router
- **[TypeScript 5](https://www.typescriptlang.org/)** — silne typowanie
- **[TailwindCSS 4](https://tailwindcss.com/)** — utility-first CSS
- **[React 19](https://react.dev/)** — UI library
- **[next-themes](https://github.com/pacocoursey/next-themes)** — dark/light mode
- **[react-qr-code](https://github.com/rosskhanas/react-qr-code)** — generowanie QR kodów

### Backend / Baza Danych
- **[Supabase](https://supabase.com/)** — PostgreSQL + Row Level Security + REST API
- **[@supabase/ssr](https://github.com/supabase/ssr)** — integracja SSR z Next.js
- **[Django](https://www.djangoproject.com/)** — backend Python (OCR, biometria twarzy)
- **[EasyOCR](https://github.com/JaidedAI/EasyOCR)** — rozpoznawanie tekstu z legitymacji
- **[InsightFace](https://github.com/deepinsight/insightface)** — rozpoznawanie twarzy

### Rate Limiting
- **[@upstash/ratelimit](https://github.com/upstash/ratelimit)** + **[@upstash/redis](https://github.com/upstash/redis)** — ochrona API przed nadużyciami

---

## 🚀 Uruchomienie

### Wymagania
- Node.js 18+
- Python 3.12+
- Konto Supabase

### 1. Zmienne środowiskowe

Stwórz plik `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
```

### 2. Instalacja i uruchomienie frontendu
```bash
npm install
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:3000`

### 3. Backend Django (OCR/biometria)
```bash
cd z_app
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

Aby udostępnić backend zewnętrznie, użyj **ngrok**:
```bash
ngrok http 8000
```

---

## 🗄️ Schemat Bazy Danych (Supabase)

| Tabela | Opis |
|--------|------|
| `users` | Użytkownicy (imię, nazwisko, klasa, rola) |
| `klasy` | Klasy szkolne (nazwa, profil, sala) |
| `olimpiady` | Olimpiady i konkursy |
| `olimpiady_uczestnicy` | Zapisy uczniów na olimpiady |
| `stypendia` | Oferty stypendialne |
| `stypendia_aplikacje` | Wnioski uczniów o stypendia |
| `glosowania` | Głosowania i petycje |
| `glosowania_glosy` | Oddane głosy |
| `ankiety` | Ankiety szkolne |
| `ankiety_wypelnienia` | Odpowiedzi na ankiety |
| `petycje` | Petycje |
| `petycje_podpisy` | Podpisy pod petycjami |
| `ogloszenia` | Ogłoszenia szkolne |

---

## 📁 Kluczowe komponenty

- **`PasekBoczny.tsx`** — Sidebar z linkami, awatarem użytkownika, przyciskiem wylogowania i trybem ciemnym
- **`ModalUstawien.tsx`** — Modal ustawień (motyw, debug login przez imię/nazwisko)
- **`ModalUczestnicy.tsx`** — Reużywalny modal listy uczestników (olimpiady/stypendia)
- **`ModalPotwierdzenia.tsx`** — Reużywalny dialog potwierdzenia usunięcia

---

## 🔮 Planowane Usprawnienia

- [ ] Interaktywna mapa szkoły z nawigacją po budynku
- [ ] Aplikacja mobilna (iOS / Android)
- [ ] Ogólne poprawki UX i rozbudowa istniejących funkcji
- [ ] Nowe moduły rozszerzające możliwości platformy

---

## 👨‍💻 Autorzy

**Sebastian Dzięcielski** & **Michał Czarnek**

---

> *Projekt konkursowy — Złota Appka*
