import { api } from './index';
import type { UploadPolicy, UploadPolicyRequest } from '../types';

export const assetsApi = {
  getUploadPolicy: async (data: UploadPolicyRequest) => {
    return api.post<UploadPolicy>('/assets/upload-policy', data);
  },
};
