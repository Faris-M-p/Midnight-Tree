import type { FamilyMember, MarriageUnion, Milestone } from './types';

export const familyMembers: FamilyMember[] = [
  {
    id: 'ramesh',
    name: 'Ramesh Mehta',
    relation: 'Grandfather',
    gender: 'male',
    dob: '1945-08-15',
    location: 'Kerala',
    profession: 'Retired Civil Engineer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Ramesh is the patriarch of the family. He spent 35 years designing state highways and bridges across Kerala. An avid chess player, gardener, and writer, he loves sharing historical anecdotes with his grandchildren.',
    education: 'B.Tech in Civil Engineering, College of Engineering Guindy (1967)',
    career: 'Chief Engineer, Kerala Public Works Department (1970 - 2005)',
    photos: [
      'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'savita',
    name: 'Savita Mehta',
    relation: 'Grandmother',
    gender: 'female',
    dob: '1950-10-22',
    location: 'Kerala',
    profession: 'Retired Sanskrit Professor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Savita taught Sanskrit literature for over three decades. She is a culinary master, a classical Carnatic singer, and the glue that keeps the family traditions alive and active across generations.',
    education: 'M.A. & Ph.D. in Sanskrit Literature, Madras University (1972)',
    career: 'Head of Sanskrit Department, University College Trivandrum (1975 - 2010)',
    photos: [
      'https://images.unsplash.com/photo-1464306208223-e0b4495a5553?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'suresh',
    name: 'Suresh Mehta',
    relation: 'Uncle',
    gender: 'male',
    dob: '1973-04-12',
    location: 'Kerala',
    profession: 'Organic Farmer & Writer',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Suresh decided to leave corporate life early to start an organic farming collective in Kerala. He writes columns on sustainable agriculture and is a passionate advocate for biodiversity.',
    education: 'B.Sc. in Agriculture, Kerala Agricultural University (1995)',
    career: 'Founder, Haritha Organic Collective (2012 - Present); Agronomist, Spice Board (1996 - 2011)',
    photos: [
      'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'rajesh',
    name: 'Rajesh Mehta',
    relation: 'Father',
    gender: 'male',
    dob: '1975-02-18',
    location: 'Pune',
    profession: 'Senior Pediatrician',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Rajesh runs a popular pediatric clinic in Pune. He is extremely passionate about child health and spends his weekends conducting free medical camps in nearby rural areas.',
    education: 'MD in Pediatrics, Armed Forces Medical College, Pune (2000)',
    career: 'Director of Pediatrics, Mehta Childcare Center (2005 - Present); Chief Resident, KEM Hospital (2000 - 2004)',
    photos: [
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'kavita',
    name: 'Kavita Sharma',
    relation: 'Mother',
    gender: 'female',
    dob: '1978-05-30',
    location: 'Pune',
    profession: 'Creative Director',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Kavita leads the creative design division of a global advertising firm. She is an expert painter and holds pottery workshops at her home studio in Pune.',
    education: 'Bachelor of Fine Arts, Sir J.J. School of Art, Mumbai (1999)',
    career: 'Executive Creative Director, Canvas Advertising (2010 - Present); Senior Art Director, Ogilvy (2000 - 2009)',
    photos: [
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'amit',
    name: 'Amit Mehta',
    relation: 'Brother',
    gender: 'male',
    dob: '2001-11-05',
    location: 'Bengaluru',
    profession: 'Software Engineer',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Amit works at a tech unicorn in Bengaluru building cloud infrastructure. In his free time, he plays electric guitar in a local band and goes long-distance cycling.',
    education: 'B.Tech in Computer Science, NIT Trichy (2023)',
    career: 'Software Engineer, CloudLabs India (2023 - Present)',
    isDeceased: false,
    socials: {
      instagram: 'https://instagram.com/amit.mehta.codes',
      facebook: 'https://facebook.com/amit.mehta.nit',
      whatsapp: '9876543214',
      gmail: 'amit.mehta@cloudlabs.in'
    },
    photos: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'pooja',
    name: 'Pooja Verma',
    relation: 'Sister-in-Law',
    gender: 'female',
    dob: '2002-09-14',
    location: 'Bengaluru',
    profession: 'UX Researcher',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Pooja conducts user research for an edtech platform. She is highly passionate about accessible digital design and spends her weekends testing interfaces with diverse user groups.',
    education: 'M.Sc. in Human-Computer Interaction, IIT Bombay (2024)',
    career: 'Associate UX Researcher, LearnSmart Tech (2024 - Present)',
    isDeceased: false,
    socials: {
      instagram: 'https://instagram.com/pooja.verma.uxr',
      facebook: 'https://facebook.com/pooja.verma.design',
      whatsapp: '9876543215',
      gmail: 'pooja.verma@learnsmarttech.com'
    },
    photos: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta (Me)',
    relation: 'Me',
    gender: 'male',
    dob: '2004-03-24',
    location: 'Bengaluru',
    profession: 'Data Analyst Intern',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'I am a final year college student currently interning as a Data Analyst. I built this family tree web application to store and visualize our lineage. I enjoy coding, swimming, and street photography.',
    education: 'B.Sc. in Data Science, Christ University, Bengaluru (Expected 2026)',
    career: 'Data Science Intern, RetailCorp Analytics (2025 - Present)',
    isDeceased: false,
    socials: {
      instagram: 'https://instagram.com/rahul.mehta.data',
      facebook: 'https://facebook.com/rahul.mehta.student',
      whatsapp: '9876543216',
      gmail: 'rahul.mehta@christuniversity.in'
    },
    photos: [
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'aarav',
    name: 'Aarav Mehta',
    relation: 'Nephew',
    gender: 'male',
    dob: '2023-01-10',
    location: 'Bengaluru',
    profession: 'Toddler',
    avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Aarav is the newest addition to the Mehta family. He enjoys playing with blocks, chasing the family cat, and mimicking his uncle guitar playing.',
    education: 'Preschool Student',
    career: 'Professional Toddler & Explorer (2023 - Present)',
    isDeceased: false,
    socials: {
      instagram: 'https://instagram.com/aarav.mehta.baby',
      facebook: 'https://facebook.com/aarav.mehta.2023',
      gmail: 'aarav.mehta.family@gmail.com'
    },
    photos: [
      'https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1510154221590-ff63e90a136f?w=500&auto=format&fit=crop&q=60'
    ]
  },
  {
    id: 'ananya',
    name: 'Ananya Mehta',
    relation: 'Niece',
    gender: 'female',
    dob: '2024-07-15',
    location: 'Bengaluru',
    profession: 'Infant',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Ananya is an incredibly cheerful infant who spreads joy with her bright smile. She is just learning to crawl and loves listening to classical lullabies sung by her grandmother.',
    education: 'Not Yet Enrolled',
    career: 'Chief Joy Officer (2024 - Present)',
    isDeceased: false,
    socials: {
      instagram: 'https://instagram.com/ananya.mehta.joy',
      facebook: 'https://facebook.com/ananya.mehta.2024',
      gmail: 'ananya.mehta.family@gmail.com'
    },
    photos: [
      'https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=500&auto=format&fit=crop&q=60'
    ]
  }
];

export const marriageUnions: MarriageUnion[] = [
  {
    id: 'union_ramesh_savita',
    spouse1Id: 'ramesh',
    spouse2Id: 'savita',
    childrenIds: ['suresh', 'rajesh']
  },
  {
    id: 'union_rajesh_kavita',
    spouse1Id: 'rajesh',
    spouse2Id: 'kavita',
    childrenIds: ['amit', 'rahul']
  },
  {
    id: 'union_amit_pooja',
    spouse1Id: 'amit',
    spouse2Id: 'pooja',
    childrenIds: ['aarav', 'ananya']
  }
];

export const familyMilestones: Milestone[] = [
  {
    id: 'm1',
    year: 1967,
    title: 'Civil Engineering Graduation',
    description: 'Ramesh graduates from the prestigious College of Engineering Guindy, launching his engineering career.',
    memberId: 'ramesh',
    memberName: 'Ramesh Mehta',
    category: 'education'
  },
  {
    id: 'm2',
    year: 1969,
    title: 'Wedding of Ramesh & Savita',
    description: 'Ramesh Mehta marries Savita, setting the foundation for the Mehta household in Thiruvananthapuram, Kerala.',
    memberId: 'ramesh',
    memberName: 'Ramesh Mehta & Savita Mehta',
    category: 'marriage'
  },
  {
    id: 'm3',
    year: 1972,
    title: 'Doctorate in Sanskrit Literature',
    description: 'Savita completes her PhD thesis on Vedic Metres, becoming a junior faculty member at Madras University.',
    memberId: 'savita',
    memberName: 'Savita Mehta',
    category: 'education'
  },
  {
    id: 'm4',
    year: 1973,
    title: 'Birth of First Son Suresh',
    description: 'Suresh is born in Trivandrum, bringing immense joy to young Ramesh and Savita.',
    memberId: 'suresh',
    memberName: 'Suresh Mehta',
    category: 'birth'
  },
  {
    id: 'm5',
    year: 1975,
    title: 'Birth of Second Son Rajesh',
    description: 'Rajesh Mehta is born, completing the second generation of the Mehta line.',
    memberId: 'rajesh',
    memberName: 'Rajesh Mehta',
    category: 'birth'
  },
  {
    id: 'm6',
    year: 2000,
    title: 'Medical Degree Achievement',
    description: 'Rajesh completes his MD in Pediatrics at AFMC Pune, joining the medical community.',
    memberId: 'rajesh',
    memberName: 'Rajesh Mehta',
    category: 'education'
  },
  {
    id: 'm7',
    year: 2000,
    title: 'Creative Art Director Role',
    description: 'Kavita joins Ogilvy Advertising as a Senior Art Director after winning design accolades in Mumbai.',
    memberId: 'kavita',
    memberName: 'Kavita Sharma',
    category: 'career'
  },
  {
    id: 'm8',
    year: 2000,
    title: 'Wedding of Rajesh & Kavita',
    description: 'Dr. Rajesh marries Kavita Sharma in Mumbai, starting their new life together in Pune.',
    memberId: 'rajesh',
    memberName: 'Rajesh Mehta & Kavita Sharma',
    category: 'marriage'
  },
  {
    id: 'm9',
    year: 2001,
    title: 'Birth of First Son Amit',
    description: 'Amit Mehta is born in Pune, marking the start of the third generation.',
    memberId: 'amit',
    memberName: 'Amit Mehta',
    category: 'birth'
  },
  {
    id: 'm10',
    year: 2004,
    title: 'Birth of Second Son Rahul',
    description: 'Rahul Mehta (Me) is born in Pune, completing Dr. Rajesh and Kavita family.',
    memberId: 'rahul',
    memberName: 'Rahul Mehta',
    category: 'birth'
  },
  {
    id: 'm11',
    year: 2012,
    title: 'Establishing Organic Collective',
    description: 'Suresh Mehta quits his corporate agronomist job and establishes Haritha Organic Farm Collective in Kerala.',
    memberId: 'suresh',
    memberName: 'Suresh Mehta',
    category: 'career'
  },
  {
    id: 'm12',
    year: 2023,
    title: 'Software Engineer Role at CloudLabs',
    description: 'Amit graduates from NIT Trichy and joins CloudLabs India in Bengaluru as a cloud developer.',
    memberId: 'amit',
    memberName: 'Amit Mehta',
    category: 'career'
  },
  {
    id: 'm13',
    year: 2023,
    title: 'Wedding of Amit & Pooja',
    description: 'Amit Mehta and Pooja Verma are married in Bengaluru after meeting in graduate school networks.',
    memberId: 'amit',
    memberName: 'Amit Mehta & Pooja Verma',
    category: 'marriage'
  },
  {
    id: 'm14',
    year: 2023,
    title: 'Birth of Aarav',
    description: 'Aarav is born to Amit and Pooja, introducing the fourth generation of the family.',
    memberId: 'aarav',
    memberName: 'Aarav Mehta',
    category: 'birth'
  },
  {
    id: 'm15',
    year: 2024,
    title: 'Birth of Ananya',
    description: 'Ananya is born, adding the second child to the fourth generation of the family tree.',
    memberId: 'ananya',
    memberName: 'Ananya Mehta',
    category: 'birth'
  }
];

// Grid Coordinates for layout are now calculated dynamically.
