import { getAllProperties } from '../utils/propertyUtils';

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    buyers: number;
    sellers: number;
    agents: number;
  };
  properties: {
    total: number;
    published: number;
    pending: number;
    sold: number;
    featured: number;
  };
  financial: {
    revenue: number;
    activeSubscriptions: number;
  };
  issues: {
    pendingDocuments: number;
    openComplaints: number;
  };
}

export interface AbstractReportData {
  period: string;
  userAbstract: {
    buyers: number;
    sellers: number;
    agents: number;
    admins: number;
    total: number;
    active: number;
    inactive: number;
  };
  propertyAbstract: {
    type: string;
    total: number;
    published: number;
    pending: number;
    sold: number;
  }[];
  locationAbstract: {
    district: string;
    total: number;
    published: number;
    sold: number;
  }[];
  priceAbstract: {
    totalValue: number;
    avgPrice: number;
  };
}

export interface Complaint {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reportedBy: string;
  reason: string;
  status: 'New' | 'Under Investigation' | 'Resolved' | 'Rejected';
  dateReported: string;
  notes?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const AUTH_STORAGE_KEY = 'land_selling_app_token';

// Complaints stored locally or synced with backend
let liveComplaints: Complaint[] = [];

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/admin/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          return {
            users: {
              total: data.users?.total || 0,
              active: data.users?.active || 0,
              buyers: data.users?.buyers || 0,
              sellers: data.users?.sellers || 0,
              agents: data.users?.agents || 0
            },
            properties: {
              total: data.properties?.total || 0,
              published: data.properties?.published || 0,
              pending: data.properties?.pending || 0,
              sold: 0,
              featured: 0
            },
            financial: {
              revenue: data.financial?.revenue || 0,
              activeSubscriptions: data.financial?.activeSubscriptions || 0
            },
            issues: {
              pendingDocuments: data.issues?.pendingDocuments || 0,
              openComplaints: data.issues?.openComplaints || liveComplaints.length
            }
          };
        }
      } catch (err) {
        // Fallback to local calculations below
      }
    }

    const props = getAllProperties();
    return {
      users: {
        total: 1,
        active: 1,
        buyers: 1,
        sellers: 0,
        agents: 0
      },
      properties: {
        total: props.length,
        published: props.filter(p => p.status === 'Available' || p.status === 'Published').length,
        pending: props.filter(p => p.status === 'Pending').length,
        sold: props.filter(p => p.status === 'Sold').length,
        featured: 0
      },
      financial: {
        revenue: 0,
        activeSubscriptions: 0
      },
      issues: {
        pendingDocuments: 0,
        openComplaints: liveComplaints.filter(c => c.status === 'New' || c.status === 'Under Investigation').length
      }
    };
  },

  getAbstractReport: async (): Promise<AbstractReportData> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const props = getAllProperties();
    const propTypes = ['Plot', 'Farm Land', 'Agricultural', 'Commercial', 'Residential'];
    
    const propAbstract = propTypes.map(t => {
      const typeProps = props.filter(p => p.propertyType === t || p.propertyType.includes(t));
      return {
        type: t,
        total: typeProps.length || Math.floor(Math.random() * 50) + 10,
        published: typeProps.filter(p => p.status === 'Available').length || Math.floor(Math.random() * 30),
        pending: Math.floor(Math.random() * 5),
        sold: typeProps.filter(p => p.status === 'Sold').length || Math.floor(Math.random() * 10),
      };
    });

    return {
      period: '01-09-2026 to 30-09-2026',
      userAbstract: {
        buyers: 800,
        sellers: 300,
        agents: 150,
        admins: 5,
        total: 1255,
        active: 1100,
        inactive: 155
      },
      propertyAbstract: propAbstract,
      locationAbstract: [
        { district: 'Chennai', total: 450, published: 300, sold: 100 },
        { district: 'Kanchipuram', total: 320, published: 250, sold: 50 },
        { district: 'Chengalpattu', total: 280, published: 200, sold: 60 }
      ],
      priceAbstract: {
        totalValue: props.reduce((sum, p) => sum + p.price, 0) * 15, // scaled up for mock volume
        avgPrice: Math.round(props.reduce((sum, p) => sum + p.price, 0) / (props.length || 1))
      }
    };
  },

  getComplaints: async (): Promise<Complaint[]> => {
    return [...liveComplaints];
  },

  updateComplaintStatus: async (id: string, status: Complaint['status'], notes?: string): Promise<void> => {
    liveComplaints = liveComplaints.map(c => c.id === id ? { ...c, status, notes: notes || c.notes } : c);
  }
};
