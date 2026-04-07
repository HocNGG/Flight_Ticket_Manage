import { Luggage, Wallet, Wifi, Utensils } from "lucide-react";

export const policyConfig = {
  baggage: {
    icon: Luggage,
    title: "Baggage Policy"
  },
  refund: {
    icon: Wallet,
    title: "Refund Policy"
  },
};

export type PolicyType = keyof typeof policyConfig;

export const policies: Array<{
  type: PolicyType;
  title: string;
  description: string;
  status: string;
}> = [
  {
    type: "baggage",
    title: "Checked Baggage",
    description: "2 pieces x 23kg each (50lbs) per passenger.",
    status: "INCLUDED"
  },
  {
    type: "baggage",
    title: "Carry-on & Personal Item",
    description: "Max 12kg total. Fits in overhead bin or under seat.",
    status: "INCLUDED"
  },
 
];
