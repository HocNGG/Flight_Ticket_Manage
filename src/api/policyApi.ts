import api from './axiosInstance';

import type {
  ApiResponse,
  Policy,
  PolicyPayload,
  PolicyRule,
  PolicyRulePayload
} from './types';

export const policyApi = {

  // =========================
  // POLICY
  // =========================

  getAll: async () => {const res = await api.get<ApiResponse<Policy[]>>('/api/policies');
    return res.data;
  },

  create: async (payload: PolicyPayload) => {
    const res = await api.post<
      ApiResponse<Policy>
    >('/api/policies', payload);

    return res.data;
  },

  delete: async (policyId: number) => {
    const res = await api.delete<
      ApiResponse<void>
    >(`/api/policies/${policyId}`);

    return res.data;
  },

  // =========================
  // POLICY RULE
  // =========================

  getRules: async (policyId: number) => {

    const res = await api.get<
      ApiResponse<PolicyRule[]>
    >(`/api/policies/${policyId}/rules`);

    return res.data;
  },

  getRuleById: async (ruleId: number) => {
    const res = await api.get<
      ApiResponse<PolicyRule>
    >(`/api/policies/rules/${ruleId}`);

    return res.data;
  },

  createRule: async (
    policyId: number,
    payload: PolicyRulePayload
  ) => {

    const res = await api.post<
      ApiResponse<PolicyRule>
    >(
      `/api/policies/${policyId}/rules`,
      payload
    );

    return res.data;
  },

  deleteRule: async (ruleId: number) => {

    const res = await api.delete<
      ApiResponse<void>
    >(`/api/policies/rules/${ruleId}`);

    return res.data;
  }
};