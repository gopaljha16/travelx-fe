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

// Bump this version whenever initial data changes to force-reset stale localStorage
const DATA_VERSION = 'v6-clean-slate'; // Complete fresh start
const STORAGE_KEY = 'mybiz_approval_requests_v2'; // Changed key to force fresh start
const VERSION_KEY = 'mybiz_approval_version_v2';

const dispatchStorageEvent = (requests: TravelRequest[]) => {
  if (typeof window !== 'undefined') {
    // 1. Persist to localStorage first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    
    // 2. Same-tab sync via custom event (immediate)
    window.dispatchEvent(new CustomEvent('mybiz_requests_updated', { 
      detail: requests 
    }));
    
    // 3. Cross-tab sync - manually trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(requests),
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href
    }));
  }
};

// Initial mock data — IDs must match mock user IDs in lib/api.ts
// mgr@acme.com → id: MGR-001 | smgr@acme.com → id: SMGR-001 | emp@acme.com → id: EMP-001
const INITIAL_MOCK_REQUESTS: TravelRequest[] = [
  {
    id: 'REQ-001',
    employee_id: 'EMP-001',
    employee_name: 'John Employee',
    type: 'flight',
    details: 'DEL → BOM · Air India AI-202 · Economy',
    travel_date: '2026-05-20',
    amount: 6200,
    spending_limit: 15000,
    requires_dual_approval: false,
    manager_id: 'MGR-001',       // Sarah Manager (mgr@acme.com)
    senior_manager_id: 'SMGR-001',
    manager_approved: false,
    senior_manager_approved: false,
    status: 'pending_manager',
    submitted_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'REQ-002',
    employee_id: 'EMP-001',
    employee_name: 'John Employee',
    type: 'hotel',
    details: 'The Taj Lands End, Mumbai · 2 Nights · Deluxe Room',
    travel_date: '2026-05-18',
    amount: 18000,
    spending_limit: 15000,
    requires_dual_approval: true,
    manager_id: 'MGR-001',        // Sarah Manager (mgr@acme.com)
    senior_manager_id: 'SMGR-001', // Robert Sr Mgr (smgr@acme.com)
    manager_approved: true,
    senior_manager_approved: false,
    status: 'pending_senior_manager',
    submitted_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const initStorage = (): TravelRequest[] => {
  if (typeof window === 'undefined') return INITIAL_MOCK_REQUESTS;
  
  // FORCE CLEAN SLATE: Remove all old keys
  const oldKeys = ['mock_approval_requests', 'mock_approval_version'];
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log('[MyBiz Init] Removing old key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Force reset if data version is stale
  const storedVersion = localStorage.getItem(VERSION_KEY);
  console.log('[MyBiz Init] Stored version:', storedVersion, '| Current version:', DATA_VERSION);
  
  if (storedVersion !== DATA_VERSION) {
    console.log('[MyBiz Init] Version mismatch - resetting to initial data');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    console.log('[MyBiz Init] Initialized with', INITIAL_MOCK_REQUESTS.length, 'requests');
    return INITIAL_MOCK_REQUESTS;
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    console.log('[MyBiz Init] No stored data - initializing');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
    return INITIAL_MOCK_REQUESTS;
  }
  
  const parsed = JSON.parse(stored);
  console.log('[MyBiz Init] Loaded', parsed.length, 'requests from localStorage');
  return parsed;
};

export const getApprovalRequests = (): TravelRequest[] => initStorage();

export const saveApprovalRequest = (req: TravelRequest) => {
  const requests = getApprovalRequests();
  // Avoid duplicate IDs
  const existing = requests.findIndex(r => r.id === req.id);
  if (existing !== -1) {
    requests[existing] = req;
  } else {
    requests.push(req);
  }
  if (typeof window !== 'undefined') {
    // Immediately persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    
    // Dispatch events AFTER localStorage is updated
    dispatchStorageEvent(requests);
    
    // Force a manual trigger for same-tab updates
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('mybiz_requests_updated', { 
        detail: requests 
      }));
    }, 50);
  }
};

export const updateApprovalRequest = (id: string, updates: Partial<TravelRequest>) => {
  const requests = getApprovalRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    
    if (typeof window !== 'undefined') {
      dispatchStorageEvent(requests);
    }
  }
};

export const getEmployeeRequests = (userId: string): TravelRequest[] => {
  return getApprovalRequests().filter(r => r.employee_id === userId);
};

// Debug helper — call from browser console: window.__myBizDebug()
if (typeof window !== 'undefined') {
  (window as any).__myBizDebug = () => {
    const reqs = getApprovalRequests();
    console.table(reqs.map(r => ({ id: r.id, employee: r.employee_name, manager_id: r.manager_id, status: r.status, amount: r.amount })));
    return reqs;
  };
}
