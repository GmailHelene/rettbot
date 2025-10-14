# 🚀 Deploy RettBot+ til rettbot.com - STEG-FOR-STEG

**Din GitHub:** GmailHelene  
**Ditt domene:** rettbot.com

---

## ✅ STEG 1: Opprett GitHub Repository (2 minutter)

1. **Gå til:** https://github.com/new
2. **Repository name:** `rettbot`
3. **Beskrivelse:** "RettBot+ - AI-powered legal assistant for Norwegian citizens"
4. **Velg:** 🔒 **Private** (anbefalt - beskytter din kode)
5. **IKKE** huk av for "Add a README file"
6. **Klikk:** "Create repository"

✅ **Repository URL blir:** `https://github.com/GmailHelene/rettbot`

---

## ✅ STEG 2: Push Kode til GitHub (3 minutter)

**Åpne PowerShell i mappen:** `C:\Users\helen\AI-advokaten`

Kopier og kjør disse kommandoene **EN OM GANGEN**:

### Kommando 1: Initialiser Git
```powershell
git init
```
**Forventet output:** `Initialized empty Git repository in C:/Users/helen/AI-advokaten/.git/`

---

### Kommando 2: Legg til alle filer
```powershell
git add .
```
**Forventet output:** (ingen output = suksess)

---

### Kommando 3: Sjekk hva som blir commitet
```powershell
git status
```
**VIKTIG:** Sjekk at `.env` **IKKE** er i listen! (Den skal være ignorert)

---

### Kommando 4: Commit koden
```powershell
git commit -m "RettBot+ v1.0 - Production ready for rettbot.com"
```
**Forventet output:** Liste over filer som ble commitet

---

### Kommando 5: Koble til GitHub
```powershell
git remote add origin https://github.com/GmailHelene/rettbot.git
```
**Forventet output:** (ingen output = suksess)

---

### Kommando 6: Set default branch til main
```powershell
git branch -M main
```
**Forventet output:** (ingen output = suksess)

---

### Kommando 7: Push til GitHub
```powershell
git push -u origin main
```

**HVIS DET SPØR OM AUTENTISERING:**

Du trenger et **Personal Access Token** (ikke ditt vanlige passord).

#### Slik får du token:

1. Gå til: https://github.com/settings/tokens
2. Klikk "Generate new token" → "Generate new token (classic)"
3. **Note:** "RettBot deployment"
4. **Expiration:** "90 days" (eller lengre)
5. **Huk av:** ✅ `repo` (full control of private repositories)
6. Scroll ned og klikk "Generate token"
7. **KOPIER TOKENET** (du ser det bare én gang!)

#### Bruk token som passord:
```
Username: GmailHelene
Password: [paste ditt token her]
```

---

## ✅ STEG 3: Verifiser på GitHub (1 minutt)

1. Gå til: https://github.com/GmailHelene/rettbot
2. Sjekk at du ser alle filene dine
3. **VIKTIG:** Verifiser at `.env` **IKKE** er der (beskyttet av .gitignore)

---

## ✅ STEG 4: Deploy til Railway (5 minutter)

### 4.1: Opprett Railway Account

1. Gå til: https://railway.app
2. Klikk "Login" → "Login with GitHub"
3. Autoriser Railway til å aksessere din GitHub

---

### 4.2: Opprett Nytt Prosjekt

1. Klikk **"New Project"**
2. Velg **"Deploy from GitHub repo"**
3. Velg **`GmailHelene/rettbot`** fra listen
4. Railway begynner å bygge (dette tar 2-3 minutter)

**FØRSTE BUILD VIL FEILE** - Dette er normalt! Vi må legge til environment variables.

---

## ✅ STEG 5: Legg til Environment Variables (3 minutter)

### 5.1: Generer Sikre Nøkler

I PowerShell, kjør disse to kommandoene:

```powershell
# Generer SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
**KOPIER OUTPUTTET** - Dette er din SECRET_KEY

```powershell
# Generer JWT_SECRET
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
**KOPIER OUTPUTTET** - Dette er din JWT_SECRET

---

### 5.2: Legg til Variables i Railway

1. I Railway dashboard, klikk på ditt prosjekt
2. Gå til **"Variables"** tab
3. Klikk **"Raw Editor"**
4. **Lim inn dette** (erstatt de to nøklene med de du genererte):

```env
OPENAI_API_KEY=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
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=DIN_GENERERTE_SECRET_KEY_HER
JWT_SECRET=DIN_GENERERTE_JWT_SECRET_HER
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=https://rettbot.com,https://www.rettbot.com
DOMAIN=rettbot.com
PROTOCOL=https
OPENTIMESTAMPS_ENABLED=true
```

5. Klikk **"Update variables"**
6. Railway vil automatisk **redeploy** (tar 2-3 minutter)

---

## ✅ STEG 6: Test Railway URL (2 minutter)

### 6.1: Få Railway URL

1. I Railway dashboard → **"Settings"** tab
2. Under "Domains" → Klikk **"Generate Domain"**
3. Du får en URL som: `rettbot-production-abcd.up.railway.app`

---

### 6.2: Test API

**Åpne i nettleser:**
```
https://rettbot-production-XXXX.up.railway.app/api/health
```

**Du skal se:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "services": {
    "openai": true,
    "api": true
  },
  "version": "1.0.0"
}
```

✅ **Hvis du ser dette, fungerer backend!**

---

## ✅ STEG 7: Koble til rettbot.com (5 minutter)

### 7.1: Legg til Custom Domain i Railway

1. I Railway → **"Settings"** → **"Domains"**
2. Klikk **"Custom Domain"**
3. Skriv inn: `rettbot.com`
4. Klikk **"Add"**
5. Railway viser deg DNS records

**Eksempel:**
```
Type: A
Name: @
Value: 123.45.67.89
```

**SKRIV NED DENNE IP-ADRESSEN!**

---

### 7.2: Oppdater DNS i Domeneshop

1. Logg inn på: https://www.domeneshop.no
2. Gå til **"Mine tjenester"** → **"Domener"**
3. Klikk på **rettbot.com**
4. Gå til **"DNS"** fanen
5. **Slett** eventuelle eksisterende A-records
6. **Legg til ny A-record:**
   - Type: `A`
   - Host: `@`
   - TTL: `3600`
   - Data: `[Railway IP fra steg 7.1]`
7. **Legg til en til A-record for www:**
   - Type: `A`
   - Host: `www`
   - TTL: `3600`
   - Data: `[samme Railway IP]`
8. Klikk **"Lagre"**

---

### 7.3: Vent på DNS (5-60 minutter)

DNS tar tid å oppdatere (vanligvis 5-30 minutter, noen ganger opptil 24 timer).

**Sjekk status:**
```powershell
nslookup rettbot.com
```

**Når det fungerer, ser du Railway IP i outputtet.**

---

## ✅ STEG 8: Verifiser at alt fungerer! 🎉

### Test rettbot.com

**Åpne i nettleser:**
```
https://rettbot.com/api/health
```

**Du skal se:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "services": {
    "openai": true,
    "api": true
  },
  "version": "1.0.0"
}
```

---

### Test AI Endpoints

**Test Legal Research:**
```powershell
curl -X POST https://rettbot.com/api/legal/research `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"Kan politiet ransake mobilen min uten kjennelse?\"}'
```

**Du skal få et AI-generert svar med norske lover! 🤖**

---

## 🎉 GRATULERER!

**✅ rettbot.com er nå LIVE med full AI-backend!**

Neste steg:
- FASE 2: Bygg Minimal UI (30-60 min)
- FASE 3: Deploy UI Update (5 min)
- FASE 4: Komplett UI (1-2 timer)
- FASE 5: PWA Features (30 min)

---

## 🆘 Feilsøking

### Problem: "Permission denied" ved git push
**Løsning:** Bruk Personal Access Token som passord (ikke ditt GitHub passord)

### Problem: Railway build feiler
**Løsning:** 
1. Sjekk Railway logs for feilmelding
2. Verifiser at alle environment variables er satt
3. Sjekk at OPENAI_API_KEY er korrekt

### Problem: DNS resolves ikke
**Løsning:**
1. Vent 24 timer
2. Sjekk DNS med: `nslookup rettbot.com`
3. Clear DNS cache: `ipconfig /flushdns`

---

**Neste: Når alt over fungerer, fortsetter vi med FASE 2: Bygg UI! 🚀**
