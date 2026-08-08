export interface MockFamily {
  name: string;
  code: string;
  description: string;
  origin: string;
  history: string;
  logo: string;
  cover: string;
  foundedYear: number;
  location: string;
}

export const mockFamily: MockFamily = {
  name: "Mehta Family",
  code: "MEHTA-1945",
  description:
    "A four-generation Kerala family rooted in engineering, literature, medicine, and the arts. Midnight Chronicle is how we keep our stories together.",
  origin: "Thiruvananthapuram, Kerala",
  history:
    "The Mehta household began with Ramesh and Savita in 1969. Over decades the family grew across Kerala, Pune, and Bengaluru — carrying forward a tradition of education, service, and gathering every summer in the ancestral home.",
  logo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
  cover:
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&h=600&fit=crop&q=80",
  foundedYear: 1945,
  location: "Pune & Kerala, India"
};
