export const HOME = { name: "AANANDI", tagline: "Where Happiness Begins" } as const;

export const EVENT = {
  hosts: "Mr. Arpan & Mrs. Krishna Doshi",
  invocation: "|| Om Shri Ganeshaya Namah ||",
  blessings: "With the divine blessings of the Gunmayi Devi and our elders.",
  occasion: "Vastu Pooja & Griha Pravesh Ceremony",
  invitation: "Mr. Arpan & Mrs. Krishna Doshi cordially invite you and your family to grace the auspicious occasion of our new home.",
  date: "Friday, November 27, 2026",
  start: "2026-11-27T09:30:00+05:30",
  address: "6, Shreenathji Villa, Opp. Panetar Park, Near Girirajji Temple, Umreth.",
  family: ["Dilip & Shilpa Doshi", "Arpan & Krishna Doshi", "Vannya Doshi", "Kayaan Doshi"],
  schedule: [
    { title: "Vastu Pooja", time: "9:30 AM", asset: "kalash", note: "An auspicious beginning" },
    { title: "Havan", time: "5:00 PM", asset: "havan", note: "Sacred fire & divine blessings" },
    { title: "Dinner", time: "7:30 PM onwards", asset: "diya", note: "An evening of togetherness" },
  ],
} as const;

export function getCountdown(now: number) {
  const seconds = Math.max(0, Math.floor((Date.parse(EVENT.start) - now) / 1000));
  return [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
}

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(EVENT.address)}`;
export const calendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: `${EVENT.occasion} — AANANDI`, dates: "20261127T040000Z/20261127T143000Z", ctz: "Asia/Kolkata", details: `${EVENT.invitation}\nVastu Pooja — 9:30 AM\nHavan — 5:00 PM\nDinner — 7:30 PM onwards`, location: EVENT.address })}`;

export function sharingUrl(pageUrl: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${EVENT.invitation}\n\nAANANDI — Where Happiness Begins\n${EVENT.date}\nVastu Pooja — 9:30 AM\nHavan — 5:00 PM\nDinner — 7:30 PM onwards\n\n${EVENT.address}\n\n${pageUrl}`)}`;
}
export const mapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(EVENT.address)}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(EVENT.address)}&output=embed`;
