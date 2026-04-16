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
- [ ] Posodobitev baze podatkov (tabele reminders, categories z barvami in visibility).
- [ ] Preimenovanje strani `tasks.tsx` v `reminders.tsx` in posodobitev vseh referenc.
- [ ] Posodobitev navigacije (BottomNav) in dashboarda.
- [ ] Implementacija upravljanja kategorij (vnos naziva, barve in vidnosti).
- [ ] Posodobitev obrazca za dodajanje opomnika (datumski razpon, ura, izbira kategorije).
- [ ] Integracija barv kategorij v koledar.
- [ ] Implementacija RLS logike za vidnost kategorij in opomnikov (starši vs vsi).
- [ ] Testiranje celotnega toka.