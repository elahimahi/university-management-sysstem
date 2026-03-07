export type ProgramCategory = 'engineering' | 'business' | 'arts' | 'health'

export interface Program {
  id: string
  title: string
  category: ProgramCategory
  duration: string
  mode: string
  tuition: string
  overview: string
  requirements: Array<{ label: string; value: number }>
}

export interface FacultyMember {
  id: string
  name: string
  image: string
  department: string
  role: string
  email: string
  expertise: string[]
  bio: string
}

export interface CampusPhoto {
  id: string
  title: string
  category: 'sports' | 'academics' | 'culture' | 'research'
  image: string
  description: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  category: 'academic' | 'career' | 'sports' | 'community'
  location: string
  description: string
}

export const announcements = [
  'Spring 2026 admission applications close on April 30.',
  'New AI and Data Science scholarship launched for undergraduate students.',
  'International research conference registration is now open.',
  'Campus innovation fair will take place on March 25 in the main auditorium.',
]

export const heroStats = [
  { label: 'Students', value: 12450, suffix: '+' },
  { label: 'Faculty', value: 920, suffix: '+' },
  { label: 'Programs', value: 86, suffix: '' },
  { label: 'Research Labs', value: 41, suffix: '' },
]

export const programs: Program[] = [
  {
    id: 'cse',
    title: 'BSc in Computer Science & Engineering',
    category: 'engineering',
    duration: '4 Years',
    mode: 'On Campus',
    tuition: '$4,200 / semester',
    overview: 'Software engineering, AI, cloud, and cybersecurity specializations with industry internships.',
    requirements: [
      { label: 'Mathematics Readiness', value: 92 },
      { label: 'Programming Foundation', value: 80 },
      { label: 'English Proficiency', value: 75 },
    ],
  },
  {
    id: 'eee',
    title: 'BSc in Electrical & Electronic Engineering',
    category: 'engineering',
    duration: '4 Years',
    mode: 'On Campus',
    tuition: '$3,900 / semester',
    overview: 'Power systems, embedded devices, communications, and robotics with advanced lab facilities.',
    requirements: [
      { label: 'Physics Readiness', value: 88 },
      { label: 'Mathematics Readiness', value: 90 },
      { label: 'Lab Preparedness', value: 82 },
    ],
  },
  {
    id: 'bba',
    title: 'BBA in Strategic Management',
    category: 'business',
    duration: '4 Years',
    mode: 'Hybrid',
    tuition: '$3,200 / semester',
    overview: 'Entrepreneurship, analytics, operations, and leadership modules with startup incubator access.',
    requirements: [
      { label: 'Communication Skills', value: 78 },
      { label: 'Analytical Reasoning', value: 73 },
      { label: 'Leadership Potential', value: 81 },
    ],
  },
  {
    id: 'econ',
    title: 'BA in Economics & Public Policy',
    category: 'arts',
    duration: '4 Years',
    mode: 'Hybrid',
    tuition: '$2,900 / semester',
    overview: 'Macro and microeconomics, policy analysis, econometrics, and social innovation projects.',
    requirements: [
      { label: 'Quantitative Literacy', value: 72 },
      { label: 'Critical Writing', value: 79 },
      { label: 'Debate & Policy Skills', value: 70 },
    ],
  },
  {
    id: 'nursing',
    title: 'BSc in Nursing Sciences',
    category: 'health',
    duration: '4 Years',
    mode: 'On Campus',
    tuition: '$4,000 / semester',
    overview: 'Clinical simulation, public health internships, and patient-centered care leadership.',
    requirements: [
      { label: 'Biology Readiness', value: 84 },
      { label: 'Empathy & Communication', value: 88 },
      { label: 'Clinical Aptitude', value: 80 },
    ],
  },
  {
    id: 'mph',
    title: 'Master of Public Health',
    category: 'health',
    duration: '2 Years',
    mode: 'Weekend + Online',
    tuition: '$2,500 / semester',
    overview: 'Epidemiology, health systems, biostatistics, and community-driven impact capstone.',
    requirements: [
      { label: 'Research Methods', value: 76 },
      { label: 'Data Analysis', value: 71 },
      { label: 'Community Fieldwork', value: 83 },
    ],
  },
]

export const campusGallery: CampusPhoto[] = [
  {
    id: 'gallery-1',
    title: 'Innovation Expo',
    category: 'research',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=80',
    description: 'Students presenting AI and robotics projects at annual innovation expo.',
  },
  {
    id: 'gallery-2',
    title: 'Robotics Lab',
    category: 'academics',
    image: 'https://images.unsplash.com/photo-1581091215367-59ab6dcef67c?auto=format&fit=crop&w=1200&q=80',
    description: 'Hands-on prototyping sessions in interdisciplinary robotics lab.',
  },
  {
    id: 'gallery-3',
    title: 'Inter-University Debate',
    category: 'culture',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    description: 'Regional debate championship hosted by humanities club.',
  },
  {
    id: 'gallery-4',
    title: 'Athletics Championship',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    description: 'Annual sports week with 28 teams across multiple disciplines.',
  },
  {
    id: 'gallery-5',
    title: 'Career Fair',
    category: 'academics',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    description: 'Top employers conducting interviews and workshops on campus.',
  },
  {
    id: 'gallery-6',
    title: 'Cultural Evening',
    category: 'culture',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    description: 'Music, art, and performances celebrating cultural diversity.',
  },
]

export const facultyDirectory: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Dr. Sarah Rahman',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    department: 'Computer Science',
    role: 'Professor & Program Director',
    email: 'sarah.rahman@aust.edu',
    expertise: ['Machine Learning', 'Cloud Platforms', 'Human-Centered AI'],
    bio: 'Leads undergraduate AI curriculum and mentors capstone teams with industry partners.',
  },
  {
    id: 'fac-2',
    name: 'Prof. Imran Haque',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    department: 'Business Administration',
    role: 'Associate Professor',
    email: 'imran.haque@aust.edu',
    expertise: ['Operations Strategy', 'Entrepreneurship', 'Business Analytics'],
    bio: 'Works with startup incubators and teaches practical strategy labs for founders.',
  },
  {
    id: 'fac-3',
    name: 'Dr. Nabila Karim',
    image: 'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=800&q=80',
    department: 'Public Health',
    role: 'Assistant Professor',
    email: 'nabila.karim@aust.edu',
    expertise: ['Epidemiology', 'Health Informatics', 'Community Health'],
    bio: 'Designs evidence-based interventions with municipal partners and NGOs.',
  },
  {
    id: 'fac-4',
    name: 'Dr. Fahad Islam',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
    department: 'Electrical Engineering',
    role: 'Professor',
    email: 'fahad.islam@aust.edu',
    expertise: ['Power Systems', 'Embedded Systems', 'Robotics'],
    bio: 'Heads smart-grid research initiatives and supervises graduate robotics projects.',
  },
  {
    id: 'fac-5',
    name: 'Prof. Laila Ahmed',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    department: 'Humanities',
    role: 'Senior Lecturer',
    email: 'laila.ahmed@aust.edu',
    expertise: ['Policy Analysis', 'Ethics', 'Communication'],
    bio: 'Leads policy writing workshops and interdisciplinary ethics seminars.',
  },
]

export const events: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Open House 2026',
    date: '2026-03-16',
    category: 'academic',
    location: 'Main Campus Plaza',
    description: 'Prospective students tour departments, labs, and residence facilities.',
  },
  {
    id: 'ev-2',
    title: 'Career Connect Week',
    date: '2026-03-19',
    category: 'career',
    location: 'Innovation Center',
    description: 'Recruiters, resume clinics, and internship matchmaking sessions.',
  },
  {
    id: 'ev-3',
    title: 'Community Health Camp',
    date: '2026-03-24',
    category: 'community',
    location: 'Health Sciences Block',
    description: 'Health screening and awareness programs with student volunteers.',
  },
  {
    id: 'ev-4',
    title: 'Interfaculty Football Final',
    date: '2026-03-27',
    category: 'sports',
    location: 'University Stadium',
    description: 'Final match followed by awards and closing ceremony.',
  },
]

export const applicationTimeline = [
  { title: 'Applications Open', date: 'Feb 10, 2026', detail: 'Online application portal opens for all undergraduate tracks.' },
  { title: 'Document Verification', date: 'Mar 12, 2026', detail: 'Applicants upload transcripts and identification documents.' },
  { title: 'Assessment Window', date: 'Apr 05, 2026', detail: 'Department-level aptitude test and interview schedule.' },
  { title: 'Final Offer Letters', date: 'Apr 28, 2026', detail: 'Offer letters and scholarship decisions are released.' },
]
