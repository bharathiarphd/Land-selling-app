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

// Mock Data
let mockComplaints: Complaint[] = [
  { id: 'c1', propertyId: 'prop-2', propertyTitle: 'Agricultural Land in Kanchipuram', reportedBy: 'user-22', reason: 'Fake property', status: 'New', dateReported: new Date().toISOString() },
  { id: 'c2', propertyId: 'prop-3', propertyTitle: 'Commercial Plot in OMR', reportedBy: 'user-45', reason: 'Wrong price', status: 'Under Investigation', dateReported: new Date(Date.now() - 86400000).toISOString() }
];

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const props = getAllProperties();
    
    return {
      users: {
        total: 1250,
        active: 1100,
        buyers: 800,
        sellers: 300,
        agents: 150
      },
      properties: {
        total: props.length,
        published: props.filter(p => p.status === 'Available').length,
        pending: 12,
        sold: props.filter(p => p.status === 'Sold').length,
        featured: 5
      },
      financial: {
        revenue: 450000,
        activeSubscriptions: 45
      },
      issues: {
        pendingDocuments: 24,
        openComplaints: mockComplaints.filter(c => c.status === 'New' || c.status === 'Under Investigation').length
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
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...mockComplaints];
  },

  updateComplaintStatus: async (id: string, status: Complaint['status'], notes?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockComplaints = mockComplaints.map(c => c.id === id ? { ...c, status, notes: notes || c.notes } : c);
  }
};
