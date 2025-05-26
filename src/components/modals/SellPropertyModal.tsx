import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PropertyData } from "../../types/property.types";

interface SellPropertyModalProps {
  property: PropertyData;
  onClose: () => void;
  onSubmit: (propertyId: number, price: string) => Promise<void>;
}

const SellPropertyModal: React.FC<SellPropertyModalProps> = ({
  property,
  onClose,
  onSubmit,
}) => {
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setPrice(value);
      setError("");
    }
  };

  const validateForm = (): boolean => {
    if (!price) {
      setError("Please enter a price");
      return false;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Price must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(property.id, price);
      onClose();
    } catch (error) {
      console.error("Error listing property for sale:", error);
      setError("Failed to list property for sale. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-600 text-white px-6 py-4">
          <h3 className="text-lg font-semibold">List Property For Sale</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Property Address:</p>
            <p className="font-medium text-gray-800">{property.address}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sale Price (ETH)*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="text"
                  id="price"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className={`block w-full pr-12 pl-4 py-2 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">ETH</span>
                </div>
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
              <p>
                Once listed, your property will be available for purchase by
                other users at the specified price. The transaction will be
                executed on the blockchain and the funds will be transferred
                directly to your wallet.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  "List for Sale"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellPropertyModal;
