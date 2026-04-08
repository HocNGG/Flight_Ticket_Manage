import React from 'react';
import { policyConfig } from '../../../data/flightPolicies';
import type { PolicyType } from '../../../data/flightPolicies';

interface PolicyItem {
  type: PolicyType;
  title: string;
  description: string;
}

interface PoliciesProps {
  policies: PolicyItem[];
}
//
export const Policies: React.FC<PoliciesProps> = ({ policies }) => {
  // Group policies by type
  // This allows us to render each policy type in its own section with the appropriate icon and title.
  const groupedPolicies = policies.reduce((acc, policy) => {
    if (!acc[policy.type]) {
      acc[policy.type] = [];
    }
    acc[policy.type].push(policy);
    return acc;
  }, {} as Record<string, PolicyItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedPolicies).map(([type, typePolicies]) => {
        const config = policyConfig[type as keyof typeof policyConfig];
        if (!config) return null;

        const IconComponent = config.icon;

        return (
          <div key={type} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900 mb-6">
              <IconComponent className="w-6 h-6 text-red" />
              {config.title}
            </h3>

            <div className="space-y-4">
              {typePolicies.map((policy, index) => (
                <div key={index} className="flex justify-between items-center bg-[#fcfcfc] border border-gray-100 p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <IconComponent className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold text-sm text-gray-900">{policy.title}</p>
                      <p className="text-[11px] text-gray-500">{policy.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
