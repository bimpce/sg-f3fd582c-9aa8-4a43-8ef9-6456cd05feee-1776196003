---
title: "Posodobitev ikon v navigaciji"
status: done
priority: medium
type: chore
tags:
  - ui
  - navigation
created_by: agent
created_at: 2026-04-17T09:45:00Z
position: 18
---
## Notes
Uporabnik želi prilagoditi izgled ikon v spodnji navigacijski vrstici (BottomNav) na podlagi priložene slike. Trenutne ikone so prevelike (`w-8 h-8`) in besedilo je preveč poudarjeno (`font-bold`). Cilj je uravnotežiti razmerje med ikono in besedilom.

## Checklist
- [x] Odpri `src/components/BottomNav.tsx`
- [x] Zmanjšaj velikost ikon iz `w-8 h-8` na `w-6 h-6` (ali `w-7 h-7`)
- [x] Prilagodi debelino črt (`stroke-width`) - npr. ohrani ali malce zmanjšaj `stroke-[2.5px]` za aktivne ikone, da ne bodo pretežke
- [x] Spremeni debelino besedila pod ikonami iz `font-bold` v `font-medium`
- [x] Prepričaj se, da se barve ujemajo z referenco (aktivna `text-primary`, neaktivne `text-muted-foreground`)