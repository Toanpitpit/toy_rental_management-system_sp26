/**
 * ============================================
 * MOCK DATA - ToyRent
 * ============================================
 * Dữ liệu mẫu cho toàn bộ ứng dụng.
 * Khi tích hợp API thật, chỉ cần thay thế các hàm fetch
 * bên dưới bằng API call thực tế, cấu trúc object giữ nguyên.
 * ============================================
 */

// ===================== HERO BANNER SLIDES =====================
export const heroSlides = [
  {
    id: 1,
    tag: "NEW ARRIVALS 2026",
    title: "WE PROVIDE",
    highlight: "BEST TOYS",
    subtitle:
      "Rent premium toys for your little ones — safe, fun and affordable. New collections updated weekly!",
    cta: "Browse Toys",
    overlay: "rgba(0,0,0,0.52)",
    bgImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
  },
  {
    id: 2,
    tag: "DREAM IT, BUILD IT",
    title: "ENJOY UP TO",
    highlight: "50% OFF",
    subtitle:
      "Special rental discounts on LEGO sets, puzzles and educational toys this season.",
    cta: "Browse Toys",
    overlay: "rgba(44, 120, 55, 0.65)",
    bgImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
  },
  {
    id: 3,
    tag: "SAFE & TRUSTED",
    title: "FUN FOR EVERY",
    highlight: "CHILD",
    subtitle:
      "Carefully sanitized and inspected toys delivered to your door. Happiness guaranteed.",
    cta: "Browse Toys",
    overlay: "rgba(20, 60, 100, 0.60)",
    bgImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200",
  },
];

// ===================== CATEGORIES =====================
export const categories = [
  { _id: "cat1", icon: "🧩", name: "Educational Toys", toyCount: 48 },
  { _id: "cat2", icon: "🧱", name: "LEGO", toyCount: 62 },
  { _id: "cat3", icon: "🎯", name: "Puzzle Games", toyCount: 35 },
  { _id: "cat4", icon: "🚗", name: "RC Toys", toyCount: 27 },
  { _id: "cat5", icon: "🏃", name: "Outdoor Toys", toyCount: 41 },
  { _id: "cat6", icon: "👶", name: "Baby Toys", toyCount: 53 },
];

// ===================== POPULAR TOYS =====================
export const popularToys = [
  {
    _id: "toy1",
    name: "Fluffy Bunny Plush",
    pricePerHour: 5,
    rating: 4.8,
    reviewCount: 124,
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1652636347412-46f47856f540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy2",
    name: "LEGO Classic Set",
    pricePerHour: 8,
    rating: 4.9,
    reviewCount: 210,
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1610213880945-9b020ccc2843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy3",
    name: "Colorful Puzzle 100pcs",
    pricePerHour: 4,
    rating: 4.7,
    reviewCount: 87,
    tag: null,
    image:
      "https://images.unsplash.com/photo-1684773585761-fde68b4ece42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy4",
    name: "Wooden Learning Toys",
    pricePerHour: 6,
    rating: 4.8,
    reviewCount: 143,
    tag: "Educational",
    image:
      "https://images.unsplash.com/photo-1725297951080-47e72ef3f788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy5",
    name: "RC Speed Car",
    pricePerHour: 10,
    rating: 4.6,
    reviewCount: 98,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1769244444909-f75895a22aed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy6",
    name: "Baby Sensory Set",
    pricePerHour: 5,
    rating: 4.9,
    reviewCount: 176,
    tag: "Popular",
    image:
      "https://images.unsplash.com/photo-1655087751252-8d29e1bb6b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy7",
    name: "Kids Action Figures",
    pricePerHour: 7,
    rating: 4.7,
    reviewCount: 65,
    tag: null,
    image:
      "https://images.unsplash.com/photo-1597347996193-7771c14ae452?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    _id: "toy8",
    name: "Outdoor Playset",
    pricePerHour: 12,
    rating: 4.8,
    reviewCount: 112,
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1766754434389-81842325b225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
];

// ===================== FEATURED TOYS =====================
export const featuredToys = [
  {
    _id: "feat1",
    name: "Giant LEGO Technic Set",
    description:
      "Build incredible machines with 1200+ pieces. Perfect for ages 8 and up. Sparks creativity and engineering thinking.",
    pricePerHour: 15,
    originalPricePerDay: 22,
    rating: 4.9,
    reviewCount: 348,
    badge: "SALE",
    badgeColor: "#e53e3e",
    image:
      "https://images.unsplash.com/photo-1610213880945-9b020ccc2843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
  {
    _id: "feat2",
    name: "Wooden Montessori Playset",
    description:
      "Award-winning educational wooden toy set that develops motor skills, colors, and counting — ideal for toddlers 2–5.",
    pricePerHour: 8,
    originalPricePerDay: null,
    rating: 4.8,
    reviewCount: 215,
    badge: "Top Rated",
    badgeColor: "#3cb14a",
    image:
      "https://images.unsplash.com/photo-1725297951080-47e72ef3f788?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
  {
    _id: "feat3",
    name: "Pro RC Racing Car",
    description:
      "High-speed remote control car with rechargeable battery. Up to 30km/h. Great for outdoor and indoor racing fun.",
    pricePerHour: 12,
    originalPricePerDay: 18,
    rating: 4.7,
    reviewCount: 164,
    badge: "SALE",
    badgeColor: "#e53e3e",
    image:
      "https://images.unsplash.com/photo-1769244444909-f75895a22aed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  },
];

// ===================== PERKS / WHY CHOOSE US =====================
export const perks = [
  {
    id: 1,
    iconName: "Award",
    title: "Great Value",
    description: "Affordable daily rental rates so kids can enjoy more for less.",
  },
  {
    id: 2,
    iconName: "Truck",
    title: "Free Delivery",
    description: "Free delivery and pickup for orders over $30. Fast and reliable.",
  },
  {
    id: 3,
    iconName: "ShieldCheck",
    title: "Safe & Sanitized",
    description:
      "All toys are carefully cleaned and safety-checked before every rental.",
  },
  {
    id: 4,
    iconName: "CreditCard",
    title: "Secure Payment",
    description: "Multiple secure payment options. Your data is always protected.",
  },
  {
    id: 5,
    iconName: "Clock",
    title: "24H Support",
    description: "Our team is ready to help you any time, day or night.",
  },
];

// ===================== NAV LINKS =====================
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Toys", href: "/toys" },
  { label: "FAQ & Services", href: "/faq" },
];

// ===================== FOOTER LINKS =====================
export const footerCompanyLinks = [
  "About Us",
  "Careers",
  "Contact",
  "Blog",
  "Partners",
];
export const footerQuickLinks = [
  "All Toys",
  "Categories",
  "Popular Toys",
  "New Arrivals",
  "Special Offers",
];
export const footerServiceLinks = [
  "Rental Process",
  "Delivery & Pickup",
  "FAQ",
  "Safety Standards",
  "Returns Policy",
];
export const footerPolicyLinks = [
  "Privacy Policy",
  "Terms & Conditions",
  "Cookie Policy",
];

export const contactInfo = {
  email: "support@toyrent.com",
  phone: "+1 (800) 555-TOYS",
  hours: "Thứ 2 – Thứ 7: 9:00 – 18:00",
};
