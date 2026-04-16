---
title: "Možnost Celotni dan za opomnike"
status: "done"
priority: "high"
type: "feature"
tags: ["reminders", "ui", "database"]
---

## Notes
Uporabnik želi pri vnosu opomnika možnost "celotni dan". To zahteva dodatek stikala (switch/checkbox) v obrazec, prilagoditev časa (skritje ure, če je izbrano "celotni dan") in posodobitev baze podatkov z novim stolpcem `is_all_day`. Prav tako moramo prilagoditi prikaz časa v koledarju in na dashboardu.

## Checklist
- [x] Preveri in posodobi bazo podatkov (dodaj `is_all_day` stolpec v `reminders`).
- [x] Posodobi obrazec v `reminders.tsx` (stikalo "Celotni dan" in skritje vnosa časa).
- [x] Posodobi shranjevanje opomnikov (nastavi čas na 00:00 - 23:59, če je cel dan).
- [x] Prilagodi prikaz časa na seznamu opomnikov (`reminders.tsx`).
- [x] Prilagodi prikaz časa v koledarju (`calendar.tsx`).
- [x] Prilagodi prikaz časa na nadzorni plošči (`index.tsx`).