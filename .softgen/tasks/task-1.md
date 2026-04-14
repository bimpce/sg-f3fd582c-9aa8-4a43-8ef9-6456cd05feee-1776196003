---
title: Arhitekturna dokumentacija in ER diagram
status: done
priority: urgent
type: feature
tags: [dokumentacija, arhitektura, baza]
created_by: agent
created_at: 2026-04-14T15:26:04Z
position: 1
---

## Notes
Priprava celotne arhitekturne dokumentacije za FamilySync aplikacijo, vključno z ER diagramom, strukturo podatkovne baze, relacijami med entitetami in JSON primeri objektov. Dokumentacija služi kot osnova za implementacijo backend logike.

## Checklist
- [x] Ustvari .softgen/architecture.md z ER diagramom (tekstovna reprezentacija)
- [x] Definicija entitet: Family, User, Event, Task, Permission
- [x] JSON struktura za Event objekt z visibility_level
- [x] Relacije med entitetami (one-to-many, many-to-many)
- [x] Opisi indeksov in constraint-ov