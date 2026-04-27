import { ShieldCheck } from "lucide-react";
import { enhanceConfig } from "../../../data/filghtEnhance";
import type { ServiceOptionDTO } from "../../../types/option/serviceoption";

interface EnhanceProps {
    enhanceList:ServiceOptionDTO[];
    onAdd: (service: ServiceOptionDTO) => void;
    selectedServices: number[];
}

export const Enhance: React.FC<EnhanceProps> = ({ enhanceList, onAdd, selectedServices}) => {
    const columns = Math.min(enhanceList.length, 3);
    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
    }[columns];

    return (
        <div className={`grid gap-4 ${gridColsClass}`}>
            {enhanceList.map((service) => {
                const config = enhanceConfig[service.type as keyof typeof enhanceConfig];
                const IconComponent = config?.icon || ShieldCheck; 

                const isSelected = selectedServices.includes(service.serviceId);

                return (
                    <button
                        key={service.serviceId}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault(); // Ngăn chặn hành vi mặc định của form
                            e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt lên thẻ cha
                            onAdd(service);
                        }}
                        className={`
                            relative z-10 cursor-pointer pointer-events-auto flex flex-col items-center justify-center p-4 rounded-[1.5rem] 
                            transition-all duration-300 group border-2
                            ${isSelected 
                                ? 'bg-red border-red shadow-lg shadow-red/20 scale-[0.95]' 
                                : 'bg-[#f8f9fb] border-transparent hover:bg-white hover:border-gray-200'
                            }
                        `}
                    >
                        <IconComponent
                            className={`w-5 h-5 mb-2 transition-colors ${
                                isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                            }`}
                        />

                        <p className={`font-black text-[9px] text-center uppercase tracking-tighter mb-3 ${
                            isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                            {service.serviceName}
                        </p>

                        <div className={`
                            w-full py-1.5 rounded-xl text-[9px] font-black tracking-widest transition-all
                            ${isSelected ? 'bg-white text-red' : 'bg-white text-gray-900 border border-gray-50'}
                        `}>
                            {isSelected ? "ADDED" : `+$${service.price.toLocaleString()}`}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}