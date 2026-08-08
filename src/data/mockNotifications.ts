export type NotificationKind = "birthday" | "anniversary" | "event" | "story" | "other";

export interface MockNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  href: string;
}

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    kind: "birthday",
    title: "Rajesh’s birthday is coming up",
    message: "18 Aug · Pune. Tap to open his profile.",
    createdAt: "2026-08-08T09:00:00.000Z",
    read: false,
    href: "/members/rajesh"
  },
  {
    id: "n2",
    kind: "story",
    title: "Story published",
    message: "Kavita published “Summer at the Ancestral Home”.",
    createdAt: "2026-08-07T14:20:00.000Z",
    read: false,
    href: "/stories/story-1"
  },
  {
    id: "n3",
    kind: "event",
    title: "Family gathering added",
    message: "Kerala winter gathering · 22 Dec.",
    createdAt: "2026-08-06T11:10:00.000Z",
    read: false,
    href: "/events/event-3"
  },
  {
    id: "n4",
    kind: "anniversary",
    title: "Amit & Pooja anniversary",
    message: "18 Nov · Bengaluru.",
    createdAt: "2026-08-05T08:00:00.000Z",
    read: true,
    href: "/events/event-2"
  },
  {
    id: "n5",
    kind: "other",
    title: "New photos in Little Ones",
    message: "2 photos added to the album.",
    createdAt: "2026-08-04T16:45:00.000Z",
    read: true,
    href: "/gallery/album-3"
  }
];
