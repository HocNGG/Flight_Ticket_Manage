import {Utensils, Wifi,Bed, ShieldCheck } from "lucide-react";

export const amenitiesConfig = {
  dining: { icon: Utensils },
  wifi: { icon: Wifi },
  comfort: { icon: Bed },
  safety: { icon: ShieldCheck }
};

export type AmenityType = keyof typeof amenitiesConfig;