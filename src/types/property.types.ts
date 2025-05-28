// Individual property data from the blockchain
export interface PropertyData {
  id: number;
  address: string;
  details: string;
  price: string; // in wei (converted when displayed)
  owner: string;
  isVerified: boolean;
  isForSale: boolean;
  contractAddress: string;
}

// Extended property with transaction history
export interface PropertyDetailData extends PropertyData {
  transactionHistory: Transaction[];
}

// Event or lifecycle transactions of a property
export interface Transaction {
  id: string;
  type: "CREATED" | "VERIFIED" | "LISTED" | "SOLD" | "PRICE_UPDATED";
  from?: string;
  to?: string;
  price?: string;
  timestamp: number; // UNIX timestamp
}

// Props for list view of multiple properties
export interface PropertyListProps {
  title: string;
  properties: PropertyData[];
  showActions?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  onVerify?: (property: PropertyData) => void;
  onBuy?: (property: PropertyData) => void;
  onSell?: (property: PropertyData) => void;
}

// Props for a single property card
export interface PropertyCardProps {
  property: PropertyData;
  showActions?: boolean;
  onViewDetails?: (property: PropertyData) => void;
  onBuy?: (property: PropertyData) => void;
  onVerify?: (property: PropertyData) => void;
  onSell?: (property: PropertyData) => void;
  onEdit?: (property: PropertyData) => void;
  isOwnedByUser?: boolean;
}

// Data used when registering a property
export interface PropertyRegistrationData {
  address: string;
  details: string;
  images?: File[]; // Not stored on-chain, used for uploads
}

// Data used when selling a property
export interface SellPropertyData {
  price: string; // in ETH or wei
}

// Type for raw smart contract response
export interface PropertyDetailsResponse {
  0: string; // id
  1: string; // address
  2: string; // details
  3: string; // price
  4: string; // owner
  5: boolean; // isVerified
  6: boolean; // isForSale
}
