---
title: "Upravljanje kategorij na ločeni strani"
status: "done"
priority: "high"
type: "feature"
tags: ["categories", "ui", "crud"]
---

## Notes
Uporabnik želi ločeno stran za upravljanje kategorij namesto modalnega okna na strani opomnikov.
Stran mora omogočati pregled, dodajanje, urejanje in brisanje kategorij.

## Checklist
- [x] Posodobitev `supabaseService.ts` z metodo `updateCategory`.
- [x] Sprememba gumba "Kategorije" v `reminders.tsx`, da preusmeri na `/categories`.
- [x] Odstranitev modalnega okna za ustvarjanje kategorije iz `reminders.tsx`.
- [x] Ustvarjanje nove datoteke `categories.tsx`.
- [x] Implementacija seznama kategorij v `categories.tsx`.
- [x] Implementacija obrazca za dodajanje in urejanje kategorij v `categories.tsx`.
- [x] Preverjanje napak in testiranje.