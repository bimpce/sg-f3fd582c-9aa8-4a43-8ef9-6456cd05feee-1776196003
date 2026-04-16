---
title: "Preimenovanje nalog v opomnike in nadgradnja kategorij"
status: "in_progress"
priority: "high"
type: "feature"
tags: ["reminders", "categories", "ui-update"]
created_by: "agent"
created_at: "2026-04-16"
position: 14
---

## Notes
Uporabnik želi celovito preimenovanje "nalog" v "opomnike" in razširitev funkcionalnosti:
- Naziv, časovni okvir (od-do z uro/minuto).
- Kategorije z barvami in pravicami vidnosti (starši/vsi).
- Prikaz barv v koledarju.

## Checklist
- [x] Posodobitev baze podatkov (tabele reminders, categories z barvami in visibility).
- [x] Preimenovanje strani `tasks.tsx` v `reminders.tsx` in posodobitev vseh referenc.
- [x] Posodobitev navigacije (BottomNav) in dashboarda.
- [x] Implementacija upravljanja kategorij (vnos naziva, barve in vidnosti).
- [x] Posodobitev servisa (supabaseService.ts).
- [x] Posodobitev obrazca za dodajanje opomnika (datumski razpon, ura, izbira kategorije).
- [x] Integracija barv kategorij v koledar.
- [x] Implementacija RLS logike za vidnost kategorij in opomnikov (starši vs vsi).
- [x] Testiranje celotnega toka.

---
Status: done