export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: 'Residential Land' | 'Residential Plot' | 'Agricultural Land' | 'Farm Land' | 'Commercial Land' | 'Industrial Land' | 'House Site' | 'Corner Plot' | 'Plot' | 'Other';
  price: number;
  originalPrice?: number; // Original price before price drop
  isPriceReduced?: boolean; // True if amount reduced
  reducedAmount?: number; // Amount saved
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
  views?: number;
  enquiries?: number;
}

// Live database mode: No hardcoded mock properties. All properties come from user CRUD.
export const mockProperties: Property[] = [];
