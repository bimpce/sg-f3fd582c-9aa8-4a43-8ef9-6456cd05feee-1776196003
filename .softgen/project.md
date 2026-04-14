## Vision
FamilySync je družinski koledar in sistem opomnikov, zasnovan za moderne družine, ki potrebujejo koordinacijo aktivnosti med starši in otroki. Aplikacija ponuja hierarhijo vlog (Super-Admin, Starš, Otrok) z natančnim nadzorom nad zasebnostjo in dostopom do vsebin.

Ciljna publika: Družine z otroki (4-18 let), kjer starši potrebujejo nadzor nad vidnostjo vsebin in pravicami družinskih članov.

## Design
**Barve (HSL format):**
- `--primary: 210 80% 60%` (mehka modra - zaupanje, stabilnost)
- `--background: 40 20% 97%` (toplo kremasta - udobje)
- `--foreground: 220 15% 20%` (temno siva - čitljivost)
- `--accent: 270 50% 70%` (pastelna vijolica - akcenti)
- `--muted: 220 15% 90%` (svetlo siva - sekundarni elementi)

**Tipografija:**
- Heading: Nunito (zaobljen, družinsko prijazen)
- Body: Inter (čist, moderen, beren)

**Stil:** Minimalistični dashboard z zaobljenimi robovi, pastelnimi kartami, veliko belega prostora. Velikimi interaktivnimi elementi za enostavno uporabo.

## Features
**Hierarhija vlog:**
- Super-Admin: Polne pravice, plačila, upravljanje članov
- Starš: Urejanje dogodkov, vpogled v "Parent-only" vsebine
- Otrok: Omejen vpogled, označevanje nalog

**Modularni sistem pravic:** Toggle switches za CAN_CREATE_EVENT, CAN_EDIT_OTHERS_EVENTS, CAN_SEE_PRIVATE, CAN_DELETE, CAN_INVITE

**Koledar:** Mesečni/tedenski/dnevni pogledi, barvno kodiranje po članih, zasebnost (Vsi/Samo starši)

**Opomniki:** Pametna push obvestila, seznam nalog, kategorije

**Navigacija:** Bottom nav: Koledar, Naloge, Obvestila, Profil