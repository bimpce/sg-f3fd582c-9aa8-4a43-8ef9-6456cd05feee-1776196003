# FamilySync - API Specifikacija

Base URL: `/api/v1`

Vse zahteve zahtevajo `Authorization: Bearer <jwt_token>` v headerju (razen Auth endpoints).

---

## 1. AVTENTIKACIJA

### POST /auth/register
**Opis:** Registracija Super-Admin uporabnika in kreacija nove družine  
**Request Body:**
```json
{
  "email": "ana@example.com",
  "password": "SecurePass123!",
  "name": "Ana Novak",
  "family_name": "Družina Novak"
}
```
**Response (201):**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "ana@example.com",
    "name": "Ana Novak",
    "role": "super_admin",
    "family_id": "fam_xyz789"
  },
  "family": {
    "id": "fam_xyz789",
    "name": "Družina Novak",
    "invite_code": "NVAK2026"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
**Opis:** Prijava uporabnika  
**Request Body:**
```json
{
  "email": "ana@example.com",
  "password": "SecurePass123!"
}
```
**Response (200):**
```json
{
  "user": { /* user objekt */ },
  "token": "eyJhbGci..."
}
```

### POST /auth/join-family
**Opis:** Pridružitev obstoječi družini preko invite code  
**Auth:** Bearer token (nov uporabnik, brez family_id)  
**Request Body:**
```json
{
  "invite_code": "NVAK2026",
  "role": "child"
}
```
**Response (200):**
```json
{
  "message": "Uspešno pridružen družini Novak",
  "family_id": "fam_xyz789"
}
```

---

## 2. UPRAVLJANJE DRUŽINE

### GET /family
**Opis:** Pridobi podatke o trenutni družini uporabnika  
**Response (200):**
```json
{
  "id": "fam_xyz789",
  "name": "Družina Novak",
  "invite_code": "NVAK2026",
  "members": [
    {
      "id": "usr_abc123",
      "name": "Ana Novak",
      "role": "super_admin",
      "color": "#FFB3C1"
    },
    {
      "id": "usr_def456",
      "name": "Matej Novak",
      "role": "child",
      "color": "#A3D9FF"
    }
  ]
}
```

### PUT /family
**Opis:** Posodobi ime družine (samo Super-Admin)  
**Auth:** Super-Admin  
**Request Body:**
```json
{
  "name": "Družina Novak-Kovač"
}
```

### POST /family/invite
**Opis:** Pošlji email povabilo novemu članu (zahteva CAN_INVITE permission)  
**Request Body:**
```json
{
  "email": "maja@example.com",
  "suggested_role": "parent"
}
```

### DELETE /family/members/:userId
**Opis:** Odstrani člana iz družine (samo Super-Admin)  
**Auth:** Super-Admin

---

## 3. DOGODKI (EVENTS)

### GET /events
**Opis:** Pridobi vse dogodke za trenutno družino (filtrirano po visibility)  
**Query params:**
- `start_date` (ISO string)
- `end_date` (ISO string)
- `visibility` (opcijsko: "all" ali "parents")

**Response (200):**
```json
{
  "events": [
    {
      "id": "evt_123",
      "title": "Obisk pri zobozdravniku",
      "start_time": "2026-04-16T15:00:00Z",
      "end_time": "2026-04-16T15:45:00Z",
      "visibility_level": "all",
      "created_by": {
        "id": "usr_abc123",
        "name": "Ana Novak",
        "color": "#FFB3C1"
      }
    }
  ]
}
```

### POST /events
**Opis:** Ustvari nov dogodek (zahteva CAN_CREATE_EVENT permission)  
**Request Body:**
```json
{
  "title": "Šolski sestanek",
  "description": "Govorilne ure",
  "start_time": "2026-04-20T17:00:00Z",
  "end_time": "2026-04-20T18:00:00Z",
  "visibility_level": "parents",
  "category": "šola",
  "reminder_minutes": 120
}
```
**Response (201):** Event objekt

### PUT /events/:id
**Opis:** Posodobi dogodek (CAN_EDIT_OTHERS_EVENTS če ni lastnik)  
**Request Body:** Enako kot POST

### DELETE /events/:id
**Opis:** Izbriši dogodek (zahteva CAN_DELETE permission)

---

## 4. NALOGE (TASKS)

### GET /tasks
**Opis:** Pridobi vse naloge  
**Query params:**
- `assigned_to` (opcijsko: user_id)
- `is_completed` (opcijsko: boolean)

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "tsk_789",
      "title": "Pospraviti sobo",
      "assigned_to": {
        "id": "usr_def456",
        "name": "Matej Novak"
      },
      "due_date": "2026-04-15T20:00:00Z",
      "is_completed": false,
      "visibility_level": "all"
    }
  ]
}
```

### POST /tasks
**Opis:** Ustvari novo nalogo  
**Request Body:**
```json
{
  "title": "Pospraviti sobo",
  "description": "Preden greš spat",
  "assigned_to": "usr_def456",
  "due_date": "2026-04-15T20:00:00Z",
  "visibility_level": "all"
}
```

### PATCH /tasks/:id/complete
**Opis:** Označi nalogo kot opravljeno  
**Response (200):**
```json
{
  "id": "tsk_789",
  "is_completed": true,
  "completed_by": "usr_def456",
  "completed_at": "2026-04-14T18:30:00Z"
}
```

---

## 5. PRAVICE (PERMISSIONS)

### GET /permissions/:userId
**Opis:** Pridobi pravice določenega uporabnika (samo starši/admin)  
**Response (200):**
```json
{
  "user_id": "usr_def456",
  "can_create_event": false,
  "can_edit_others_events": false,
  "can_see_private": false,
  "can_delete": false,
  "can_invite": false
}
```

### PUT /permissions/:userId
**Opis:** Posodobi pravice (samo Super-Admin)  
**Request Body:**
```json
{
  "can_create_event": true,
  "can_see_private": false
}
```

---

## 6. OBVESTILA (NOTIFICATIONS)

### GET /notifications
**Opis:** Pridobi obvestila trenutnega uporabnika  
**Query params:**
- `is_read` (opcijsko: boolean)

**Response (200):**
```json
{
  "notifications": [
    {
      "id": "ntf_456",
      "type": "event_reminder",
      "title": "Opomnik",
      "message": "Čez 1 uro: Obisk pri zobozdravniku",
      "is_read": false,
      "created_at": "2026-04-16T14:00:00Z"
    }
  ]
}
```

### PATCH /notifications/:id/read
**Opis:** Označi obvestilo kot prebrano

### POST /notifications/push
**Opis:** Backend service endpoint za pošiljanje push obvestil (interno)

---

## Error Responses

Vsi error-ji vrnejo standardizirano strukturo:

```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Nimaš dovoljenja za ustvarjanje dogodkov",
    "details": {}
  }
}
```

**Skupni error kodi:**
- `UNAUTHORIZED` (401)
- `PERMISSION_DENIED` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `SERVER_ERROR` (500)