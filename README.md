# 🏋️ InnTime v3.0

Eine moderne, mobile-optimierte Full-Stack Anwendung zur Zeiterfassung für Fitnessstudios. Entwickelt für **Fit-Inn Heldenbergen**, optimiert für Smartphones, Tablets und Desktop.

![License](https://img.shields.io/badge/License-Proprietary-red.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

---

## 🌟 Highlights

*   **Mobile-First Design:** Große Touch-Targets und intuitive Bedienung für Mitarbeiter unterwegs.
*   **Admin Power:** Vollständiges Dashboard zur Verwaltung von Mitarbeitern, Arbeitszeiten und Lohnabrechnungen.
*   **Ready-to-Go:** Lokale SQLite-Datenbank – keine komplexe Server-Einrichtung nötig.
*   **Datenschutz:** Alle Daten bleiben lokal in deinem Studio-Netzwerk.

---

## ✨ Features

### 👤 Für Mitarbeiter (Zeiterfassung)
*   **Einfacher Login:** Mitarbeiterauswahl per Dropdown (keine Passwörter nötig für schnelle Erfassung).
*   **Quick-Actions:** "Start jetzt" / "Ende jetzt" mit einem Klick.
*   **Monatsübersicht:** Transparente Einsicht in alle geleisteten Stunden des aktuellen Monats.
*   **Fehlerkorrektur:** Bearbeitung von Einträgen direkt in der App möglich.
*   **Toast-Feedback:** Sofortige Bestätigung bei jeder Aktion.

### 📊 Für den Admin (Philipp)
*   **Employee Management (CRUD):** Mitarbeiter hinzufügen, bearbeiten oder löschen.
*   **Intelligente Reports:** Monatliche Übersicht aller Stunden mit automatischer Summenbildung.
*   **Lohn-Dashboard:** Unterstützung für Stundenlohn und Festgehalt mit automatischer Verdienstberechnung.
*   **Export-Funktion:** CSV-Download für Excel oder Google Sheets.
*   **Daten-Import:** Batch-Import von Mitarbeitern und Lohnhistorien via CSV.
*   **Flexibilität:** Sortierung nach Name, Stunden, Verdienst oder Lohn.

---

## 🛠 Tech Stack

| Komponente | Technologie |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Datenbank** | SQLite3 |
| **Utilities** | Date-fns (Datumshandling), Lucide Icons |

---

---
## 🚀 Installation & Setup

### Voraussetzungen
[Node.js](https://nodejs.org/) muss installiert sein.

### Lokal starten

```bash
# Backend installieren & starten
npm install
npm start

# Frontend (Dev-Modus, separates Terminal)
cd client && npm install && npm run dev
```

### Frontend-Build erstellen (für Produktion)

```bash
# Im InnTime/-Ordner:
npm run build
```

Danach reicht `npm start` — der Express-Server liefert das gebaute Frontend aus.

---

## 🌐 Deployment auf Hostinger

### 1. Einmalig: Frontend bauen & Git aufsetzen

```bash
npm run build          # erstellt client/dist/
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DEIN_USERNAME/inntime.git
git push -u origin main
```

> `.env` und `data/*.db` werden durch `.gitignore` **nicht** gepusht.

### 2. Hostinger hPanel konfigurieren

| Einstellung | Wert |
| :--- | :--- |
| **Node.js Version** | 18+ |
| **Build-Befehl** | `npm run build` |
| **Start-Befehl** | `node src/server.js` |
| **GitHub Auto-Deploy** | aktivieren |

### 3. Updates deployen

```bash
npm run build          # wenn Frontend geändert
git add .
git commit -m "Update"
git push               # Hostinger deployt automatisch
```

**Hostinger Business übernimmt automatisch:** SSL, CDN, WAF (Bot-/Brute-Force-Schutz), DDoS-Schutz, Auto-Restart.

---

## 💻 Betrieb & Nutzung

Nachdem der Build erstellt wurde:

1. **Server starten:** `npm start`
2. Öffne **[http://localhost:3000](http://localhost:3000)** im Browser.

Im WLAN erreichbar über die IP des Rechners, z.B. `http://192.168.178.20:3000`.

---

## ⚙️ Konfiguration & Sicherheit

*   **Admin-Passwort:** Standard `fitinn2024` – nach erstem Login im Admin-Dashboard ändern.
*   **Mitarbeiter-Passwort:** Standard `mitarbeiter2024` – im Admin-Dashboard unter "Mitarbeiter-PW" ändern.
*   Passwörter werden **gehasht** gespeichert (niemals im Klartext in DB oder Code).
*   **JWT-Secret** wird beim ersten Start zufällig generiert und in der DB gespeichert.
*   **Ports:** Standard `3000` (Prod) und `5173` (Frontend-Dev).

---

## 🗂 Projektstruktur

```text
InnTime/
├── src/                  # Backend Quellcode
├── client/               # Frontend (React App)
├── data/                 # Speicherort der SQLite Datenbank
├── README.md             # Diese Dokumentation
└── package.json          # Root/Backend Abhängigkeiten
```

---

## 📑 Lizenz & Support

Erstellt für **Fit-Inn Heldenbergen**.

**Support:** Bei Fragen wende dich direkt an Philipp.

---
**Version:** 3.0.0 | **Stand:** Februar 2026
