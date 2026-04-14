---
title: NextAuth.js setup z family_id povezavo
status: done
priority: urgent
type: feature
tags: [auth, nextauth, backend]
created_by: agent
created_at: 2026-04-14T15:45:55Z
position: 6
---

## Notes
Implementacija NextAuth.js avtentikacijskega sistema z JWT session strategijo. Custom session polja: family_id (povezava na družino), role (super_admin/parent/child), permissions (array pravic). Credentials provider za email/password login, opcijsko Google OAuth.

## Checklist
- [x] Namestitev next-auth paketa
- [x] Kreacija API route /api/auth/[...nextauth].ts
- [x] Konfiguracija JWT session z custom polji (family_id, role, permissions)
- [x] TypeScript types za NextAuth (next-auth.d.ts)
- [x] SessionProvider wrapper v _app.tsx
- [x] Login page komponenta (/pages/auth/login.tsx)
- [x] Register page z družinsko kodo (/pages/auth/register.tsx)