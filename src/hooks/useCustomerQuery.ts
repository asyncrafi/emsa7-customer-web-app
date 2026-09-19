import { useQuery } from '@tanstack/react-query';
import { customerApi, type CustomerProfile } from '@/core/services/customerService';

export function useCustomerQuery() {
  return useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: customerApi.getCustomerProfile,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
}
