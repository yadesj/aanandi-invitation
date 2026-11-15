
export const HOME = {
  name: "AANANDI",
  tagline: "Where Happiness Begins",
} as const;

export const EVENT = {
  hosts: "Mr. Arpan & Mrs. Krishna Doshi",
  invocation: "|| Om Shri Ganeshaya Namah ||",
  blessings: "With the divine blessings of the Gunmayi Devi and our elders.",
  occasion: "Vastu Pooja & Griha Pravesh Ceremony",
  invitation:
    "Mr. Arpan & Mrs. Krishna Doshi cordially invite you and your family to grace the auspicious occasion of our new home.",
  date: "Friday, November 27, 2026",
  start: "2026-11-27T09:30:00+05:30",

  // New residence address
  address:
    "6, Shreenathji Villa, Opp. Panetar Park, Near Girirajji Temple, Umreth.",

  dinnerAddress: "Nasikwala Hall, Ode Bazar, Umreth, Gujarat 388220",
dinnerDirectionsUrl:
  "https://www.google.com/maps/search/?api=1&query=Nasikwala+Hall%2C+Ode+Bazar%2C+Umreth%2C+Gujarat+388220",

  // Separate dinner venue
  dinnerAddress:
    "Nasikwala Hall, Ode Bazar, Umreth, Gujarat 388220",

  dinnerDirectionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nasikwala+Hall%2C+Ode+Bazar%2C+Umreth%2C+Gujarat+388220",

  family: [
    "Dilip & Shilpa Doshi",
    "Arpan & Krishna Doshi",
    "Vannya Doshi",
    "Kayaan Doshi",
  ],

  schedule: [
    {
      title: "Vastu Pooja",
      time: "9:30 AM",
      asset: "kalash",
      note: "An auspicious beginning",
    },
    {
      title: "Havan",
      time: "5:00 PM",
      asset: "havan",
      note: "Sacred fire & divine blessings",
    },
    {
      title: "Dinner",
      time: "7:30 PM onwards",
      asset: "diya",
      note: "An evening of togetherness",
    },
  ],
} as const;

export function getCountdown(now: number) {
  const seconds = Math.max(
    0,
    Math.floor((Date.parse(EVENT.start) - now) / 1000)
  );

  return [
    Math.floor(seconds / 86400),
    Math.floor((seconds % 86400) / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ];
}

// Exact residence Google Maps coordinates
const VENUE_COORDINATES = "22.6902637,73.115303";

// Residence Get Directions button
export const directionsUrl =
  `https://www.google.com/maps/dir/?api=1&destination=${VENUE_COORDINATES}`;

// Google Calendar event
export const calendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
  action: "TEMPLATE",
  text: `${EVENT.occasion} — AANANDI`,
  dates: "20261127T040000Z/20261127T143000Z",
  ctz: "Asia/Kolkata",
  details: `${EVENT.invitation}\nVastu Pooja — 9:30 AM\nHavan — 5:00 PM\nDinner — 7:30 PM onwards\nDinner Venue: ${EVENT.dinnerAddress}`,
  location: EVENT.address,
})}`;

// WhatsApp sharing
export function sharingUrl(pageUrl: string) {
  return `https://wa.me/?text=${encodeURIComponent(
    `${EVENT.invitation}\n\nAANANDI — Where Happiness Begins\n${EVENT.date}\nVastu Pooja — 9:30 AM\nHavan — 5:00 PM\nDinner — 7:30 PM onwards\n\nResidence: ${EVENT.address}\nDinner Venue: ${EVENT.dinnerAddress}\n\n${pageUrl}`
  )}`;
}

// Open residence in Google Maps
export const mapsOpenUrl =
  `https://www.google.com/maps/search/?api=1&query=${VENUE_COORDINATES}`;

// Embedded residence Google Map
export const mapsEmbedUrl =
  `https://maps.google.com/maps?q=${VENUE_COORDINATES}&z=17&output=embed`;
