---
title: Nadgradnja nalog v pametne Opomnike s kategorijami
status: in_progress
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
- [ ] Ustvarjanje tabel `categories` in `reminders` v Supabase
- [ ] Implementacija RLS pravil za zasebnost (vidnost: starši/vsi)
- [ ] Posodobitev `supabaseService.ts` za delo s kategorijami in opomniki
- [ ] Prenova strani `tasks.tsx` v `reminders.tsx` (ali preimenovanje vmesnika)
- [ ] Implementacija obrazca za dodajanje opomnika (Od-Do, Kategorija)
- [ ] Povezava kategorij z barvami v koledarju na začetni strani