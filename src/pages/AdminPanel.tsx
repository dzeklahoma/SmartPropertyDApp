import React, { useState, useEffect } from "react";
import { ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import PropertyList from "../components/common/PropertyList";
import { PropertyData, PropertyDetailsResponse } from "../types/property.types";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminPanel: React.FC = () => {
  const {
    web3,
    account,
    isConnected,
    isAdmin,
    propertyFactoryContract,
    getPropertyContract,
  } = useWeb3();
  const navigate = useNavigate();

  const [unverifiedProperties, setUnverifiedProperties] = useState<
    PropertyData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !isAdmin) {
      navigate("/");
      return;
    }

    if (propertyFactoryContract) {
      fetchUnverifiedProperties();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, isAdmin, propertyFactoryContract, navigate]);

  const fetchUnverifiedProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!propertyFactoryContract) return;

      console.log("Fetching properties as admin:", account);

      // Get all property contract addresses
      const propertyAddresses = (await propertyFactoryContract.methods
        .getAllProperties()
        .call()) as string[];
      console.log("Property addresses:", propertyAddresses);

      // Get property details for each address and filter for unverified ones
      const propertiesData: PropertyData[] = [];

      for (const address of propertyAddresses) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(address);

          if (propertyContract) {
            try {
              console.log("Fetching details for property at:", address);
              const details = (await propertyContract.methods
                .getPropertyDetails()
                .call()) as PropertyDetailsResponse;

              if (!details[5]) {
                // !isVerified
                propertiesData.push({
                  id: parseInt(details[0]),
                  address: details[1],
                  details: details[2],
                  price: details[3],
                  owner: details[4],
                  isVerified: details[5],
                  isForSale: details[6],
                  contractAddress: address,
                });
              }
            } catch (error) {
              console.error("Error fetching property details:", error);
            }
          }
        }
      }

      console.log("Unverified properties:", propertiesData);
      setUnverifiedProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching unverified properties:", error);
      setError("Failed to load unverified properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyProperty = async (property: PropertyData) => {
    try {
      if (!isConnected || !account || !isAdmin) {
        toast.error("You must be connected as an admin to verify properties");
        return;
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      console.log("Verifying property:", property.id);
      console.log("Using account:", account);

      // Call the verifyProperty function on the property contract
      const tx = await propertyContract.methods
        .verifyProperty()
        .send({ from: account });

      console.log("Verification transaction:", tx);

      // Refresh the property list
      await fetchUnverifiedProperties();

      toast.success("Property verified successfully!");
    } catch (error) {
      console.error("Error verifying property:", error);
      toast.error("Failed to verify property. Please try again.");
    }
  };

  if (!isConnected || !isAdmin) {
    return null; // The useEffect will handle redirecting
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Verify and manage property registrations
          </p>
        </div>
        <button
          onClick={fetchUnverifiedProperties}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh List
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start">
        <ShieldCheck className="h-6 w-6 text-blue-500 mr-3 mt-0.5" />
        <div>
          <h3 className="text-lg font-semibold text-blue-800 mb-1">
            Government Admin Access
          </h3>
          <p className="text-blue-700">
            As a government administrator, you can verify properties to confirm
            their existence and legitimacy. Once verified, property owners can
            list them for sale on the marketplace.
          </p>
        </div>
      </div>

      {/* Properties Pending Verification */}
      <PropertyList
        title="Properties Pending Verification"
        properties={unverifiedProperties}
        showActions={true}
        isLoading={isLoading}
        emptyMessage="No properties are pending verification."
        onVerify={handleVerifyProperty}
      />
    </div>
  );
};

export default AdminPanel;
