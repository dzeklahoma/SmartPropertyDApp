import React from "react";
import {
  Building2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Eye,
  Edit,
} from "lucide-react";
import { PropertyCardProps } from "../../types/property.types";
import { formatEther } from "ethers/lib/utils";
import { useWeb3 } from "../../context/Web3Context";

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  showActions = true,
  onViewDetails,
  onBuy,
  onVerify,
  onSell,
  onEdit,
}) => {
  const { account } = useWeb3(); // Get the current user's address from context

  // Property image placeholder - in a real app this would come from the property data
  const propertyImage =
    "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600";

  // Format owner address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Format price from wei to ETH
  const formattedPrice = property.price
    ? `${formatEther(property.price)} ETH`
    : "Not for sale";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Property Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={propertyImage}
          alt={property.address}
          className="w-full h-full object-cover"
        />
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {property.isVerified ? (
            <span className="bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              <CheckCircle size={12} className="mr-1" /> Verified
            </span>
          ) : (
            <span className="bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
              <AlertCircle size={12} className="mr-1" /> Pending Verification
            </span>
          )}
        </div>
      </div>

      {/* Property Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
              {property.address}
            </h3>
            <p className="text-sm text-gray-500 mb-2">ID: {property.id}</p>
          </div>
          {property.isForSale && (
            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm font-medium flex items-center">
              <DollarSign size={14} className="mr-1" />
              {formattedPrice}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {property.details}
        </p>

        <div className="flex items-center text-xs text-gray-500 mb-4">
          <Building2 size={14} className="mr-1" />
          <span>Owner: {formatAddress(property.owner)}</span>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={() => onViewDetails && onViewDetails(property)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1.5 px-3 rounded flex items-center justify-center transition-colors"
            >
              <Eye size={14} className="mr-1.5" /> Details
            </button>

            {!property.isVerified &&
              property.owner === "currentUserAddress" && (
                <button
                  onClick={() => onEdit && onEdit(property)}
                  className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm py-1.5 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <Edit size={14} className="mr-1.5" /> Edit
                </button>
              )}

            {!property.isVerified &&
              property.owner !== "currentUserAddress" && (
                <button
                  onClick={() => onVerify && onVerify(property)}
                  className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm py-1.5 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <CheckCircle size={14} className="mr-1.5" /> Verify
                </button>
              )}

            {property.isVerified &&
              property.owner === "currentUserAddress" &&
              !property.isForSale && (
                <button
                  onClick={() => onSell && onSell(property)}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm py-1.5 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <DollarSign size={14} className="mr-1.5" /> Sell
                </button>
              )}

            {property.isVerified &&
              property.isForSale &&
              property.owner !== "currentUserAddress" && (
                <button
                  onClick={() => onBuy && onBuy(property)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-1.5 px-3 rounded flex items-center justify-center transition-colors"
                >
                  <DollarSign size={14} className="mr-1.5" /> Buy Now
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
