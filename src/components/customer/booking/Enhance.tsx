import { enhanceConfig } from "../../../data/filghtEnhance";

type Type = keyof typeof enhanceConfig;

interface EnhanceItem {
    type: Type;
    title: string;
    description: string;
    price?: number;
}

interface EnhanceProps {
    enhanceList: EnhanceItem[];
}

export const Enhance: React.FC<EnhanceProps> = ({ enhanceList }) => {
    const columns = Math.min(enhanceList.length, 3);
    const gridColsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
    }[columns];

    return (
        <div className={`grid gap-4 ${gridColsClass}`}>
            {enhanceList.map((enhance, index) => {
                const config = enhanceConfig[enhance.type as keyof typeof enhanceConfig];
                if (!config) return null;
                const IconComponent = config.icon;
                return (
                    <div key={index} className="flex flex-col items-center gap-4 bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                        <IconComponent className="w-6 h-6 text-red" />
                        <div className="text-center">
                            <p className="font-bold text-sm text-gray-900">{enhance.title}</p>
                            <p className="text-[11px] text-gray-500">{enhance.description}</p>
                            <button className="mt-4 bg-red text-white hover:bg-reddark transition-colors rounded-full px-6 py-2 text-sm font-bold">
                                Add for ${enhance.price?.toFixed(2)}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}