export interface PropertyData {
  id: number;
  address: string;
  details: string;
  price: string;
  owner: string;
  isVerified: boolean;
  isForSale: boolean;
  contractAddress: string;
}

export interface PropertyDetailData extends PropertyData {
  transactionHistory: Transaction[];
}

export interface Transaction {
  id: string;
  type: "CREATED" | "VERIFIED" | "LISTED" | "SOLD" | "PRICE_UPDATED";
  from?: string;
  to?: string;
  price?: string;
  timestamp: number;
}

export interface PropertyListProps {
  title: string;
  properties: PropertyData[];
  showActions?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  onVerify?: (property: PropertyData) => void;
}

export interface PropertyCardProps {
  property: PropertyData;
  showActions?: boolean;
  onViewDetails?: (property: PropertyData) => void;
  onBuy?: (property: PropertyData) => void;
  onVerify?: (property: PropertyData) => void;
  onSell?: (property: PropertyData) => void;
  onEdit?: (property: PropertyData) => void;
}

export interface PropertyRegistrationData {
  address: string;
  details: string;
  images?: File[];
}

export interface SellPropertyData {
  price: string;
}

// Type for getPropertyDetails response from smart contract
export interface PropertyDetailsResponse {
  0: string; // id
  1: string; // address
  2: string; // details
  3: string; // price
  4: string; // owner
  5: boolean; // isVerified
  6: boolean; // isForSale
}
