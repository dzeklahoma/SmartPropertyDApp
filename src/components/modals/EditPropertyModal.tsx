import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import {
  PropertyData,
  PropertyRegistrationData,
} from "../../types/property.types";

interface EditPropertyModalProps {
  property: PropertyData;
  onClose: () => void;
  onSubmit: (propertyId: number, data: PropertyRegistrationData) => void;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  property,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<PropertyRegistrationData>({
    address: property.address,
    details: property.details,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    address: "",
    details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { address: "", details: "" };

    if (!formData.address.trim()) {
      newErrors.address = "Property address is required";
      valid = false;
    }

    if (!formData.details.trim()) {
      newErrors.details = "Property details are required";
      valid = false;
    } else if (formData.details.length < 20) {
      newErrors.details = "Property details must be at least 20 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSubmitting(true);
        await onSubmit(property.id, {
          address: property.address,
          details: formData.details,
        });

        onClose();
      } catch (error) {
        console.error("Error updating property:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800">Edit Property</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Property Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              readOnly
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="details"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Property Details*
            </label>
            <textarea
              id="details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your property (size, bedrooms, bathrooms, year built, etc.)"
              className={`w-full px-4 py-2 border ${
                errors.details ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              disabled={isSubmitting}
            />
            {errors.details && (
              <p className="mt-1 text-sm text-red-600">{errors.details}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyModal;
