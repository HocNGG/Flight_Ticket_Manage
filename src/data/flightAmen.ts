import {Utensils, Wifi,Bed } from "lucide-react";

export const amenitiesConfig = {
  dining: {
    icon: Utensils},
  wifi: {
    icon: Wifi},
  comfort: {
    icon: Bed},
};
export type AmenityType = keyof typeof amenitiesConfig;

export const amenities: Array<{
  type: AmenityType;
  title: string;
  description: string;
}> = [
    {
        type: "dining",
        title: "Premium Dining",
        description: "Multi-course gourmet menu featuring local seasonal ingredients."
    },
    {
        type: "wifi",
        title: "SkyHigh Wi-Fi",
        description: "Complimentary high-speed streaming for the entire duration."
    },
    {
        type: "comfort",
        title: "CloudSoft Comfort",
        description: "Ergonomic seats with 180-degree recline and plush bedding."
    },
    
];