// Mock data for Akashvaani AI Dashboard

export const topSchemes = [
  {
    id: 1,
    name: "PM Kisan Samman Nidhi",
    description: "Financial support for farmers.",
    score: 95,
    benefit: "₹6,000 / year",
    status: "Ready to Apply",
    isMatched: true
  },
  {
    id: 2,
    name: "Ayushman Bharat PM-JAY",
    description: "Health cover of up to ₹5 Lakhs per family.",
    score: 88,
    benefit: "₹5,00,000 Cover",
    status: "Ready to Apply",
    isMatched: true
  },
  {
    id: 3,
    name: "UP Post Matric Scholarship",
    description: "Scholarship for postgraduate and undergraduate students.",
    score: 72,
    benefit: "Variable Scholarship",
    status: "Missing Documents",
    isMatched: true
  }
];

export const allSchemes = [
  ...topSchemes,
  {
    id: 4,
    name: "PMAY-G (Pradhan Mantri Awas Yojana - Gramin)",
    description: "Housing for all in rural areas.",
    score: 45,
    benefit: "₹1,20,000",
    status: "Not Eligible",
    isMatched: false
  },
  {
    id: 5,
    name: "Stand Up India",
    description: "Bank loans for SC/ST and women borrowers.",
    score: 30,
    benefit: "₹10 Lakh - ₹1 Crore",
    status: "Not Eligible",
    isMatched: false
  }
];

export const documentStatus = [
  { id: 'doc-1', name: 'Aadhaar Card', status: 'verified', message: 'Verified' },
  { id: 'doc-2', name: 'Income Certificate', status: 'verified', message: 'Verified' },
  { id: 'doc-3', name: 'Marksheet (10th/12th)', status: 'missing', message: 'Missing' },
  { id: 'doc-4', name: 'Bank Passbook', status: 'pending', message: 'Upload Required' }
];

export const applicationSnapshot = [
  { id: 'app-6721', schemeName: 'Pre-Matric Scholarship', status: 'Pending', date: '2 days ago' },
  { id: 'app-5930', schemeName: 'Free Laptop Program', status: 'Approved', date: '1 month ago' },
];

export const aiAssistantPrompts = [
  "Which schemes can I apply for?",
  "What documents am I missing?",
  "Check my application status",
  "How to get income certificate?"
];
