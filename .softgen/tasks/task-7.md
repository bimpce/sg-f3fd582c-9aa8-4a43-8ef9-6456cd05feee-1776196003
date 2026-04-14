---
title: Ustvari Supabase tabele (families, profiles, events, tasks, permissions)
status: in_progress
priority: urgent
type: feature
tags: [supabase, database, sql]
created_by: agent
created_at: 2026-04-14T15:55:12Z
position: 7
---

## Notes
Ustvarjanje tabel v Supabase po ER diagramu: families, profiles (users), events, tasks, permissions. SQL migration skripti z ustreznimi constraints, indeksi in RLS (Row Level Security) policies. SQL skripte so v .softgen/supabase-migrations/ in se morajo izvesti v Supabase Dashboardu (SQL Editor).

## Checklist
- [x] Ustvari SQL skripte za families in profiles tabele
- [x] Ustvari SQL skripte za events, tasks in permissions tabele
- [x] Ustvari RLS (Row Level Security) policies za varnost
- [x] Ustvari Supabase service za povezavo z bazo
- [ ] Posodobi NextAuth za povezavo z Supabase (verificacija z bazo)
- [ ] Testiraj povezavo in shranjevanje podatkov
