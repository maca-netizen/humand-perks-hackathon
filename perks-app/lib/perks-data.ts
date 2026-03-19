import type { Perk } from "@/components/perk-card"

export const perks: Perk[] = [
  {
    id: "1",
    name: "Gourmet Lunch Experience",
    merchant: "Cafe Central",
    category: "food",
    price: 15,
    originalValue: 25,
    description: "Enjoy a delicious gourmet lunch with a drink. Choose from our daily specials crafted by our expert chef. Valid Monday to Friday.",
    location: "Downtown",
    featured: true,
  },
  {
    id: "2",
    name: "Premium Coffee & Pastry",
    merchant: "Bean & Brew",
    category: "food",
    price: 8,
    originalValue: 12,
    description: "Start your day right with a premium coffee and freshly baked pastry of your choice.",
    location: "Multiple",
  },
  {
    id: "3",
    name: "Yoga Class Pass",
    merchant: "Zen Studio",
    category: "wellness",
    price: 25,
    originalValue: 40,
    description: "One-hour yoga session suitable for all levels. Includes mat rental and access to changing facilities.",
    location: "Midtown",
    featured: true,
  },
  {
    id: "4",
    name: "Spa Day - 60min Massage",
    merchant: "Serenity Spa",
    category: "wellness",
    price: 50,
    originalValue: 80,
    description: "Relax and rejuvenate with a 60-minute full body massage. Choose from Swedish, deep tissue, or aromatherapy.",
    location: "Uptown",
  },
  {
    id: "5",
    name: "Movie Night for Two",
    merchant: "CinePlex",
    category: "entertainment",
    price: 20,
    originalValue: 30,
    description: "Two movie tickets to any regular screening. Includes medium popcorn to share.",
    location: "Mall Plaza",
    featured: true,
  },
  {
    id: "6",
    name: "Escape Room Adventure",
    merchant: "Mystery Rooms",
    category: "entertainment",
    price: 35,
    originalValue: 50,
    description: "Test your puzzle-solving skills in one of our themed escape rooms. For 2-4 players.",
    location: "Old Town",
  },
  {
    id: "7",
    name: "50 Creditos Shopping",
    merchant: "MegaStore",
    category: "shopping",
    price: 40,
    originalValue: 50,
    description: "50 creditos para usar en cualquier producto. Valido por 90 dias desde la activacion.",
    location: "All stores",
  },
  {
    id: "8",
    name: "Fitness Gear Voucher",
    merchant: "SportZone",
    category: "shopping",
    price: 30,
    originalValue: 40,
    description: "40 creditos para ropa y equipamiento fitness. Ideal para renovar tu gear de entrenamiento.",
    location: "Online & stores",
  },
  {
    id: "9",
    name: "Sushi Dinner Set",
    merchant: "Sakura Japanese",
    category: "food",
    price: 28,
    originalValue: 45,
    description: "Premium sushi dinner set including chef's selection of 12 pieces, miso soup, and green tea.",
    location: "Harbor District",
  },
  {
    id: "10",
    name: "Gym Day Pass",
    merchant: "FitLife Gym",
    category: "wellness",
    price: 12,
    originalValue: 20,
    description: "Full day access to gym facilities including pool, sauna, and all fitness classes.",
    location: "Multiple",
  },
  {
    id: "11",
    name: "Concert Tickets",
    merchant: "Live Arena",
    category: "entertainment",
    price: 45,
    originalValue: 65,
    description: "Access to select upcoming concerts. Check available shows when redeeming.",
    location: "Arena District",
  },
  {
    id: "12",
    name: "Book Store Credit",
    merchant: "PageTurner Books",
    category: "shopping",
    price: 20,
    originalValue: 25,
    description: "25 creditos para libros, papeleria o cafe en cualquier local PageTurner.",
    location: "All stores",
  },
]

export function getPerkById(id: string): Perk | undefined {
  return perks.find(p => p.id === id)
}

export function getPerksByCategory(category: string): Perk[] {
  if (category === "all" || !category) return perks
  return perks.filter(p => p.category === category)
}

export function getFeaturedPerks(): Perk[] {
  return perks.filter(p => p.featured)
}
