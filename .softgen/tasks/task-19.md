---
title: "Sistem obvestil za bližajoče se opomnike"
status: in_progress
priority: high
type: feature
tags: [notifications, reminders, toast]
created_by: agent
created_at: 2026-04-17T11:22:00Z
position: 19
---

## Notes
Implementiraj sistem, ki avtomatsko prikaže obvestila (toast), ko se opomnik bliža. Uporabi obstoječi toast sistem iz shadcn/ui. Sistem mora delovati globalno (ne samo na strani opomnikov).

## Checklist
- [ ] Ustvari `src/hooks/useReminderNotifications.ts` - hook za preverjanje bližajočih se opomnikov
- [ ] Hook naj preverja vsako minuto (interval) aktivne opomnike
- [ ] Prikaži toast obvestilo: 15 min pred, 5 min pred, in ob času opomnika
- [ ] Izogibaj se podvojenim obvestilom (sledi že obveščenim ID-jem)
- [ ] Integriraj v `_app.tsx` globalno, da deluje na vseh straneh
- [ ] Preveri napake