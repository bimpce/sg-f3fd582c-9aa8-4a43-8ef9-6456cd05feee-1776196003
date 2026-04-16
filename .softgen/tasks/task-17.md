---
title: "Urejanje obstoječih opomnikov"
status: "done"
priority: "high"
type: "feature"
tags: ["reminders", "crud", "edit"]
---

## Notes
Uporabnik želi možnost urejanja obstoječih opomnikov. Dodati je potrebno gumb za urejanje na kartico opomnika in prilagoditi obrazec, da podpira tako ustvarjanje kot posodabljanje.

## Checklist
- [x] Preveri, če `updateReminder` obstaja v `supabaseService.ts` in ga dodaj, če manjka.
- [x] V `reminders.tsx` dodaj stanje za urejanje (`editingReminderId`).
- [x] Dodaj funkcijo za predizpolnitev obrazca z obstoječimi podatki opomnika.
- [x] Prilagodi `handleCreateReminder` v `handleSaveReminder`, da izvaja posodobitev, ko smo v načinu urejanja.
- [x] Dodaj gumb "Uredi" (ikona svinčnika) na kartico vsakega opomnika v seznamu.
- [x] Testiraj shranjevanje sprememb.