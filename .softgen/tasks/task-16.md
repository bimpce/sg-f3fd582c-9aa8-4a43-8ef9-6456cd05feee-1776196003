---
title: "Možnost Celotni dan za opomnike"
status: "in_progress"
priority: "high"
type: "feature"
tags: ["reminders", "ui", "database"]
---

## Notes
Uporabnik želi pri vnosu opomnika možnost "celotni dan". To zahteva dodatek stikala (switch/checkbox) v obrazec, prilagoditev časa (skritje ure, če je izbrano "celotni dan") in posodobitev baze podatkov z novim stolpcem `is_all_day`. Prav tako moramo prilagoditi prikaz časa v koledarju in na dashboardu.

## Checklist
- [ ] Preveri in posodobi bazo podatkov (dodaj `is_all_day` stolpec v `reminders`).
- [ ] Posodobi obrazec v `reminders.tsx` (stikalo "Celotni dan" in skritje vnosa časa).
- [ ] Posodobi shranjevanje opomnikov (nastavi čas na 00:00 - 23:59, če je cel dan).
- [ ] Prilagodi prikaz časa na seznamu opomnikov (`reminders.tsx`).
- [ ] Prilagodi prikaz časa v koledarju (`calendar.tsx`).
- [ ] Prilagodi prikaz časa na nadzorni plošči (`index.tsx`).