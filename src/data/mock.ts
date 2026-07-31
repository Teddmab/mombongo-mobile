export type Category = "agriculture" | "logistique" | "export";

export interface Product {
  id: string;
  name: string;
  icon: string;
  minInvest: number;
  duration: number;
  roi: number;
  location: string;
  category: Category;
  stock: number;
  unit: string;
  image?: string;
  available: boolean;
  description?: string;
  farmer?: string;
}

export interface Investment {
  id: string;
  productId: string;
  name: string;
  location: string;
  amount: number;
  currency: "USD" | "FC";
  roi: number;
  progress: number;
  daysLeft: number;
  harvestDate: string;
  badge?: "BOURSE" | "EXPORT";
  meta?: string;
  category?: string;
}

export interface ActivityItem {
  id: string;
  kind: "profit" | "opportunity" | "report" | "course";
  title: string;
  subtitle: string;
  amount?: string;
  cta?: string;
  time: string;
  tone: "green" | "amber" | "blue";
}

export const products: Product[] = [
  { id: "p1", name: "Pastèques", icon: "🍉", minInvest: 200, duration: 45, roi: 22, location: "Songololo", category: "agriculture", stock: 180, unit: "bacs", available: true, image: "https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=400&h=220&q=80", farmer: "Jean-Baptiste Mwamba", description: "Culture de pastèques en pleine saison sur 5 hectares fertiles à Songololo." },
  { id: "p2", name: "Tomates", icon: "🍅", minInvest: 150, duration: 30, roi: 18, location: "Matadi", category: "agriculture", stock: 95, unit: "bacs", available: true, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&h=220&q=80", farmer: "Marie Lutumba", description: "Tomates fraîches destinées aux marchés de Matadi et Kinshasa." },
  { id: "p3", name: "Concombres", icon: "🥒", minInvest: 100, duration: 40, roi: 20, location: "Boma", category: "agriculture", stock: 140, unit: "bacs", available: true, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&h=220&q=80", farmer: "Pierre Nzuzi", description: "Production de concombres pour les marchés locaux." },
  { id: "p4", name: "Oignons", icon: "🧅", minInvest: 250, duration: 60, roi: 15, location: "Kinshasa", category: "agriculture", stock: 200, unit: "kg", available: true, farmer: "Coopérative Maluku", description: "Oignons rouges cultivés en périphérie de Kinshasa." },
  { id: "p5", name: "Aubergines", icon: "🍆", minInvest: 120, duration: 35, roi: 17, location: "Songololo", category: "agriculture", stock: 80, unit: "bacs", available: true, farmer: "Jean-Baptiste Mwamba", description: "Aubergines violettes pour le marché frais." },
  { id: "p6", name: "Café export", icon: "☕", minInvest: 500, duration: 90, roi: 28, location: "Kivu", category: "export", stock: 500, unit: "kg", available: true, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&h=220&q=80", farmer: "Coopérative Kivu Arabica", description: "Café Arabica de haute altitude exporté vers la Chine." },
  { id: "p7", name: "Cacao bio", icon: "🍫", minInvest: 400, duration: 120, roi: 32, location: "Bas-Congo", category: "export", stock: 300, unit: "kg", available: true, farmer: "Coopérative Mayombe", description: "Cacao biologique certifié, marché européen." },
  { id: "p8", name: "Sésame", icon: "🌾", minInvest: 180, duration: 50, roi: 21, location: "Kongo Central", category: "export", stock: 250, unit: "kg", available: true, farmer: "Coopérative Mbanza-Ngungu" },
  { id: "p9", name: "Manioc", icon: "🌿", minInvest: 80, duration: 25, roi: 14, location: "Kinshasa", category: "agriculture", stock: 500, unit: "sacs", available: true, farmer: "Coopérative Maluku" },
  { id: "p10", name: "Transport Songololo", icon: "🚛", minInvest: 50, duration: 8, roi: 20, location: "Route Nat. 1", category: "logistique", stock: 3, unit: "voyages", available: true, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=400&h=220&q=80", farmer: "Transport Mokili" },
  { id: "p11", name: "Poissons séchés", icon: "🐟", minInvest: 200, duration: 20, roi: 16, location: "Boma", category: "agriculture", stock: 120, unit: "caisses", available: true, farmer: "Pêcherie Kalamu" },
  { id: "p12", name: "Arachides export", icon: "🥜", minInvest: 150, duration: 45, roi: 19, location: "Kongo Central", category: "export", stock: 400, unit: "sacs", available: true, farmer: "Coopérative Mbanza-Ngungu" },
];

export const investments: Investment[] = [
  { id: "i1", productId: "p1", name: "Pastèques — Songololo", location: "Songololo", amount: 1200, currency: "USD", roi: 22, progress: 58, daysLeft: 45, harvestDate: "15 mai", category: "agriculture" },
  { id: "i2", productId: "p2", name: "Tomates — Matadi", location: "Matadi", amount: 800, currency: "USD", roi: 18, progress: 32, daysLeft: 63, harvestDate: "3 juin", category: "agriculture" },
  { id: "i3", productId: "p10", name: "Transport Bourse #041", location: "Route Nat. 1", amount: 50000, currency: "FC", roi: 20, progress: 80, daysLeft: 5, harvestDate: "Comm. J+5", badge: "BOURSE", meta: "Bacs tomates · Commercialisation", category: "logistique" },
];

export const activity: ActivityItem[] = [
  { id: "a1", kind: "profit", title: "Profit distribué", subtitle: "Concombres Boma · Tranche 1", amount: "+$145", time: "Aujourd'hui 14:32", tone: "green" },
  { id: "a2", kind: "opportunity", title: "Nouvelle opportunité", subtitle: "Oignons 3ha · ROI 19%", cta: "Voir →", time: "Il y a 2h", tone: "amber" },
  { id: "a3", kind: "report", title: "Rapport agent reçu", subtitle: "Mwamba J.B. · Songololo", cta: "Consulter", time: "Il y a 5h", tone: "green" },
  { id: "a4", kind: "course", title: "Academia : Nouveau cours", subtitle: "Gestion Financière · Module 3", cta: "Commencer", time: "Hier", tone: "blue" },
];

export function getFeaturedProducts(): Product[] {
  return products.slice(0, 4);
}

export interface BourseTicker {
  symbol: string;
  price: string;
  change: number;
}

export const bourseTicker: BourseTicker[] = [
  { symbol: "TOM-MAT", price: "1,250 FC/kg", change: 2.4 },
  { symbol: "PAST-SGL", price: "850 FC/kg", change: -1.1 },
  { symbol: "CAF-KIV", price: "$4.20/lb", change: 3.8 },
  { symbol: "CAC-BC", price: "$3.10/kg", change: 1.6 },
  { symbol: "MAN-KIN", price: "320 FC/kg", change: 0.5 },
  { symbol: "OIG-KIN", price: "1,800 FC/kg", change: -0.7 },
  { symbol: "SES-KC", price: "2,400 FC/kg", change: 4.2 },
  { symbol: "ARA-KC", price: "1,950 FC/kg", change: 1.2 },
];

export interface BourseOpportunity {
  id: string;
  title: string;
  type: "transport" | "stockage" | "transformation";
  origin: string;
  destination?: string;
  volume: string;
  price: string;
  commission: number;
  duration: string;
  spotsLeft: number;
  spotsTotal: number;
}

export const bourseOpportunities: BourseOpportunity[] = [
  { id: "b1", title: "Transport Tomates Matadi → Kinshasa", type: "transport", origin: "Matadi", destination: "Kinshasa", volume: "120 bacs", price: "75,000 FC", commission: 20, duration: "5 jours", spotsLeft: 3, spotsTotal: 8 },
  { id: "b2", title: "Stockage Manioc Kinshasa", type: "stockage", origin: "Kinshasa", volume: "200 sacs", price: "40,000 FC", commission: 12, duration: "30 jours", spotsLeft: 6, spotsTotal: 10 },
  { id: "b3", title: "Transformation Café Kivu", type: "transformation", origin: "Goma", volume: "500 kg", price: "$1,200", commission: 28, duration: "21 jours", spotsLeft: 2, spotsTotal: 5 },
  { id: "b4", title: "Transport Pastèques Songololo → Boma", type: "transport", origin: "Songololo", destination: "Boma", volume: "80 bacs", price: "55,000 FC", commission: 18, duration: "3 jours", spotsLeft: 4, spotsTotal: 6 },
  { id: "b5", title: "Stockage Arachides Mbanza-Ngungu", type: "stockage", origin: "Mbanza-Ngungu", volume: "300 sacs", price: "60,000 FC", commission: 14, duration: "45 jours", spotsLeft: 5, spotsTotal: 8 },
  { id: "b6", title: "Transport Cacao Mayombe → Matadi", type: "transport", origin: "Mayombe", destination: "Matadi", volume: "200 kg", price: "$450", commission: 22, duration: "4 jours", spotsLeft: 1, spotsTotal: 4 },
];

export interface Instructor {
  name: string;
  title: string;
  image: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  modules: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  progress: number;
  icon: string;
  image?: string;
  heroImage?: string;
  instructor?: Instructor;
  description: string;
  isPremium: boolean;
  previewModules: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export interface CourseModule {
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  content?: string;
  quiz?: QuizQuestion[];
}

export const courses: Course[] = [
  {
    id: "c1", title: "Gestion Financière de la Ferme", category: "Finance", duration: "3h 20min", modules: 6, level: "Débutant", progress: 45, icon: "💰",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "Prof. Patrice Kalala", title: "Économie Agricole · UNIKIN · 4.9 ★", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Apprenez à gérer la trésorerie, planifier les récoltes et calculer le ROI.", isPremium: false, previewModules: 6,
  },
  {
    id: "c2", title: "Agriculture Biologique en RDC", category: "Production", duration: "5h 10min", modules: 8, level: "Intermédiaire", progress: 0, icon: "🌱",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "Dr. Sylvie Nkongolo", title: "Agronome Bio · Univ. Lubumbashi · 4.8 ★", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Techniques bio adaptées au climat congolais.", isPremium: true, previewModules: 2,
  },
  {
    id: "c3", title: "Export Café & Cacao", category: "Commerce", duration: "4h 00min", modules: 7, level: "Avancé", progress: 14, icon: "☕",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "M. Joseph Mutombo", title: "Expert Export · OPEC-RDC · 4.7 ★", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Procédures douanières et commerce international.", isPremium: false, previewModules: 7,
  },
  {
    id: "c4", title: "Lutte contre les nuisibles", category: "Production", duration: "2h 15min", modules: 4, level: "Débutant", progress: 100, icon: "🐛",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "Prof. Théodore Kyungu", title: "Phytopathologie · ISEA Kisangani · 4.9 ★", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Méthodes naturelles de protection des cultures.", isPremium: false, previewModules: 4,
  },
  {
    id: "c5", title: "Marketing produits frais", category: "Commerce", duration: "1h 50min", modules: 3, level: "Intermédiaire", progress: 0, icon: "📣",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "Mme. Christine Bakajika", title: "Marketing Agricole · UNIKIN · 4.8 ★", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Vendre mieux sur les marchés locaux.", isPremium: true, previewModules: 1,
  },
  {
    id: "c6", title: "Coopératives et Gouvernance", category: "Gestion", duration: "3h 45min", modules: 5, level: "Intermédiaire", progress: 0, icon: "🤝",
    image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=300&h=200&q=80",
    heroImage: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&h=500&q=80",
    instructor: { name: "Prof. Emmanuel Tshimanga", title: "Droit Coopératif · UNIKIN · 4.9 ★", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80" },
    description: "Construire des coopératives durables.", isPremium: true, previewModules: 1,
  },
];

export const courseModules: Record<string, CourseModule[]> = {
  c1: [
    { title: "Introduction & Objectifs du cours", type: "video", duration: "22 min" },
    {
      title: "Comprendre la trésorerie agricole", type: "reading", duration: "18 min",
      content: "La trésorerie représente l'ensemble des flux financiers de votre exploitation. Une bonne gestion vous permet d'anticiper les périodes creuses et de planifier vos investissements sereinement.\n\nÉtablissez un tableau de suivi mensuel distinguant les entrées (ventes, subventions) des sorties (semences, main-d'œuvre, transport). Cela vous donnera une vision claire sur 6 à 12 mois.\n\nL'erreur la plus courante est de confondre profit et trésorerie. Vous pouvez être rentable sur le papier et manquer de liquidités pour payer vos fournisseurs.",
    },
    {
      title: "Quiz : Concepts de trésorerie", type: "quiz", duration: "10 min",
      quiz: [
        { question: "Qu'est-ce que la trésorerie d'une exploitation ?", options: ["La valeur des terres", "Les flux financiers entrants et sortants", "Le stock de semences", "Le revenu annuel brut"], correct: 1 },
        { question: "Un budget prévisionnel vous permet de :", options: ["Calculer vos impôts", "Anticiper dépenses et recettes sur 12 mois", "Choisir vos cultures", "Fixer vos prix de vente"], correct: 1 },
      ],
    },
    { title: "Planifier les récoltes & flux saisonniers", type: "video", duration: "28 min" },
    {
      title: "Calculer le ROI agricole", type: "reading", duration: "20 min",
      content: "Le retour sur investissement (ROI) mesure la rentabilité de chaque hectare cultivé. La formule est simple : (Gains − Coûts) ÷ Coûts × 100.\n\nExemple : si vous dépensez 300$ pour produire du manioc et le vendez 520$, votre ROI est de 73%. Comparez ce chiffre entre vos différentes cultures pour orienter vos choix.\n\nN'oubliez pas d'inclure votre propre temps de travail dans les coûts, valorisé au salaire minimum local. Beaucoup d'agriculteurs sous-estiment cette charge.",
    },
    {
      title: "Évaluation finale", type: "quiz", duration: "25 min",
      quiz: [
        { question: "Le ROI (retour sur investissement) se calcule :", options: ["(Gains − Coûts) ÷ Coûts × 100", "Gains ÷ Nombre de jours", "Coûts × 100 ÷ Gains", "Gains + Coûts"], correct: 0 },
        { question: "Si vos coûts sont 200$ et vos ventes 350$, votre ROI est :", options: ["35%", "57.5%", "75%", "150%"], correct: 2 },
        { question: "Quelle période couvre typiquement un budget prévisionnel agricole ?", options: ["1 semaine", "1 mois", "1 saison à 1 an", "5 ans"], correct: 2 },
      ],
    },
  ],
};

export function getCourseModules(course: Course): CourseModule[] {
  const mapped = courseModules[course.id];
  if (mapped?.length) return mapped;
  return Array.from({ length: course.modules }, (_, i) => ({
    title: `Module ${i + 1}`,
    type: (["video", "reading", "quiz"] as const)[i % 3],
    duration: `${12 + i * 4} min`,
  }));
}

export interface Transaction {
  id: string;
  kind: "deposit" | "withdrawal" | "profit" | "investment" | "fee";
  label: string;
  amount: number;
  currency: "USD" | "FC";
  date: string;
  status: "completed" | "pending" | "failed";
}

export const transactions: Transaction[] = [
  { id: "t1", kind: "profit", label: "Profit — Pastèques Songololo", amount: 145, currency: "USD", date: "Aujourd'hui, 14:32", status: "completed" },
  { id: "t2", kind: "investment", label: "Investissement — Tomates Matadi", amount: 200, currency: "USD", date: "Hier, 10:15", status: "completed" },
  { id: "t3", kind: "deposit", label: "Dépôt Wallet", amount: 500, currency: "USD", date: "18 mai 2026", status: "completed" },
  { id: "t4", kind: "profit", label: "Profit — Transport Bourse #038", amount: 12000, currency: "FC", date: "16 mai 2026", status: "completed" },
  { id: "t5", kind: "investment", label: "Investissement — Café Kivu", amount: 300, currency: "USD", date: "14 mai 2026", status: "completed" },
  { id: "t6", kind: "withdrawal", label: "Retrait vers M-Pesa", amount: 100, currency: "USD", date: "10 mai 2026", status: "completed" },
  { id: "t7", kind: "fee", label: "Frais de plateforme", amount: 2500, currency: "FC", date: "1 mai 2026", status: "completed" },
  { id: "t8", kind: "deposit", label: "Dépôt Wallet", amount: 1000, currency: "USD", date: "28 avr. 2026", status: "completed" },
];

export interface Notification {
  id: string;
  kind: "profit" | "opportunity" | "report" | "course" | "system";
  title: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", kind: "profit", title: "Profit distribué", body: "$145 versés sur votre wallet Mombongo", time: "14:32", date: "Aujourd'hui", read: false },
  { id: "n2", kind: "opportunity", title: "Nouvelle opportunité Bourse", body: "Transport Oignons · Goma → Kinshasa · Commission 19%", time: "12:10", date: "Aujourd'hui", read: false },
  { id: "n3", kind: "report", title: "Rapport agent reçu", body: "Théodore Kyungu · Photos terrain disponibles", time: "09:45", date: "Aujourd'hui", read: false },
  { id: "n4", kind: "course", title: "Academia · Nouveau module", body: "Gestion Financière · Module 4 débloqué", time: "Hier", date: "Hier", read: true },
  { id: "n5", kind: "system", title: "KYC en attente", body: "Complétez la vérification d'identité pour accéder à tous les services", time: "Il y a 2j", date: "Il y a 2 jours", read: true },
];

// ─── FINANCEMENT / RÔLES ────────────────────────────────────────────────────

export interface Farmer {
  id: string;
  name: string;
  location: string;
  surface: number;
  crops: string[];
  experience: number;
  trustScore: number;
  needed: number;
  raised: number;
  story: string;
  avatar: string;
  image?: string;
}

export const farmers: Farmer[] = [
  { id: "f1", name: "Jean-Baptiste Mwamba", location: "Songololo, Kongo Central", surface: 5, crops: ["Pastèques", "Aubergines"], experience: 12, trustScore: 92, needed: 3500, raised: 2280, story: "Agriculteur depuis 12 ans, JB cherche à étendre sa culture de pastèques sur 2 hectares supplémentaires.", avatar: "🧑🏾‍🌾", image: "https://images.unsplash.com/photo-1529656958924-5bdf6e18d042?auto=format&fit=crop&w=400&h=400&q=80" },
  { id: "f2", name: "Marie Lutumba", location: "Matadi, Kongo Central", surface: 3, crops: ["Tomates", "Concombres"], experience: 8, trustScore: 88, needed: 2200, raised: 1540, story: "Marie produit des tomates de qualité pour les marchés de Matadi.", avatar: "👩🏾‍🌾", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&h=400&q=80" },
  { id: "f3", name: "Pierre Nzuzi", location: "Boma, Kongo Central", surface: 4, crops: ["Concombres", "Aubergines"], experience: 15, trustScore: 95, needed: 4000, raised: 3600, story: "Vétéran de la coopérative, Pierre forme aussi les jeunes agriculteurs.", avatar: "👨🏾‍🌾", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80" },
  { id: "f4", name: "Coopérative Maluku", location: "Maluku, Kinshasa", surface: 25, crops: ["Manioc", "Oignons"], experience: 20, trustScore: 90, needed: 8500, raised: 4200, story: "Une coopérative de 18 membres en périphérie de Kinshasa.", avatar: "👥", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80" },
  { id: "f5", name: "Coopérative Kivu Arabica", location: "Goma, Nord-Kivu", surface: 40, crops: ["Café Arabica"], experience: 25, trustScore: 96, needed: 12000, raised: 9800, story: "Café d'altitude exporté vers la Chine et l'Europe.", avatar: "☕", image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=400&h=400&q=80" },
];

export interface CropTask {
  id: string;
  title: string;
  date: string;
  done: boolean;
  type: "irrigation" | "fertilisation" | "traitement" | "récolte" | "visite";
}

export const cropTasks: CropTask[] = [
  { id: "ct1", title: "Irrigation parcelle A", date: "Demain", done: false, type: "irrigation" },
  { id: "ct2", title: "Traitement fongicide", date: "3 juin", done: false, type: "traitement" },
  { id: "ct3", title: "Visite agent terrain", date: "5 juin", done: false, type: "visite" },
  { id: "ct4", title: "Récolte partielle est", date: "15 juin", done: false, type: "récolte" },
  { id: "ct5", title: "Fertilisation NPK", date: "28 mai", done: true, type: "fertilisation" },
  { id: "ct6", title: "Irrigation parcelle B", date: "25 mai", done: true, type: "irrigation" },
];

export interface FarmerAlert {
  id: string;
  kind: "weather" | "market" | "agent" | "payment";
  title: string;
  body: string;
  time: string;
  urgent: boolean;
}

export const farmerAlerts: FarmerAlert[] = [
  { id: "fa1", kind: "payment", title: "Tranche reçue", body: "250 USD versés — Mobile Money", time: "Aujourd'hui 09:15", urgent: false },
  { id: "fa2", kind: "weather", title: "Alerte météo", body: "Fortes pluies prévues · Songololo, 2–3 juin", time: "Il y a 4h", urgent: true },
  { id: "fa3", kind: "market", title: "Prix Pastèques ↑", body: "850 FC/kg à la bourse — bon moment pour vendre", time: "Hier", urgent: false },
  { id: "fa4", kind: "agent", title: "Rapport confirmé", body: "Patrick Kadima a soumis votre fiche de suivi", time: "Il y a 3j", urgent: false },
];

export interface AgentFarmerCard {
  id: string;
  name: string;
  crop: string;
  region: string;
  stage: string;
  status: "ok" | "attention" | "urgent";
  lastVisit: string;
  daysToHarvest: number;
  surfaceHa: number;
}

export const agentFarmers: AgentFarmerCard[] = [
  { id: "af1", name: "Jean-Baptiste Mwamba", crop: "Pastèques", region: "Songololo", stage: "Floraison", status: "ok", lastVisit: "Il y a 3j", daysToHarvest: 14, surfaceHa: 5 },
  { id: "af2", name: "Marie Lutumba", crop: "Tomates", region: "Matadi", stage: "Fructification", status: "attention", lastVisit: "Il y a 8j", daysToHarvest: 21, surfaceHa: 2 },
  { id: "af3", name: "Pierre Nzuzi", crop: "Concombres", region: "Boma", stage: "Croissance", status: "urgent", lastVisit: "Il y a 15j", daysToHarvest: 30, surfaceHa: 3 },
  { id: "af4", name: "Élise Makiadi", crop: "Manioc", region: "Mbanza-Ngungu", stage: "Développement", status: "ok", lastVisit: "Hier", daysToHarvest: 45, surfaceHa: 4 },
  { id: "af5", name: "Robert Konde", crop: "Aubergines", region: "Songololo", stage: "Plantation", status: "ok", lastVisit: "Il y a 5j", daysToHarvest: 60, surfaceHa: 1.5 },
  { id: "af6", name: "Cécile Mbala", crop: "Oignons", region: "Kinshasa", stage: "Germination", status: "attention", lastVisit: "Il y a 10j", daysToHarvest: 55, surfaceHa: 2.5 },
];

export interface AgentReport {
  id: string;
  farmerName: string;
  crop: string;
  region: string;
  submittedAt: string;
  status: "validé" | "en attente" | "rejeté";
}

export const agentReports: AgentReport[] = [
  { id: "ar1", farmerName: "Jean-Baptiste Mwamba", crop: "Pastèques", region: "Songololo", submittedAt: "Hier 16:20", status: "validé" },
  { id: "ar2", farmerName: "Marie Lutumba", crop: "Tomates", region: "Matadi", submittedAt: "Il y a 3j", status: "en attente" },
  { id: "ar3", farmerName: "Élise Makiadi", crop: "Manioc", region: "Mbanza-Ngungu", submittedAt: "Il y a 5j", status: "validé" },
  { id: "ar4", farmerName: "Robert Konde", crop: "Aubergines", region: "Songololo", submittedAt: "Il y a 7j", status: "validé" },
  { id: "ar5", farmerName: "Pierre Nzuzi", crop: "Concombres", region: "Boma", submittedAt: "Il y a 15j", status: "rejeté" },
];

export interface MyListing {
  id: string;
  name: string;
  category: Category;
  icon: string;
  quantity: number;
  unit: string;
  pricePerUnitFC: number;
  region: string;
  harvestDate: string;
  status: "en vente" | "vendu" | "brouillon" | "expiré";
  investorsCount: number;
  fundingPct: number;
  targetUsd: number;
}

export const myListings: MyListing[] = [
  { id: "ml1", name: "Pastèques", category: "agriculture", icon: "🍉", quantity: 180, unit: "bacs", pricePerUnitFC: 850, region: "Songololo", harvestDate: "15 juin", status: "en vente", investorsCount: 3, fundingPct: 65, targetUsd: 1000 },
  { id: "ml2", name: "Concombres", category: "agriculture", icon: "🥒", quantity: 60, unit: "bacs", pricePerUnitFC: 720, region: "Songololo", harvestDate: "20 juin", status: "brouillon", investorsCount: 0, fundingPct: 0, targetUsd: 500 },
  { id: "ml3", name: "Aubergines", category: "agriculture", icon: "🍆", quantity: 80, unit: "bacs", pricePerUnitFC: 680, region: "Songololo", harvestDate: "30 juil.", status: "vendu", investorsCount: 5, fundingPct: 100, targetUsd: 700 },
];

export interface MerchantOrder {
  id: string;
  product: string;
  icon: string;
  supplier: string;
  region: string;
  quantity: number;
  unit: string;
  pricePerUnitFC: number;
  totalUsd: number;
  status: "en cours" | "livré" | "annulé" | "en attente";
  deliveryDate: string;
  category: Category;
}

export const merchantOrders: MerchantOrder[] = [
  { id: "mo1", product: "Tomates", icon: "🍅", supplier: "Marie Lutumba", region: "Matadi", quantity: 50, unit: "bacs", pricePerUnitFC: 1200, totalUsd: 300, status: "en cours", deliveryDate: "5 juin", category: "agriculture" },
  { id: "mo2", product: "Café Kivu", icon: "☕", supplier: "Coopérative Kivu Arabica", region: "Kivu", quantity: 200, unit: "kg", pricePerUnitFC: 8400, totalUsd: 800, status: "en attente", deliveryDate: "12 juin", category: "export" },
  { id: "mo3", product: "Manioc", icon: "🌿", supplier: "Coopérative Maluku", region: "Kinshasa", quantity: 100, unit: "sacs", pricePerUnitFC: 320, totalUsd: 180, status: "livré", deliveryDate: "28 mai", category: "agriculture" },
  { id: "mo4", product: "Arachides", icon: "🥜", supplier: "Coopérative Mbanza-Ngungu", region: "Kongo Central", quantity: 150, unit: "sacs", pricePerUnitFC: 1950, totalUsd: 420, status: "en cours", deliveryDate: "8 juin", category: "export" },
];

export type CulturalEventType = "planting" | "harvest" | "fertilizing" | "irrigation";

export interface CulturalEvent {
  id: string;
  cropType: string;
  eventType: CulturalEventType;
  monthStart: number;
  monthEnd: number;
  description: string;
}

export const MOCK_CULTURAL_EVENTS: CulturalEvent[] = [
  { id: "ce1", cropType: "Maïs", eventType: "planting", monthStart: 10, monthEnd: 11, description: "Semis de maïs — début saison sèche" },
  { id: "ce2", cropType: "Maïs", eventType: "harvest", monthStart: 3, monthEnd: 4, description: "Récolte maïs" },
  { id: "ce3", cropType: "Manioc", eventType: "planting", monthStart: 9, monthEnd: 10, description: "Bouturage manioc" },
  { id: "ce4", cropType: "Manioc", eventType: "harvest", monthStart: 9, monthEnd: 12, description: "Récolte manioc — 12 mois après semis" },
  { id: "ce5", cropType: "Soja", eventType: "planting", monthStart: 4, monthEnd: 5, description: "Semis soja grande saison" },
  { id: "ce6", cropType: "Soja", eventType: "harvest", monthStart: 8, monthEnd: 9, description: "Récolte soja" },
  { id: "ce7", cropType: "Cacao", eventType: "harvest", monthStart: 10, monthEnd: 2, description: "Grande récolte cacao (Oct – Fév)" },
  { id: "ce8", cropType: "Café Arabica", eventType: "harvest", monthStart: 10, monthEnd: 2, description: "Récolte café Arabica (Oct – Fév)" },
];
