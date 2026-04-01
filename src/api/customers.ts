import { api } from './index';
import type { Customer, CustomerAgeBucket } from '../types';

export const customersApi = {
  getCustomers: async () => {
    return api.get<Customer[]>('/customers');
  },

  updateCustomer: async (id: number, data: { name?: string; email?: string | null; ageBucketId?: number | null }) => {
    return api.patch<Customer>(`/customers/${id}`, data);
  },

  getAgeBuckets: async () => {
    return api.get<CustomerAgeBucket[]>('/customers/age-buckets');
  },

  createAgeBucket: async (data: { name: string; sortOrder: number }) => {
    return api.post<CustomerAgeBucket>('/customers/age-buckets', data);
  },

  updateAgeBucket: async (id: number, data: { name?: string; sortOrder?: number }) => {
    return api.put<CustomerAgeBucket>(`/customers/age-buckets/${id}`, data);
  },

  deleteAgeBucket: async (id: number) => {
    return api.delete(`/customers/age-buckets/${id}`);
  },
};
