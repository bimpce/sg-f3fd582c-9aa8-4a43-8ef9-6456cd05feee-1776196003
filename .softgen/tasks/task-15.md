---
title: "Upravljanje kategorij na ločeni strani"
status: "in_progress"
priority: "high"
type: "feature"
tags: ["categories", "ui", "crud"]
---

## Notes
Uporabnik želi ločeno stran za upravljanje kategorij namesto modalnega okna na strani opomnikov.
Stran mora omogočati pregled, dodajanje, urejanje in brisanje kategorij.

## Checklist
- [ ] Posodobitev `supabaseService.ts` z metodo `updateCategory`.
- [ ] Sprememba gumba "Kategorije" v `reminders.tsx`, da preusmeri na `/categories`.
- [ ] Odstranitev modalnega okna za ustvarjanje kategorije iz `reminders.tsx`.
- [ ] Ustvarjanje nove datoteke `categories.tsx`.
- [ ] Implementacija seznama kategorij v `categories.tsx`.
- [ ] Implementacija obrazca za dodajanje in urejanje kategorij v `categories.tsx`.
- [ ] Preverjanje napak in testiranje.