import { Utensils, Wifi, Sofa } from 'lucide-react';
import { amenities } from '../../../data/flightAmen';
import { amenitiesConfig } from '../../../data/flightAmen';
import type { AmenityType } from '../../../data/flightAmen';
interface AmenityItem {
  type: AmenityType;
  title: string;
  description: string;
};

interface AmenitiesFeaturesProps {
  amenitiesList: AmenityItem[];
}

export const AmenitiesFeatures: React.FC<AmenitiesFeaturesProps> = ({ amenitiesList }) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {amenitiesList.map((amenity, index) => {
        const config = amenitiesConfig[amenity.type as keyof typeof amenitiesConfig];
        if (!config) return null;

        const IconComponent = config.icon;

        return (
          <div key={index} className=" flex items-center gap-4 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <IconComponent className="w-6 h-6 text-red" />
            <div>
              <p className="font-bold text-sm text-gray-900">{amenity.title}</p>
              <p className="text-[11px] text-gray-500">{amenity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}