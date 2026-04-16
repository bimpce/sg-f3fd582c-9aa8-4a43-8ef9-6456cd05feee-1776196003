---
title: "Urejanje obstoječih opomnikov"
status: "in_progress"
priority: "high"
type: "feature"
tags: ["reminders", "crud", "edit"]
---

## Notes
Uporabnik želi možnost urejanja obstoječih opomnikov. Dodati je potrebno gumb za urejanje na kartico opomnika in prilagoditi obrazec, da podpira tako ustvarjanje kot posodabljanje.

## Checklist
- [ ] Preveri, če `updateReminder` obstaja v `supabaseService.ts` in ga dodaj, če manjka.
- [ ] V `reminders.tsx` dodaj stanje za urejanje (`editingReminderId`).
- [ ] Dodaj funkcijo za predizpolnitev obrazca z obstoječimi podatki opomnika.
- [ ] Prilagodi `handleCreateReminder` v `handleSaveReminder`, da izvaja posodobitev, ko smo v načinu urejanja.
- [ ] Dodaj gumb "Uredi" (ikona svinčnika) na kartico vsakega opomnika v seznamu.
- [ ] Testiraj shranjevanje sprememb.