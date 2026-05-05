export type ApprovalStatus = 
  | 'pending_manager'
  | 'pending_senior_manager'  // normal approved, senior still pending
  | 'approved'
  | 'rejected';

export type TravelRequest = {
  id: string;
  employee_id: string;
  employee_name: string;
  type: 'flight' | 'hotel' | 'bus' | 'train';
  details: string;           // "DEL → BOM · AI-202 · Economy"
  travel_date: string;
  amount: number;
  spending_limit: number;
  requires_dual_approval: boolean;   // amount > spending_limit
  manager_id: string;
  senior_manager_id: string;
  manager_approved: boolean;
  senior_manager_approved: boolean;
  status: ApprovalStatus;
  submitted_at: string;
  rejection_reason?: string;
};

// Initial mock data
const INITIAL_MOCK_REQUESTS: TravelRequest[] = [
  {
    id: 'REQ-001',
    employee_id: 'EMP-101',
    employee_name: 'Priya Sharma',
    type: 'flight',
    details: 'DEL → BOM · Air India AI-202 · Economy',
    travel_date: '2026-05-20',
    amount: 6200,
    spending_limit: 10000,
    requires_dual_approval: false,
    manager_id: 'dummy_user_123', // matching default mock user
    senior_manager_id: 'SMGR-001',
    manager_approved: false,
    senior_manager_approved: false,
    status: 'pending_manager',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'REQ-002',
    employee_id: 'EMP-102',
    employee_name: 'Arjun Mehta',
    type: 'hotel',
    details: 'The Taj Lands End, Mumbai · 2 Nights · Deluxe Room',
    travel_date: '2026-05-18',
    amount: 18000,
    spending_limit: 10000,
    requires_dual_approval: true,   // exceeds limit
    manager_id: 'MGR-001',
    senior_manager_id: 'dummy_user_123', // matching default mock user as senior
    manager_approved: true,          // normal manager already said yes
    senior_manager_approved: false,
    status: 'pending_senior_manager',
    submitted_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const getApprovalRequests = (): TravelRequest[] => {
  if (typeof window === 'undefined') return INITIAL_MOCK_REQUESTS;
  const stored = localStorage.getItem('mock_approval_requests');
  if (!stored) {
    localStorage.setItem('mock_approval_requests', JSON.stringify(INITIAL_MOCK_REQUESTS));
    return INITIAL_MOCK_REQUESTS;
  }
  return JSON.parse(stored);
};

export const saveApprovalRequest = (req: TravelRequest) => {
  const requests = getApprovalRequests();
  requests.push(req);
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_approval_requests', JSON.stringify(requests));
  }
};

export const updateApprovalRequest = (id: string, updates: Partial<TravelRequest>) => {
  const requests = getApprovalRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_approval_requests', JSON.stringify(requests));
    }
  }
};

export const getEmployeeRequests = (userId: string): TravelRequest[] => {
  return getApprovalRequests().filter(r => r.employee_id === userId);
};
