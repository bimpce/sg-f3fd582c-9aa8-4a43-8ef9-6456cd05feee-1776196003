---
title: Profil uporabnika in osebne nastavitve
status: done
priority: medium
type: feature
tags: [profile, settings, user]
created_by: agent
created_at: 2026-04-15T06:20:00Z
position: 10
---

## Notes
Implementacija osebne profilne strani za uporabnika (`/profile`). Stran mora omogočati pregled osebnih podatkov (ime, email, vloga), urejanje imena ter odjavo iz sistema.

## Checklist
- [x] Dodaj metodo `updateProfile` v `supabaseService.ts`
- [x] Ustvari stran `src/pages/profile.tsx`
- [x] Prikaz uporabnikovih podatkov (Avatar, Ime, Email, Vloga)
- [x] Obrazec za posodobitev uporabnikovega imena
- [x] Dodaj gumb za varno odjavo (Sign Out)
- [x] Poveži z navigacijo (BottomNav in Header)