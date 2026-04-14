# FamilySync - Arhitekturna Dokumentacija

## 1. ER Diagram (Entitete in Relacije)

```
┌─────────────────┐
│     FAMILY      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ invite_code     │ (unikaten, za povabila)
│ created_at      │
│ subscription    │ (tip plačila, če je potrebno)
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────────────┐
│         USER            │
├─────────────────────────┤
│ id (PK)                 │
│ family_id (FK)          │
│ email                   │
│ name                    │
│ role                    │ (enum: 'super_admin', 'parent', 'child')
│ color                   │ (pastelna barva za UI, hex)
│ avatar_url              │
│ created_at              │
└────────┬────────────────┘
         │
         │ 1:N (ustvarjalec)
         │
         ▼
┌──────────────────────────────┐
│           EVENT              │
├──────────────────────────────┤
│ id (PK)                      │
│ family_id (FK)               │
│ created_by (FK → User)       │
│ title                        │
│ description                  │
│ start_time                   │
│ end_time                     │
│ visibility_level             │ (enum: 'all', 'parents')
│ category                     │ (string: 'sestanek', 'šola', 'rojstni dan', itd.)
│ color_override               │ (opcijsko, če se razlikuje od user.color)
│ reminder_minutes             │ (koliko minut pred dogodkom poslati obvestilo)
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘

┌──────────────────────────────┐
│           TASK               │
├──────────────────────────────┤
│ id (PK)                      │
│ family_id (FK)               │
│ created_by (FK → User)       │
│ assigned_to (FK → User)      │ (opcijsko, komu je naloga dodeljena)
│ title                        │
│ description                  │
│ due_date                     │
│ is_completed                 │ (boolean)
│ completed_by (FK → User)     │ (kdo je označil kot opravljeno)
│ completed_at                 │
│ visibility_level             │ (enum: 'all', 'parents')
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘

┌──────────────────────────────┐
│        PERMISSION            │
├──────────────────────────────┤
│ id (PK)                      │
│ user_id (FK → User)          │
│ can_create_event             │ (boolean)
│ can_edit_others_events       │ (boolean)
│ can_see_private              │ (boolean)
│ can_delete                   │ (boolean)
│ can_invite                   │ (boolean)
│ updated_at                   │
└──────────────────────────────┘

┌──────────────────────────────┐
│       NOTIFICATION           │
├──────────────────────────────┤
│ id (PK)                      │
│ user_id (FK → User)          │
│ type                         │ (enum: 'event_reminder', 'task_assigned', 'invitation')
│ title                        │
│ message                      │
│ related_event_id (FK)        │ (opcijsko)
│ related_task_id (FK)         │ (opcijsko)
│ is_read                      │ (boolean)
│ created_at                   │
└──────────────────────────────┘
```

### Relacije:
- **FAMILY ↔ USER**: 1:N (ena družina, več uporabnikov)
- **USER ↔ EVENT**: 1:N (en uporabnik ustvari več dogodkov)
- **USER ↔ TASK**: 1:N za created_by in assigned_to
- **USER ↔ PERMISSION**: 1:1 (vsak uporabnik ima en Permission record)
- **USER ↔ NOTIFICATION**: 1:N (en uporabnik dobi več obvestil)

---

## 2. JSON Struktura za "EVENT" Objekt

```json
{
  "id": "evt_abc123xyz",
  "family_id": "fam_789def",
  "created_by": {
    "id": "usr_456ghi",
    "name": "Ana Novak",
    "color": "#FFB3C1"
  },
  "title": "Obisk pri zobozdravniku",
  "description": "Matej mora na kontrolo ob 15:00",
  "start_time": "2026-04-16T15:00:00Z",
  "end_time": "2026-04-16T15:45:00Z",
  "visibility_level": "all",
  "category": "zdravje",
  "color_override": null,
  "reminder_minutes": 60,
  "created_at": "2026-04-14T10:30:00Z",
  "updated_at": "2026-04-14T10:30:00Z"
}
```

**Razlaga polj:**
- `visibility_level`: `"all"` (vsi člani vidijo) ali `"parents"` (samo starši)
- `reminder_minutes`: Push obvestilo X minut pred start_time
- `color_override`: Če je null, uporabi `created_by.color`

---

## 3. Logika Avtentikacije in Family ID

### Proces registracije:
1. **Super-Admin** registrira družinski račun → ustvari FAMILY record z unikatno `invite_code`
2. Super-Admin dobi `role = 'super_admin'` in je povezan z `family_id`
3. Ostali člani se pridružijo preko:
   - Vnos `invite_code` ob registraciji ALI
   - E-mail povabilo z enkratnim linkom (`/invite?code=XYZ&email=...`)

### Avtentikacijski flow:
```
1. Uporabnik se prijavi (email + password)
2. Server preveri credentials in vrne JWT token
3. JWT vsebuje: user_id, family_id, role
4. Vsaka zahteva na API vključuje Authorization: Bearer <token>
5. Middleware validira token in izpostavi user_id + family_id
6. Vsi dogodki/naloge se filtrirajo po family_id (RLS - Row Level Security)
```

### Predlagana baza podatkov:
**PostgreSQL** (z Row Level Security policies):
- Omogoča kompleksne relacije in query-je
- RLS policies zagotavljajo, da uporabnik vidi samo svoje family_id podatke
- Podpora za enum types (visibility_level, role)

**Alternativa: Supabase** (PostgreSQL backend + Auth):
- Vgrajena avtentikacija, RLS policies, realtime subscriptions
- Idealno za hitro implementacijo

---

## 4. Indeksi in Constraint-i

```sql
-- FAMILY
CREATE UNIQUE INDEX idx_family_invite_code ON family(invite_code);

-- USER
CREATE INDEX idx_user_family_id ON user(family_id);
CREATE UNIQUE INDEX idx_user_email ON user(email);

-- EVENT
CREATE INDEX idx_event_family_id ON event(family_id);
CREATE INDEX idx_event_start_time ON event(start_time);
CREATE INDEX idx_event_visibility ON event(visibility_level);

-- TASK
CREATE INDEX idx_task_family_id ON task(family_id);
CREATE INDEX idx_task_assigned_to ON task(assigned_to);
CREATE INDEX idx_task_due_date ON task(due_date);

-- PERMISSION
CREATE UNIQUE INDEX idx_permission_user_id ON permission(user_id);
```

**Foreign Key Constraints:**
- `user.family_id → family.id (ON DELETE CASCADE)`
- `event.created_by → user.id (ON DELETE SET NULL)`
- `permission.user_id → user.id (ON DELETE CASCADE)`