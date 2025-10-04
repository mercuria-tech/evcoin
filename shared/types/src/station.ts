export interface Station {
  id: string;
  operatorId: string;
  name: string;
  description?: string;
  address: Address;
  location: Location;
  amenities: Amenity[];
  operatingHours: OperatingHours;
  contact: ContactInfo;
  status: StationStatus;
  rating: number;
  reviewsCount: number;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export enum Amenity {
  WIFI = 'wifi',
  RESTROOM = 'restroom',
  SHOPPING = 'shopping',
  RESTAURANT = 'restaurant',
  PARKING = 'parking',
  GROCERY = 'grocery',
  COFFEE = 'coffee',
  HOTEL = 'hotel'
}

export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
}

export enum StationStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive'
}

export interface StationConnector {
  id: string;
  stationId: string;
  connectorNumber: number;
  connectorType: ConnectorType;
  powerKw: number;
  status: ConnectorStatus;
  pricingPerKwh?: number;
  pricingPerMinute?: number;
  lastStatusUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ConnectorStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  OUT_OF_SERVICE = 'out_of_service'
}

export interface StationSearchRequest {
  latitude: number;
  longitude: number;
  radius?: number; // in km, default: 5
  connectorTypes?: ConnectorType[];
  powerMin?: number; // minimum power in kW
  availableOnly?: boolean;
  amenities?: Amenity[];
  limit?: number;
  offset?: number;
}

export interface StationSearchResponse {
  stations: StationSearchResult[];
  total: number;
  limit: number;
  offset: number;
}

export interface StationSearchResult {
  id: string;
  name: string;
  address: Address;
  location: Location;
  bility: ConnectorAvailability[];
  amenities: Amenity[];
  rating: number;
  reviewsCount: number;
  operatingHours: string; // formatted hours
  distance: number; // distance from search location in km
}

export interface ConnectorAvailability {
  connectorType: ConnectorType;
  powerKw: number;
  status: ConnectorStatus;
  pricing: Pricing;
}

export interface Pricing {
  perKwh: number;
  currency: string;
}
