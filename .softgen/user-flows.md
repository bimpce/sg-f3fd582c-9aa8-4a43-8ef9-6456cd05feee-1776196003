# FamilySync - User Flow Scenariji

## Flow 1: Otrok poskuša dodati nov opomnik (nima CAN_CREATE_EVENT pravice)

### Izhodiščno stanje:
- Uporabnik: Matej Novak (role: child)
- Pravice: `can_create_event = false`

### Koraki:

1. **Matej odpre aplikacijo** → Vidi spodnjo navigacijo (Koledar, Naloge, Obvestila, Profil)

2. **Klikne na veliki centralni "+" gumb**
   - UI: Odpre se modalni obrazec "Dodaj novo"
   - Možnosti: "Dogodek" ali "Naloga"

3. **Izbere "Dogodek"**
   - UI: Prikaže se obrazec z polji:
     * Naslov dogodka
     * Opis
     * Datum in čas
     * Kategorija (dropdown)
     * Vidnost (radio buttons: "Vsi člani" / "Samo starši")

4. **Izpolni obrazec**
   - Naslov: "Nogometni trening"
   - Datum: 2026-04-18, 16:00
   - Vidnost: "Vsi člani"

5. **Klikne gumb "Shrani"**
   - Frontend preveri pravice (lahko prek lokalno cache-anih permissions ali API call)
   - **ZAZNA: `can_create_event = false`**

6. **UI reakcija:**
   - Obrazec se NE shrani
   - Prikaže se alert/toast obvestilo:
     ```
     ⚠️ Nimaš dovoljenja za dodajanje dogodkov
     Prosi starše, da ti omogočijo to pravico v nastavitvah.
     ```
   - Opcijsko: Gumb "Prosi starše" → odpre predpripravljeno sporočilo v obvestilih za starše

7. **Matej zapre obrazec** → Vrne se na glavno stran

### Alternativni flow (če želimo bolj proaktiven pristop):
- Ko Matej klikne "+", frontend TAKOJ preveri pravice
- Če nima `can_create_event`, gumb "Dogodek" je disabled (siv) z tooltip: "Zahteva dovoljenje starša"
- Omogočena je samo opcija "Naloga" (če ima to pravico)

---

## Flow 2: Starš ustvarja zasebni "Samo za starše" dogodek

### Izhodiščno stanje:
- Uporabnik: Ana Novak (role: parent)
- Pravice: Privzete parent pravice (lahko ustvarja dogodke)

### Koraki:

1. **Ana klikne na "+" gumb** → Modalni obrazec "Dodaj novo"

2. **Izbere "Dogodek"**

3. **Izpolni obrazec:**
   - Naslov: "Sestanek s šolsko pedagoginjo"
   - Opis: "Pogovor o Matejevem napredku"
   - Datum: 2026-04-22, 14:00
   - Kategorija: "Šola"
   - **Vidnost: "Samo starši"** ← KRITIČNA izbira

4. **UI poudari izbiro vidnosti:**
   - Radio button "Samo starši" ima ikono 🔒
   - Pod njim je opozorilni tekst: "Otroci tega dogodka ne bodo videli v koledarju"

5. **Klikne "Shrani"**
   - Frontend pošlje POST /api/v1/events z `visibility_level: "parents"`
   - Backend validira, da ima Ana `can_create_event` pravico
   - Dogodek se shrani v bazo

6. **UI odziv:**
   - Uspešno obvestilo: "Dogodek dodan ✓"
   - Ana vidi dogodek v svojem koledarju (označen z 🔒 ikono)
   - **Matej (otrok) tega dogodka NE vidi** - backend ga filtrira pri GET /events

7. **Preverjanje vidnosti:**
   - Ana gre v koledar → vidi "Sestanek s šolsko pedagoginjo" z 🔒
   - Matej gre v koledar → ta dogodek ni viden (backend filtrira WHERE visibility_level = 'all' OR user.role IN ('parent', 'super_admin'))

---

## Flow 3: Super-Admin spreminja pravice člana preko toggle switches

### Izhodiščno stanje:
- Uporabnik: Ana Novak (role: super_admin)
- Cilj: Omogočiti Mateju (child) pravico do ustvarjanja dogodkov

### Koraki:

1. **Ana odpre "Profil" tab** v spodnjem meniju

2. **Klikne na "Družinski člani"** (Family Members)
   - UI: Lista vseh članov z njihovimi avatarji in vlogami
   - Matej Novak (Otrok) 🔵

3. **Klikne na Mateja** → Odpre se ekran "Upravljanje pravic"

4. **UI prikaz:**
   - Matejeva slika in ime na vrhu
   - Seznam toggle switches (ON/OFF):
     ```
     ☑️ Lahko ustvarja dogodke (CAN_CREATE_EVENT)
     ☐ Lahko ureja dogodke drugih (CAN_EDIT_OTHERS_EVENTS)
     ☐ Vidi zasebne dogodke staršev (CAN_SEE_PRIVATE)
     ☐ Lahko briše vsebino (CAN_DELETE)
     ☐ Lahko vabi nove člane (CAN_INVITE)
     ```
   - Vsak switch ima kratek opis pod njim

5. **Ana VKLOPI "Lahko ustvarja dogodke"**
   - Toggle switch se animira v ON pozicijo
   - Frontend TAKOJ pošlje PUT /api/v1/permissions/usr_def456
     ```json
     { "can_create_event": true }
     ```

6. **Backend odziv:**
   - Validira, da je Ana super_admin
   - Posodobi PERMISSION record za Mateja
   - Vrne posodobljene pravice

7. **UI reakcija:**
   - Pojavi se potrdilno obvestilo: "Pravice posodobljene ✓"
   - Ana klikne "Nazaj" → Vrne se na seznam članov

8. **Matej preveri nove pravice:**
   - Matej osvežitev aplikacije (ali realtime sync)
   - Zdaj lahko klikne "+" in izbere "Dogodek"
   - Obrazec se odpre in lahko SHRANI dogodek

---

## Flow 4: Uvabljanje novega člana preko unikatne kode

### Izhodiščno stanje:
- Uporabnik: Ana Novak (super_admin)
- Cilj: Dodati babico Marijo v družino

### Koraki:

1. **Ana gre v "Profil" → "Družinski člani"**

2. **Klikne gumb "Povabi člana" (+)**

3. **UI: Izbira načina povabila:**
   - **Opcija 1:** "Pošlji email povabilo"
     - Ana vpiše: marija@example.com
     - Izbere vlogo: "Starš" (dropdown)
     - Klikne "Pošlji"
     - Backend pošlje email z linkom: `app.familysync.com/invite?code=NVAK2026&email=marija@example.com`

   - **Opcija 2:** "Deli kodo"
     - UI pokaže: **NVAK2026**
     - Gumb "Kopiraj kodo"
     - Ana lahko to kodo deli ročno (SMS, WhatsApp)

4. **Marija prejme povabilo** (email ali koda)

5. **Marija odpre link ALI se registrira in vnese kodo:**
   - Če ima link → Obrazec je predizpolnjen z email in kodo
   - Če nima linka → Vpiše svojo email in kodo ročno

6. **Marija izpolni registracijo:**
   - Ime: "Marija Novak"
   - Geslo: "SecurePass456!"
   - **Koda družine: NVAK2026** (skrita ali predzložena)

7. **Klikne "Pridruži se družini"**
   - Frontend pošlje POST /auth/join-family
   - Backend validira kodo, ustvari USER record z `family_id`
   - Privzete pravice glede na vlogo (če je Parent → can_see_private = true)

8. **UI odziv:**
   - "Dobrodošla v Družina Novak! 🎉"
   - Marija vidi družinski koledar z vsemi dogodki (glede na visibility)

9. **Ana prejme obvestilo:**
   - "Marija Novak se je pridružila družini" (push notification)

---

## UI States in Error Handling

### Error States:

#### 1. Otrok poskuša dostopati do "Samo starši" vsebine
- **Trigger:** Otrok klikne na link, ki vodi do parent-only dogodka
- **Odziv:** 
  - 403 Forbidden error
  - UI: "Ta vsebina je zasebna 🔒"
  - Prikaže splošen koledar brez tega dogodka

#### 2. Napačna invite koda
- **Trigger:** Uporabnik vpiše napačno kodo pri registraciji
- **Odziv:**
  - 404 Not Found
  - UI: "Napačna koda družine. Preveri vnos ali prosi za novo kodo."

#### 3. Network failure pri shranjevanju dogodka
- **Trigger:** Izguba internetne povezave
- **Odziv:**
  - UI: Spinner se spremeni v error ikono
  - Toast: "Ni povezave. Poskusi znova."
  - Gumb "Poskusi znova"

### Loading States:

- Skeleton loaders za koledar med nalaganjem dogodkov
- Spinner pri shranjevanju/brisanju
- Disabled state za gumbe med API calls

### Success States:

- Green checkmark animacija pri uspešnih akcijah
- Toast obvestila z avtomatičnim zapiranjem (3 sekunde)
- Optimistic UI updates (dogodek se prikaže takoj, revert če API fail)