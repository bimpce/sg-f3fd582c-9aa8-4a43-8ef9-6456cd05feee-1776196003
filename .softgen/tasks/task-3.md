---
title: User flow scenariji
status: done
priority: high
type: feature
tags: [dokumentacija, ux, flows]
created_by: agent
created_at: 2026-04-14T15:26:04Z
position: 3
---

## Notes
Opis uporabniške izkušnje (User Flow) za ključne scenarije: otrok poskuša dodati opomnik brez dovoljenja, starš dodaja zasebni dogodek, Super-Admin upravlja pravice. Vključuje korake, UI states, error handling.

## Checklist
- [x] Flow 1: Otrok poskuša dodati nov opomnik (nima CAN_CREATE_EVENT pravice)
- [x] Flow 2: Starš ustvarja zasebni "Samo za starše" dogodek
- [x] Flow 3: Super-Admin spreminja pravice člana preko toggle switches
- [x] Flow 4: Uvabljanje novega člana preko unikatne kode