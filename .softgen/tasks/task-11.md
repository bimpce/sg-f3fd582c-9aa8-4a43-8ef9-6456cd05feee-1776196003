---
title: Sistem nalog in opravil (Tasks)
status: in_progress
priority: high
type: feature
tags: [tasks, ui, database]
created_by: agent
created_at: 2026-04-15T09:00:00Z
position: 11
---

## Notes
Aplikacija potrebuje sistem za upravljanje družinskih opravil. Naloge se lahko dodelijo specifičnim članom in označijo kot opravljene.

## Checklist
- [ ] Dodaj CRUD metode za naloge v `supabaseService.ts`
- [ ] Ustvari stran `src/pages/tasks.tsx`
- [ ] Prikaz seznama nalog (ločeno na "V teku" in "Opravljeno")
- [ ] Obrazec (Dialog) za dodajanje nove naloge z možnostjo dodelitve članu
- [ ] Implementiraj Checkbox za označevanje naloge kot opravljene
- [ ] Poveži z `BottomNav.tsx`