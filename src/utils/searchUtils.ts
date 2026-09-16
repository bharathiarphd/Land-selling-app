import type { Property } from '../data/mockProperties';

export interface FilterOptions {
  keyword?: string;
  state?: string;
  district?: string;
  taluk?: string;
  village?: string;
  locality?: string;
  pincode?: string;
  landmark?: string;
  propertyType?: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  areaUnit?: string;
  minPricePerUnit?: number;
  maxPricePerUnit?: number;
  facing?: string[];
  plotShape?: string[];
  minRoadWidth?: number;
  roadType?: string[];
  utilities?: string[];
  agriculturalFeatures?: string[];
  documents?: string[];
  verificationStatus?: string[];
  surveyNumber?: string;
  subdivisionNumber?: string;
  sellerType?: string[];
  listingStatus?: string[];
  radius?: number;
  purpose?: string;
  amenities?: string[];
  postedAfter?: string;
  postedBefore?: string;
  // Legacy compatibility
  query?: string;
  type?: string;
  features?: string[];
}

export type SortOption = 'relevance' | 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'nearest' | 'most-viewed' | 'most-favourited' | 'recently-updated' | 'price-reduced';

export const getAreaInSqFt = (area: number, unit: string) => {
  const u = unit.toLowerCase();
  if (u.includes('cent')) return area * 435.6;
  if (u.includes('acre')) return area * 43560;
  if (u.includes('ground')) return area * 2400;
  if (u.includes('sq.m') || u.includes('sqm')) return area * 10.7639;
  return area; // Sq.Ft default
};

export const parseSmartSearch = (query: string): Partial<FilterOptions> => {
  const filters: Partial<FilterOptions> = {};
  const q = query.toLowerCase();

  const lakhMatch = q.match(/(\d+)\s*(lakh|லட்சம்)/);
  if (lakhMatch) {
    const val = parseInt(lakhMatch[1], 10) * 100000;
    if (q.includes('under') || q.includes('below') || q.includes('குள்') || q.includes('கீழ்')) filters.maxPrice = val;
    else filters.minPrice = val;
  }

  const centMatch = q.match(/(\d+)\s*(cent|சென்ட்)/);
  if (centMatch) {
    filters.minArea = parseInt(centMatch[1], 10);
    filters.areaUnit = 'Cent';
  }
  const acreMatch = q.match(/(\d+)\s*(acre|ஏக்கர்)/);
  if (acreMatch) {
    filters.minArea = parseInt(acreMatch[1], 10);
    filters.areaUnit = 'Acre';
  }

  if (q.includes('residential') || q.includes('வீட்டு மனை') || q.includes('குடியிருப்பு')) filters.propertyType = ['Residential Land', 'Residential Plot', 'Plot'];
  if (q.includes('agricultural') || q.includes('farm') || q.includes('விவசாய') || q.includes('பண்ணை')) filters.propertyType = ['Agricultural Land', 'Farm Land'];
  if (q.includes('commercial') || q.includes('வணிக')) filters.propertyType = ['Commercial Land'];
  if (q.includes('corner plot') || q.includes('corner') || q.includes('மூலை')) filters.plotShape = ['Corner'];

  const locationMappings: Record<string, string> = {
    'திண்டிவனம்': 'Tindivanam',
    'விழுப்புரம்': 'Villupuram',
    'செஞ்சி': 'Gingee',
    'சென்னை': 'Chennai',
    'கோயம்புத்தூர்': 'Coimbatore',
    'காஞ்சிபுரம்': 'Kanchipuram',
    'மதுரை': 'Madurai'
  };

  const locations = ['tindivanam', 'villupuram', 'gingee', 'chennai', 'coimbatore', 'kanchipuram', 'madurai', ...Object.keys(locationMappings)];
  for (const loc of locations) {
    if (q.includes(loc)) {
      if (locationMappings[loc]) {
        filters.locality = locationMappings[loc];
      } else {
        filters.locality = loc.charAt(0).toUpperCase() + loc.slice(1);
      }
    }
  }

  return filters;
};

export const filterProperties = (properties: Property[], filters: FilterOptions): Property[] => {
  let activeFilters = { ...filters };
  if (activeFilters.keyword && !activeFilters.maxPrice && !activeFilters.minArea) {
    const parsed = parseSmartSearch(activeFilters.keyword);
    activeFilters = { ...activeFilters, ...parsed, keyword: activeFilters.keyword };
  }

  return properties.filter(p => {
    const q = activeFilters.keyword?.toLowerCase() || activeFilters.query?.toLowerCase();
    if (q) {
      const matchText = (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.taluk.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.surveyNumber?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.pincode?.toLowerCase().includes(q) ||
        p.landmark?.toLowerCase().includes(q)
      );
      if (!matchText) return false;
    }

    const pTypes = activeFilters.propertyType || (activeFilters.type && activeFilters.type !== 'All Properties' ? [activeFilters.type] : []);
    if (pTypes.length > 0) {
      if (!pTypes.includes(p.propertyType) && !pTypes.includes('All Properties')) return false;
    }

    if (activeFilters.district && activeFilters.district !== 'All Districts') {
      if (p.district.toLowerCase() !== activeFilters.district.toLowerCase()) return false;
    }
    if (activeFilters.taluk && p.taluk.toLowerCase() !== activeFilters.taluk.toLowerCase()) return false;
    if (activeFilters.village && p.village.toLowerCase() !== activeFilters.village.toLowerCase()) return false;
    if (activeFilters.locality && !p.location.toLowerCase().includes(activeFilters.locality.toLowerCase()) && p.taluk.toLowerCase() !== activeFilters.locality.toLowerCase()) return false;

    if (activeFilters.minPrice && p.price < activeFilters.minPrice) return false;
    if (activeFilters.maxPrice && p.price > activeFilters.maxPrice) return false;

    const propAreaSqFt = getAreaInSqFt(p.area, p.areaUnit);
    if (activeFilters.minArea && activeFilters.areaUnit) {
       if (propAreaSqFt < getAreaInSqFt(activeFilters.minArea, activeFilters.areaUnit)) return false;
    }
    if (activeFilters.maxArea && activeFilters.areaUnit) {
       if (propAreaSqFt > getAreaInSqFt(activeFilters.maxArea, activeFilters.areaUnit)) return false;
    }

    if (activeFilters.minPricePerUnit || activeFilters.maxPricePerUnit) {
       let targetArea = propAreaSqFt;
       if (activeFilters.areaUnit) {
          const targetUnit = activeFilters.areaUnit.toLowerCase();
          if (targetUnit.includes('cent')) targetArea = propAreaSqFt / 435.6;
          else if (targetUnit.includes('acre')) targetArea = propAreaSqFt / 43560;
          else if (targetUnit.includes('ground')) targetArea = propAreaSqFt / 2400;
          else if (targetUnit.includes('sq.m') || targetUnit.includes('sqm')) targetArea = propAreaSqFt / 10.7639;
       }
       const pricePerUnit = p.price / targetArea;
       if (activeFilters.minPricePerUnit && pricePerUnit < activeFilters.minPricePerUnit) return false;
       if (activeFilters.maxPricePerUnit && pricePerUnit > activeFilters.maxPricePerUnit) return false;
    }

    if (activeFilters.minRoadWidth && p.roadWidth < activeFilters.minRoadWidth) return false;
    if (activeFilters.roadType && activeFilters.roadType.length > 0) {
      if (!p.roadType || !activeFilters.roadType.includes(p.roadType)) return false;
    }

    if (activeFilters.facing && activeFilters.facing.length > 0) {
      if (!activeFilters.facing.includes(p.facing)) return false;
    }

    if (activeFilters.plotShape && activeFilters.plotShape.length > 0) {
      if (!p.plotShape && !activeFilters.plotShape.includes('Corner') && !p.cornerProperty) return false;
      if (p.plotShape && !activeFilters.plotShape.includes(p.plotShape)) return false;
      if (activeFilters.plotShape.includes('Corner') && !p.cornerProperty && p.plotShape !== 'Corner') return false;
    }

    if (activeFilters.utilities && activeFilters.utilities.length > 0) {
      const pUtils = p.utilities || [];
      for (const util of activeFilters.utilities) {
        if (util === 'Electricity' && !p.electricity) return false;
        if (util === 'Water' && !p.water) return false;
        if (util === 'Borewell' && !p.borewell) return false;
        if (util === 'Drainage' && !p.drainage) return false;
        if (util === 'Fencing' && !p.fencing) return false;
        if (!['Electricity', 'Water', 'Borewell', 'Drainage', 'Fencing'].includes(util) && !pUtils.includes(util)) return false;
      }
    }

    if (activeFilters.documents && activeFilters.documents.length > 0) {
      if (!p.documents) return false;
      const docs = p.documents as Record<string, boolean>;
      for (const doc of activeFilters.documents) {
        let docKey = doc.charAt(0).toLowerCase() + doc.slice(1).replace(/\s+/g, '');
        if (doc === 'Sale Deed') docKey = 'saleDeed';
        if (doc === 'Layout Approval') docKey = 'layoutApproval';
        if (doc === 'DTCP Approval') docKey = 'dtcpApproval';
        if (doc === 'CMDA Approval') docKey = 'cmdaApproval';
        if (doc === 'Building Approval') docKey = 'buildingApproval';
        if (doc === 'Property Tax Receipt') docKey = 'propertyTax';
        if (doc === 'Ownership Proof') docKey = 'ownershipProof';
        if (doc === 'EC') docKey = 'ec';
        if (doc === 'FMB / Survey Sketch') docKey = 'fmb';
        if (!docs[docKey]) return false;
      }
    }

    if (activeFilters.verificationStatus && activeFilters.verificationStatus.length > 0) {
      if (!activeFilters.verificationStatus.includes('All') && !activeFilters.verificationStatus.includes(p.verificationStatus)) {
         if (activeFilters.verificationStatus.includes('Verified Property') && (p.verificationStatus as string) !== 'Verified by Platform' && (p.verificationStatus as string) !== 'Fully Verified') return false;
         else if (!activeFilters.verificationStatus.includes('Verified Property')) return false;
      }
    }

    if (activeFilters.sellerType && activeFilters.sellerType.length > 0) {
      if (!activeFilters.sellerType.includes(p.seller.type)) {
        if (activeFilters.sellerType.includes('Verified Seller Only') && !p.seller.isVerified) return false;
        else if (!activeFilters.sellerType.includes('Verified Seller Only')) return false;
      }
    }

    if (activeFilters.listingStatus && activeFilters.listingStatus.length > 0) {
      if (!activeFilters.listingStatus.includes(p.status)) return false;
    } else {
      if (p.status === 'Draft' || p.status === 'Inactive' || p.status === 'Rejected') return false;
    }

    if (activeFilters.features && activeFilters.features.length > 0) {
      for (const feature of activeFilters.features) {
        if (feature === 'electricity' && !p.electricity) return false;
        if (feature === 'water' && !p.water) return false;
        if (feature === 'dtcp' && p.approval !== 'DTCP') return false;
        if (feature === 'cmda' && p.approval !== 'CMDA') return false;
        if (feature === 'roadAccess' && p.roadWidth <= 0) return false;
      }
    }

    return true;
  });
};

export const sortProperties = (properties: Property[], sort: SortOption): Property[] => {
  const props = [...properties];
  
  switch (sort) {
    case 'newest':
      return props.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    case 'oldest':
      return props.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
    case 'price-asc':
      return props.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return props.sort((a, b) => b.price - a.price);
    case 'area-asc':
      return props.sort((a, b) => getAreaInSqFt(a.area, a.areaUnit) - getAreaInSqFt(b.area, b.areaUnit));
    case 'area-desc':
      return props.sort((a, b) => getAreaInSqFt(b.area, b.areaUnit) - getAreaInSqFt(a.area, a.areaUnit));
    case 'nearest':
      return props;
    case 'most-viewed':
    case 'most-favourited':
    case 'price-reduced':
      return props; 
    case 'recently-updated':
      return props.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    case 'relevance':
    default:
      return props.sort((a, b) => {
        let scoreA = 0; let scoreB = 0;
        if (a.verificationStatus === 'Verified by Platform') scoreA += 10;
        if (b.verificationStatus === 'Verified by Platform') scoreB += 10;
        if (a.images.length > 1) scoreA += 5;
        if (b.images.length > 1) scoreB += 5;
        if (a.isFeatured) scoreA += 20;
        if (b.isFeatured) scoreB += 20;
        return scoreB - scoreA;
      });
  }
};
