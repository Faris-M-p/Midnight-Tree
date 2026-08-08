export type MockEventType =
  | "birthday"
  | "anniversary"
  | "memorial"
  | "gathering"
  | "achievement"
  | "custom";

export interface MockEvent {
  id: string;
  title: string;
  type: MockEventType;
  date: string;
  time: string;
  location: string;
  description: string;
  relatedMemberIds: string[];
  images: string[];
}

export const mockEvents: MockEvent[] = [
  {
    id: "event-1",
    title: "Rajesh’s Birthday",
    type: "birthday",
    date: "2026-08-18",
    time: "19:00",
    location: "Mehta Home, Pune",
    description: "Dinner and a small puja. Kids are preparing a skit.",
    relatedMemberIds: ["rajesh", "kavita", "rahul"],
    images: []
  },
  {
    id: "event-2",
    title: "Amit & Pooja Anniversary",
    type: "anniversary",
    date: "2026-11-18",
    time: "18:30",
    location: "Bengaluru",
    description: "Third wedding anniversary — garden dinner with close family.",
    relatedMemberIds: ["amit", "pooja"],
    images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop"]
  },
  {
    id: "event-3",
    title: "Kerala Family Gathering",
    type: "gathering",
    date: "2026-12-22",
    time: "10:00",
    location: "Ancestral Home, Thiruvananthapuram",
    description: "Annual winter gathering. Travel plans to be shared in the family group.",
    relatedMemberIds: ["ramesh", "savita", "suresh", "rajesh"],
    images: ["https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=500&fit=crop"]
  },
  {
    id: "event-4",
    title: "Remembering Ramesh’s Public Works Years",
    type: "memorial",
    date: "2025-08-15",
    time: "09:00",
    location: "Kerala",
    description: "A quiet remembrance on his birthday, with photos from the PWD years.",
    relatedMemberIds: ["ramesh", "savita"],
    images: []
  },
  {
    id: "event-5",
    title: "Haritha Harvest Festival",
    type: "achievement",
    date: "2025-11-02",
    time: "16:00",
    location: "Haritha Collective, Kerala",
    description: "Community harvest day hosted by Suresh.",
    relatedMemberIds: ["suresh"],
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop"]
  }
];
