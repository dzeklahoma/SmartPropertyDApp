import React from "react";
import PropertyCard from "../common/PropertyCard";
import { PropertyCardProps } from "../../types/property.types";

interface PropertyListProps {
  properties: PropertyCardProps["property"][];
  onViewDetails?: (property: PropertyCardProps["property"]) => void;
  onBuy?: (property: PropertyCardProps["property"]) => void;
  onSell?: (property: PropertyCardProps["property"]) => void;
  onVerify?: (property: PropertyCardProps["property"]) => void;
  onEdit?: (property: PropertyCardProps["property"]) => void;
  showActions?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  title?: string;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onViewDetails,
  onBuy,
  onSell,
  onVerify,
  onEdit,
  showActions = true,
  isLoading = false,
  emptyMessage = "No properties found",
  title = "Property Marketplace",
}) => {
  // loading and error handling if any...

  if (isLoading) return <div>Loading properties...</div>;
  if (properties.length === 0) return <div>{emptyMessage}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.contractAddress}
            property={property}
            showActions={showActions}
            onBuy={onBuy}
            onSell={onSell}
            onVerify={onVerify}
            onEdit={onEdit}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
