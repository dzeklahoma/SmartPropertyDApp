import React from "react";
import PropertyCard from "./PropertyCard";
import { PropertyListProps, PropertyData } from "../../types/property.types";
import { Building2 } from "lucide-react";

const PropertyList: React.FC<PropertyListProps> = ({
  title,
  properties,
  showActions = true,
  isLoading = false,
  emptyMessage = "No properties found.",
  onVerify,
}) => {
  const handleViewDetails = (property: PropertyData) => {
    // Navigate to property details page or open modal
    console.log("View details:", property);
  };

  const handleBuy = (property: PropertyData) => {
    // Implement buy functionality
    console.log("Buy property:", property);
  };

  const handleSell = (property: PropertyData) => {
    // Implement sell functionality
    console.log("Sell property:", property);
  };

  const handleEdit = (property: PropertyData) => {
    // Implement edit functionality
    console.log("Edit property:", property);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden h-80 animate-pulse"
            >
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  <div className="h-8 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.contractAddress}
            property={property}
            showActions={showActions}
            onViewDetails={handleViewDetails}
            onBuy={handleBuy}
            onVerify={onVerify}
            onSell={handleSell}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default PropertyList;
