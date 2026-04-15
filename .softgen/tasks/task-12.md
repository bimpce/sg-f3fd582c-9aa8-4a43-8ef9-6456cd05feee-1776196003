---
title: Prenova nadzorne plošče (Dashboard) po načrtu
status: in_progress
priority: urgent
type: feature
tags: ["ui", "dashboard", "calendar"]
created_by: agent
created_at: 2024-04-15
position: 12
---

## Notes
Redesign the main index page to match the provided screenshot design and logic.

## Checklist
- [ ] Posodobitev `src/pages/index.tsx` z novim dizajnom glave (Avatar, Pozdrav, Vloga)
- [ ] Implementacija mesečnega koledarja v slovenščini
- [ ] Logika za prikaz "Naslednjega dogodka" ob nalaganju strani
- [ ] Logika za preklop med dnevnimi opomniki in naslednjim dogodkom ob kliku na koledar
- [ ] Posodobitev spodnje navigacije (`BottomNav.tsx`), da ustreza ikonom in napisom na sliki (Koledar, Naloge, Profil)
- [ ] Povezava s Supabase za pridobivanje dejanskih dogodkov/opomnikov