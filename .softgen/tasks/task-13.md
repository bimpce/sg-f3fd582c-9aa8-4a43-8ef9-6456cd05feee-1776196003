---
title: Nadgradnja nalog v pametne Opomnike s kategorijami
status: completed
priority: urgent
type: feature
tags: ["database", "reminders", "categories"]
created_by: agent
created_at: 2024-04-15
position: 13
---

## Notes
Transform generic tasks into detailed family reminders with categories, colors, and privacy settings.

## Checklist
- [x] Ustvarjanje tabel `categories` in `reminders` v Supabase
- [x] Implementacija RLS pravil za zasebnost (vidnost: starši/vsi)
- [x] Posodobitev `supabaseService.ts` za delo s kategorijami in opomniki
- [x] Prenova strani `tasks.tsx` v `reminders.tsx` (ali preimenovanje vmesnika)
- [x] Implementacija obrazca za dodajanje opomnika (Od-Do, Kategorija)
- [x] Povezava kategorij z barvami v koledarju na začetni strani