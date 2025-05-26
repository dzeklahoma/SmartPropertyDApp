import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { PropertyRegistrationData } from "../../types/property.types";

interface PropertyRegistrationFormProps {
  onSubmit: (data: PropertyRegistrationData) => void;
  isSubmitting: boolean;
}

const PropertyRegistrationForm: React.FC<PropertyRegistrationFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<PropertyRegistrationData>({
    address: "",
    details: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    address: "",
    details: "",
    images: "",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 5) {
        setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }));
        return;
      }

      setImages((prev) => [...prev, ...newImages]);

      // Create preview URLs
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      // Clear error
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = { address: "", details: "", images: "" };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        images: images.length > 0 ? images : undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          onChange={handleChange}
          placeholder="123 Blockchain Street, Crypto City"
          className={`w-full px-4 py-2 border ${
            errors.address ? "border-red-500" : "border-gray-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
          disabled={isSubmitting}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Property Images (Optional, max 5)
        </label>

        <div className="mt-2 flex flex-wrap gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative w-24 h-24">
              <img
                src={url}
                alt={`Property preview ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {previewUrls.length < 5 && (
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
                disabled={isSubmitting}
              />
              <Upload size={24} className="text-gray-400" />
            </label>
          )}
        </div>

        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload up to 5 images of your property. Supported formats: JPG, PNG.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-70 flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            "Register Property"
          )}
        </button>
      </div>
    </form>
  );
};

export default PropertyRegistrationForm;
