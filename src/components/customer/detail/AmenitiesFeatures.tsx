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
  const columns = Math.min(amenitiesList.length, 4);
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  }[columns];

  return (
    <div className={`grid gap-4 ${gridColsClass}`}>
      {amenitiesList.map((amenity, index) => {
        const config = amenitiesConfig[amenity.type as keyof typeof amenitiesConfig];
        if (!config) return null;

        const IconComponent = config.icon;

        return (
          <div key={index} className=" flex flex-col items-center gap-4 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
            <IconComponent className="w-6 h-6 text-red" />
            <div className="text-center">
              <p className="font-bold text-sm text-gray-900">{amenity.title}</p>
              <p className="text-[11px] text-gray-500">{amenity.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}