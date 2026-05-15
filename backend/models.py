from django.db import models

class Dokument(models.Model):
    nazwa_pliku = models.CharField(max_length=255)
    data_dodania = models.DateTimeField(auto_now_add=True)
    czy_zdjecie = models.BooleanField(default=False)

    def __str__(self):
        typ = "Zdjęcie" if self.czy_zdjecie else "Plik"
        return f"{typ}: {self.nazwa_pliku} ({self.data_dodania})"
