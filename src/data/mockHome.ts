/**
 * Home-page mock data for sections not yet backed by APIs.
 * Replace these exports with live service calls module-by-module later.
 */

export interface HomeGrowthPoint {
  label: string;
  count: number;
}

export interface HomeGenderSlice {
  label: string;
  value: number;
  color: string;
}

export interface HomeAgeBucket {
  label: string;
  value: number;
}

export interface HomeFamilyDate {
  id: string;
  personName: string;
  eventType: "Birthday" | "Anniversary" | "Remembrance" | "Family event";
  date: string;
  location?: string;
  href: string;
}

export interface HomeRecentMember {
  id: string;
  name: string;
  relation: string;
  avatar: string;
  addedOn: string;
  href: string;
}

export interface HomeGeneration {
  id: string;
  generation: number;
  label: string;
  count: number;
}

export interface HomeMemory {
  id: string;
  title: string;
  imageUrl: string;
  href: string;
}

export interface HomeLocation {
  id: string;
  name: string;
  memberCount: number;
}

export interface HomeTimelineEvent {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
  kind: string;
  href?: string;
}

export interface HomeTreePreviewNode {
  id: string;
  name: string;
  relation: string;
  children?: HomeTreePreviewNode[];
}

export const homeGrowthSeries: HomeGrowthPoint[] = [
  { label: "2019", count: 18 },
  { label: "2020", count: 20 },
  { label: "2021", count: 22 },
  { label: "2022", count: 24 },
  { label: "2023", count: 28 },
  { label: "2024", count: 31 },
  { label: "2025", count: 34 },
  { label: "2026", count: 38 }
];

export const homeGrowthSummary = {
  status: "Family is growing" as const,
  deltaLabel: "Net growth +12 this year",
  membersAdded: 18,
  deceased: 6,
  netGrowth: 12
};

export const homeGenderFallback: HomeGenderSlice[] = [
  { label: "Male", value: 18, color: "#34d399" },
  { label: "Female", value: 16, color: "#fb7185" },
  { label: "Other", value: 2, color: "#64748b" }
];

export const homeAgeFallback: HomeAgeBucket[] = [
  { label: "0–5", value: 3 },
  { label: "6–10", value: 2 },
  { label: "11–20", value: 4 },
  { label: "21–30", value: 6 },
  { label: "31–40", value: 7 },
  { label: "41–50", value: 5 },
  { label: "51–60", value: 4 },
  { label: "61–70", value: 3 },
  { label: "71+", value: 2 }
];

export const homeFamilyDates: HomeFamilyDate[] = [
  {
    id: "hd-1",
    personName: "Rajesh Mehta",
    eventType: "Birthday",
    date: "2026-08-18",
    location: "Pune",
    href: "/events/event-1"
  },
  {
    id: "hd-2",
    personName: "Amit & Pooja",
    eventType: "Anniversary",
    date: "2026-11-18",
    location: "Bengaluru",
    href: "/events/event-2"
  },
  {
    id: "hd-3",
    personName: "Ramesh Mehta",
    eventType: "Remembrance",
    date: "2026-08-15",
    location: "Kerala",
    href: "/events/event-4"
  },
  {
    id: "hd-4",
    personName: "Mehta Family",
    eventType: "Family event",
    date: "2026-12-22",
    location: "Thiruvananthapuram",
    href: "/events/event-3"
  }
];

export const homeRecentMembersFallback: HomeRecentMember[] = [
  {
    id: "rm-1",
    name: "Ananya Mehta",
    relation: "Granddaughter",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop",
    addedOn: "2026-03-12",
    href: "/members"
  },
  {
    id: "rm-2",
    name: "Aarav Mehta",
    relation: "Grandson",
    avatar: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop",
    addedOn: "2025-11-02",
    href: "/members"
  },
  {
    id: "rm-3",
    name: "Pooja Mehta",
    relation: "Daughter-in-law",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    addedOn: "2025-08-20",
    href: "/members"
  },
  {
    id: "rm-4",
    name: "Diya Mehta",
    relation: "Granddaughter",
    avatar: "https://images.unsplash.com/photo-1471286174890-9c112ffca5ba?w=200&h=200&fit=crop",
    addedOn: "2025-05-08",
    href: "/members"
  }
];

export const homeGenerations: HomeGeneration[] = [
  { id: "g1", generation: 1, label: "Great Grandparents", count: 2 },
  { id: "g2", generation: 2, label: "Grandparents", count: 4 },
  { id: "g3", generation: 3, label: "Parents", count: 8 },
  { id: "g4", generation: 4, label: "Children", count: 14 },
  { id: "g5", generation: 5, label: "Grandchildren", count: 10 }
];

export const homeTreePreview: HomeTreePreviewNode = {
  id: "root",
  name: "Ramesh",
  relation: "Grandfather",
  children: [
    {
      id: "father",
      name: "Rajesh",
      relation: "Father",
      children: [
        { id: "you", name: "Amit", relation: "You" },
        { id: "sister", name: "Diya", relation: "Sister" }
      ]
    },
    {
      id: "uncle",
      name: "Suresh",
      relation: "Uncle"
    }
  ]
};

export const homeMemories: HomeMemory[] = [
  {
    id: "mem-1",
    title: "Verandah lunch",
    imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop",
    href: "/gallery/album-1"
  },
  {
    id: "mem-2",
    title: "Bengaluru wedding",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
    href: "/gallery/album-2"
  },
  {
    id: "mem-3",
    title: "Pepper vines at dusk",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
    href: "/gallery/album-1"
  },
  {
    id: "mem-4",
    title: "Little ones",
    imageUrl: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&h=600&fit=crop",
    href: "/gallery/album-3"
  },
  {
    id: "mem-5",
    title: "Kitchen mornings",
    imageUrl: "https://images.unsplash.com/photo-1464306208223-e0b4495a5553?w=800&h=600&fit=crop",
    href: "/gallery/album-1"
  },
  {
    id: "mem-6",
    title: "Garlands & light",
    imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop",
    href: "/gallery/album-2"
  }
];

export const homeLocationsFallback: HomeLocation[] = [
  { id: "loc-1", name: "Thiruvananthapuram", memberCount: 8 },
  { id: "loc-2", name: "Pune", memberCount: 11 },
  { id: "loc-3", name: "Bengaluru", memberCount: 9 },
  { id: "loc-4", name: "Mumbai", memberCount: 4 },
  { id: "loc-5", name: "Kochi", memberCount: 3 }
];

export const homeTimelineEvents: HomeTimelineEvent[] = [
  {
    id: "ht-1",
    dateLabel: "Mar 2026",
    title: "Ananya added to the chronicle",
    description: "A new member joined the family tree.",
    kind: "Member added",
    href: "/members"
  },
  {
    id: "ht-2",
    dateLabel: "Jan 2026",
    title: "Kerala Summers album updated",
    description: "Three new courtyard photos were shared.",
    kind: "New photo",
    href: "/gallery"
  },
  {
    id: "ht-3",
    dateLabel: "Dec 2025",
    title: "Winter gathering planned",
    description: "Family event scheduled for Thiruvananthapuram.",
    kind: "Family gathering",
    href: "/events"
  },
  {
    id: "ht-4",
    dateLabel: "Nov 2025",
    title: "Amit & Pooja anniversary",
    description: "Third wedding anniversary celebrated in Bengaluru.",
    kind: "Marriage",
    href: "/events/event-2"
  },
  {
    id: "ht-5",
    dateLabel: "Jul 2025",
    title: "Summer at the Ancestral Home",
    description: "A new family story was published.",
    kind: "New story",
    href: "/stories/story-1"
  },
  {
    id: "ht-6",
    dateLabel: "Aug 2025",
    title: "Rajesh’s birthday",
    description: "Birthday dinner and a short family skit.",
    kind: "Birthday",
    href: "/events/event-1"
  }
];
