export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: 'Residential Land' | 'Residential Plot' | 'Agricultural Land' | 'Farm Land' | 'Commercial Land' | 'Industrial Land' | 'House Site' | 'Corner Plot' | 'Plot' | 'Other';
  price: number;
  area: number;
  areaUnit: 'Sq.Ft' | 'Sq.M' | 'Acre' | 'Cent' | 'Ground';
  location: string;
  district: string;
  taluk: string;
  village: string;
  images: string[];
  facing: 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West' | 'Any';
  roadWidth: number; // in feet
  electricity: boolean;
  water: boolean;
  approval: 'DTCP' | 'CMDA' | 'Panchayat' | 'Unapproved';
  seller: {
    id: string;
    name: string;
    phone: string;
    type: 'Owner' | 'Agent' | 'Builder' | 'Developer' | 'Company';
    isVerified?: boolean;
  };
  status: 'Available' | 'Published' | 'Draft' | 'Pending' | 'Rejected' | 'Inactive' | 'Sold' | 'Under Negotiation';
  dateAdded: string;
  latitude?: number;
  longitude?: number;
  // Legal & Verification
  verificationStatus: 'Unverified' | 'Information Submitted' | 'Documents Submitted' | 'Verification Pending' | 'Under Review' | 'Partially Verified' | 'Verified by Platform' | 'Rejected';
  documents?: {
    patta?: boolean;
    chitta?: boolean;
    ec?: boolean;
    saleDeed?: boolean;
    fmb?: boolean;
    layoutApproval?: boolean;
    adangal?: boolean;
    parentDocument?: boolean;
    dtcpApproval?: boolean;
    cmdaApproval?: boolean;
    buildingApproval?: boolean;
    propertyTax?: boolean;
    ownershipProof?: boolean;
  };

  // Land Details
  pincode?: string;
  surveyNumber?: string;
  subdivisionNumber?: string;
  roadAccess?: string;
  cornerProperty?: boolean;
  frontage?: number; // in feet
  depth?: number; // in feet
  borewell?: boolean;
  drainage?: boolean;
  fencing?: boolean;
  utilities?: string[];
  agriculturalFeatures?: string[];
  plotShape?: 'Square' | 'Rectangle' | 'Regular' | 'Irregular' | 'Corner' | 'Other';
  roadType?: 'Main Road' | 'Tar Road' | 'Concrete Road' | 'Village Road' | 'Mud/Rural Road' | 'Other';
  amenities?: { name: string; distance: number }[];
  purpose?: string;
  landmark?: string;
  isFeatured?: boolean;
}

export const mockProperties: Property[] = [
  {
    id: 'prop-1',
    title: 'DTCP Approved Plot in OMR',
    description: 'A well-developed DTCP approved residential plot located in the prime area of OMR, suitable for immediate construction.',
    propertyType: 'Plot',
    price: 4500000,
    area: 1200,
    areaUnit: 'Sq.Ft',
    location: 'Sholinganallur',
    district: 'Chennai',
    taluk: 'Sholinganallur',
    village: 'Semmancheri',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'],
    facing: 'North',
    roadWidth: 30,
    electricity: true,
    water: true,
    approval: 'DTCP',
    seller: { id: 'sell-1', name: 'Ramesh Kumar', phone: '9876543210', type: 'Owner' },
    status: 'Available',
    dateAdded: '2023-10-15T00:00:00Z',
    latitude: 12.2274,
    longitude: 79.6469,
    verificationStatus: 'Verified by Platform',
    documents: { patta: true, ec: true, layoutApproval: true },
    surveyNumber: '145/2B',
    cornerProperty: true,
    fencing: true
  },
  {
    id: 'prop-2',
    title: '5 Acres Agricultural Land in Pollachi',
    description: 'Fertile agricultural land with abundant ground water, coconut trees, and easy road access.',
    propertyType: 'Agricultural Land',
    price: 15000000,
    area: 5,
    areaUnit: 'Acre',
    location: 'Anaimalai',
    district: 'Coimbatore',
    taluk: 'Pollachi',
    village: 'Vettaikaranpudur',
    images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
    facing: 'East',
    roadWidth: 40,
    electricity: true,
    water: true,
    approval: 'Panchayat',
    seller: { id: 'sell-2', name: 'Natarajan', phone: '9988776655', type: 'Agent' },
    status: 'Available',
    dateAdded: '2026-09-08T10:00:00Z',
    verificationStatus: 'Partially Verified',
    documents: { patta: true, chitta: true },
    borewell: true,
    fencing: false
  },
  {
    id: 'prop-3',
    title: 'Commercial Land in Tindivanam Highway',
    description: 'Prime commercial land facing the national highway. Excellent for warehouses or retail spaces.',
    propertyType: 'Commercial Land',
    price: 8500000,
    area: 4500,
    areaUnit: 'Sq.Ft',
    location: 'Highway Road',
    district: 'Villupuram',
    taluk: 'Tindivanam',
    village: 'Pelakuppam',
    images: ['https://images.unsplash.com/photo-1596706927429-9e6bc7da58e3?w=600&h=400&fit=crop'],
    facing: 'South',
    roadWidth: 60,
    electricity: true,
    water: false,
    approval: 'DTCP',
    seller: { id: 'sell-3', name: 'Srinivasan', phone: '9876500000', type: 'Builder' },
    status: 'Available',
    dateAdded: '2026-09-12T10:00:00Z',
    verificationStatus: 'Verification Pending',
    documents: { saleDeed: true, ec: true },
    roadAccess: 'NH-45 Highway',
    frontage: 80,
    depth: 56
  },
  {
    id: 'prop-4',
    title: 'Scenic Farm Land in Gingee',
    description: 'Beautiful farm land with mountain views near the historical Gingee fort. Ideal for weekend farming.',
    propertyType: 'Farm Land',
    price: 3200000,
    area: 2,
    areaUnit: 'Acre',
    location: 'Fort Road',
    district: 'Villupuram',
    taluk: 'Gingee',
    village: 'Singavaram',
    images: ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&h=400&fit=crop'],
    facing: 'East',
    roadWidth: 20,
    electricity: false,
    water: true,
    approval: 'Unapproved',
    seller: { id: 'sell-4', name: 'Karthik', phone: '9123456789', type: 'Owner' },
    status: 'Available',
    dateAdded: '2026-09-14T10:00:00Z',
    verificationStatus: 'Unverified',
    fencing: true
  },
  {
    id: 'prop-5',
    title: 'CMDA Approved Plot in Tambaram',
    description: 'Ready to build residential plot in a fast-developing neighborhood with all basic amenities.',
    propertyType: 'Plot',
    price: 6800000,
    area: 1500,
    areaUnit: 'Sq.Ft',
    location: 'Tambaram West',
    district: 'Chennai',
    taluk: 'Tambaram',
    village: 'Mudichur',
    images: ['https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop'],
    facing: 'North-East',
    roadWidth: 30,
    electricity: true,
    water: true,
    approval: 'CMDA',
    seller: { id: 'sell-5', name: 'Property Developers Ltd', phone: '9000011111', type: 'Builder' },
    status: 'Available',
    dateAdded: '2026-09-01T10:00:00Z',
    verificationStatus: 'Documents Submitted',
    documents: { ec: true, layoutApproval: true }
  },
  {
    id: 'prop-6',
    title: 'Affordable Plot near Kanchipuram',
    description: 'Investment plot near the upcoming industrial corridor. High appreciation potential.',
    propertyType: 'Plot',
    price: 1200000,
    area: 1200,
    areaUnit: 'Sq.Ft',
    location: 'Sriperumbudur Highway',
    district: 'Kanchipuram',
    taluk: 'Sriperumbudur',
    village: 'Sunguvarchatram',
    images: ['https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=600&h=400&fit=crop'],
    facing: 'West',
    roadWidth: 24,
    electricity: true,
    water: false,
    approval: 'Panchayat',
    seller: { id: 'sell-6', name: 'Murali', phone: '9888877777', type: 'Agent' },
    status: 'Available',
    dateAdded: '2026-09-15T08:00:00Z',
    verificationStatus: 'Unverified'
  }
];
