import {Wifi,Utensils,ShieldCheck } from "lucide-react";

export const enhanceConfig = {
  wifi: {
    icon: Wifi
  },
  utensils: {
    icon: Utensils
  },
  shield: {
    icon: ShieldCheck
  }
};

export const enhanceList: Array<{
  type: keyof typeof enhanceConfig;
  title: string;
  description: string;
    price?: number;
}> = [
  {
    type: "wifi",
    title: "In-Flight Wi-Fi",
    description: "Stay connected with our high-speed Wi-Fi, perfect for streaming and browsing.",
    price: 15
  },
    {
    type: "utensils",
    title: "Gourmet Dining",
    description: "Enjoy a multi-course meal crafted by top chefs, featuring local and seasonal ingredients.",
    price: 24
  },
  {
    type: "shield",
    title: "Enhanced Safety",
    description: "Experience peace of mind with our comprehensive safety measures and protocols.",
    price: 10
  }
];