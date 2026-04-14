---
title: Upravljanje članov in pravic (Settings)
status: in_progress
priority: high
type: feature
tags: [settings, admin, permissions, ui]
created_by: agent
created_at: 2026-04-14T19:45:00Z
position: 9
---

## Notes
Implementacija administrativnega vmesnika za upravljanje družinskih članov. Stran omogoča spreminjanje vlog (Starš/Otrok) in natančno nastavljanje pravic (CAN_CREATE_EVENT, CAN_SEE_PRIVATE, itd.) za vsakega člana posebej. Dostop je omejen na Super-Admin in Parent vloge.

## Checklist
- [ ] Ustvari memberService.ts za CRUD operacije nad člani in pravicami
- [ ] Implementiraj stran /settings/members s seznamom vseh članov družine
- [ ] Dodaj Toggle switches za vsako posamezno pravico (CAN_...)
- [ ] Omogoči spreminjanje vloge (Role selector)
- [ ] Dodaj vizualno povratno informacijo (Toast) ob uspešni posodobitvi
- [ ] Omeji dostop do strani le za pooblaščene vloge