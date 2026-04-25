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
                    <div 
                        key={service.serviceId} 
                        onClick={() => onAdd(service)} // Click vào cả thẻ để chọn
                        className={`
                            relative flex flex-col items-center justify-center p-4 rounded-[1.5rem] 
                            cursor-pointer transition-all duration-200 group
                            border-2 
                            ${isSelected 
                                ? 'bg-red/5 border-red shadow-sm scale-[0.98]' 
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200'
                            }
                        `}
                    >
                        {/* Checkmark icon nhỏ ở góc khi đã chọn */}
                        {isSelected && (
                            <div className="absolute top-2 right-2 bg-red rounded-full p-0.5 shadow-sm animate-fadeIn">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        )}

                        <IconComponent 
                            className={`w-5 h-5 mb-2 transition-colors ${isSelected ? 'text-red' : 'text-gray-400 group-hover:text-gray-600'}`} 
                        />
                        
                        <p className={`font-black text-[10px] text-center uppercase tracking-tighter mb-2 leading-tight ${isSelected ? 'text-red' : 'text-gray-900'}`}>
                            {service.serviceName}
                        </p>
                        
                        <div className={`
                            px-3 py-1 rounded-lg border transition-all
                            ${isSelected 
                                ? 'bg-white border-red/20 shadow-sm' 
                                : 'bg-white border-gray-100'
                            }
                        `}>
                            <p className={`text-[9px] font-black tracking-tighter ${isSelected ? 'text-red' : 'text-gray-800'}`}>
                                +${service.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}