---
title: API specifikacija (endpoints)
status: done
priority: urgent
type: feature
tags: [dokumentacija, api, backend]
created_by: agent
created_at: 2026-04-14T15:26:04Z
position: 2
---

## Notes
Podroben seznam vseh API končnih točk za FamilySync aplikacijo. Vključuje avtentikacijo, upravljanje z družinami, dogodki, nalogami in pravicami. Za vsako končno točko: HTTP metoda, pot, request/response struktura, avtentikacijske zahteve.

## Checklist
- [x] Auth endpoints (registracija, prijava, invite system)
- [x] Family management (create, update, invite members)
- [x] Events CRUD (create, read, update, delete z visibility kontrolo)
- [x] Tasks CRUD (z označevanjem kot opravljeno)
- [x] Permissions management (toggle pravice za člane)
- [x] Notifications endpoints (push, inbox)