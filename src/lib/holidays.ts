export function getEaster(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

export function getSlovenianHolidays(year: number) {
  const easter = getEaster(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  return [
    { date: new Date(year, 0, 1), name: "Novo leto" },
    { date: new Date(year, 0, 2), name: "Novo leto" },
    { date: new Date(year, 1, 8), name: "Prešernov dan" },
    { date: easter, name: "Velikonočna nedelja" },
    { date: easterMonday, name: "Velikonočni ponedeljek" },
    { date: new Date(year, 3, 27), name: "Dan upora proti okupatorju" },
    { date: new Date(year, 4, 1), name: "Praznik dela" },
    { date: new Date(year, 4, 2), name: "Praznik dela" },
    { date: pentecost, name: "Binkoštna nedelja" },
    { date: new Date(year, 5, 25), name: "Dan državnosti" },
    { date: new Date(year, 7, 15), name: "Marijino vnebovzetje" },
    { date: new Date(year, 9, 31), name: "Dan reformacije" },
    { date: new Date(year, 10, 1), name: "Dan spomina na mrtve" },
    { date: new Date(year, 11, 25), name: "Božič" },
    { date: new Date(year, 11, 26), name: "Dan samostojnosti in enotnosti" },
  ];
}

export function getHolidayForDate(date: Date) {
  const holidays = getSlovenianHolidays(date.getFullYear());
  return holidays.find(h => 
    h.date.getDate() === date.getDate() && 
    h.date.getMonth() === date.getMonth()
  );
}