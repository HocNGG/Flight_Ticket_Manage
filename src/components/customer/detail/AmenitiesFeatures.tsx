import { Utensils, Wifi, Sofa } from 'lucide-react';

export const AmenitiesFeatures = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-[2rem] p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red">
          <Utensils className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">Premium Dining</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">Multi-course gourmet menu featuring local seasonal ingredients.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red">
          <Wifi className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">SkyHigh Wi-Fi</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">Complimentary high-speed streaming for the entire duration.</p>
      </div>

      <div className="bg-white rounded-[2rem] p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 text-red">
          <Sofa className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-gray-900 mb-2">Flatbed Comfort</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">Ergonomic 180-degree lie-flat seats with lumbar support.</p>
      </div>
    </div>
  );
};
