export interface CustomerTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Processing';
  category: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: 'Enterprise' | 'Premium' | 'Standard';
  joinedDate: string;
  balance: number;
  totalOrders: number;
  securityScore: number;
  avatarUrl: string;
  transactions: CustomerTransaction[];
}

export const customerApi = {
  getCustomerProfile: async (): Promise<CustomerProfile> => {
    // Artificial latency for TanStack Query demo
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      id: 'CUST-892401',
      name: 'Aminul Islam (EMSA7 Admin)',
      email: 'customer.admin@emsa7.com',
      phone: '+880 1700-000000',
      accountType: 'Enterprise',
      joinedDate: '2025-01-15',
      balance: 14850.00,
      totalOrders: 142,
      securityScore: 98,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      transactions: [
        {
          id: 'TXN-9982',
          description: 'EMSA7 Cloud Subscription Renewal (Annual)',
          amount: 1200.00,
          date: '2026-09-18',
          status: 'Completed',
          category: 'Billing',
        },
        {
          id: 'TXN-9981',
          description: 'Custom Analytics Addon Module',
          amount: 450.00,
          date: '2026-09-12',
          status: 'Completed',
          category: 'Addon',
        },
        {
          id: 'TXN-9980',
          description: 'Enterprise API Gateway License',
          amount: 2800.00,
          date: '2026-09-01',
          status: 'Completed',
          category: 'License',
        },
        {
          id: 'TXN-9979',
          description: 'Priority Support SLA Ticket #4412',
          amount: 150.00,
          date: '2026-08-28',
          status: 'Completed',
          category: 'Support',
        },
      ],
    };
  },
};
