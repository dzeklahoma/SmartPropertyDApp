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

  // State for unverified properties (your existing feature)
  const [unverifiedProperties, setUnverifiedProperties] = useState<
    PropertyData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for owner search
  const [ownerAddressInput, setOwnerAddressInput] = useState<string>("");
  const [ownerProperties, setOwnerProperties] = useState<PropertyData[]>([]);
  const [isOwnerLoading, setIsOwnerLoading] = useState<boolean>(false);
  const [ownerError, setOwnerError] = useState<string | null>(null);

  // State for property ID search
  const [propertyIdInput, setPropertyIdInput] = useState<string>("");
  const [propertyById, setPropertyById] = useState<PropertyData | null>(null);
  const [isPropertyIdLoading, setIsPropertyIdLoading] =
    useState<boolean>(false);
  const [propertyIdError, setPropertyIdError] = useState<string | null>(null);

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

  // Fetch unverified properties for admin verification
  const fetchUnverifiedProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!propertyFactoryContract) return;

      const propertyAddresses: string[] = await propertyFactoryContract.methods
        .getAllProperties()
        .call();

      const propertiesData: PropertyData[] = [];

      for (const address of propertyAddresses) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(address);

          if (propertyContract) {
            try {
              const details: PropertyDetailsResponse =
                await propertyContract.methods.getPropertyDetails().call();

              if (!details[5]) {
                // Not verified
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
            } catch (err) {
              console.error("Error fetching property details:", err);
            }
          }
        }
      }

      setUnverifiedProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching unverified properties:", error);
      setError("Failed to load unverified properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Admin verifies a property
  const handleVerifyProperty = async (property: PropertyData) => {
    try {
      if (!isConnected || !account) {
        toast.error("You must be connected as an admin to verify properties");
        return;
      }
      if (!propertyFactoryContract) {
        toast.error("Property factory contract is not initialized");
        return;
      }

      // Confirm connected account is government/admin
      const governmentAddress = await propertyFactoryContract.methods
        .governmentAddress()
        .call();

      if (account.toLowerCase() !== governmentAddress.toLowerCase()) {
        toast.error("Connected account is not the government/admin address");
        return;
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      await propertyContract.methods.verifyProperty().send({ from: account });

      toast.success("Property verified successfully!");

      // Refresh list
      await fetchUnverifiedProperties();
    } catch (error) {
      console.error("Error verifying property:", error);
      toast.error("Failed to verify property. Please try again.");
    }
  };

  // Fetch all properties by a given owner address
  const fetchPropertiesByOwner = async (ownerAddress: string) => {
    if (!web3 || !web3.utils.isAddress(ownerAddress)) {
      setOwnerError("Invalid Ethereum address.");
      setOwnerProperties([]);
      return;
    }

    try {
      setIsOwnerLoading(true);
      setOwnerError(null);
      setOwnerProperties([]);

      if (!propertyFactoryContract) return;

      const propertyAddresses: string[] = await propertyFactoryContract.methods
        .getAllProperties()
        .call();

      const filteredProperties: PropertyData[] = [];

      for (const address of propertyAddresses) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(address);

          if (propertyContract) {
            try {
              const details: PropertyDetailsResponse =
                await propertyContract.methods.getPropertyDetails().call();

              if (details[4].toLowerCase() === ownerAddress.toLowerCase()) {
                filteredProperties.push({
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
            } catch (err) {
              console.error("Error fetching property details:", err);
            }
          }
        }
      }

      setOwnerProperties(filteredProperties);

      if (filteredProperties.length === 0) {
        setOwnerError("No properties found for this owner.");
      }
    } catch (error) {
      console.error("Error fetching properties by owner:", error);
      setOwnerError("Failed to load properties for this owner.");
      setOwnerProperties([]);
    } finally {
      setIsOwnerLoading(false);
    }
  };

  // Fetch property by its ID
  const fetchPropertyById = async (propertyIdStr: string) => {
    const propertyId = parseInt(propertyIdStr);
    if (isNaN(propertyId) || propertyId < 0) {
      setPropertyIdError("Please enter a valid positive integer Property ID.");
      setPropertyById(null);
      return;
    }

    try {
      setIsPropertyIdLoading(true);
      setPropertyIdError(null);
      setPropertyById(null);

      if (!propertyFactoryContract) return;

      const propertyAddresses: string[] = await propertyFactoryContract.methods
        .getAllProperties()
        .call();

      let foundProperty: PropertyData | null = null;

      for (const address of propertyAddresses) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(address);

          if (propertyContract) {
            try {
              const details: PropertyDetailsResponse =
                await propertyContract.methods.getPropertyDetails().call();

              if (parseInt(details[0]) === propertyId) {
                foundProperty = {
                  id: parseInt(details[0]),
                  address: details[1],
                  details: details[2],
                  price: details[3],
                  owner: details[4],
                  isVerified: details[5],
                  isForSale: details[6],
                  contractAddress: address,
                };
                break;
              }
            } catch (err) {
              console.error("Error fetching property details:", err);
            }
          }
        }
      }

      if (foundProperty) {
        setPropertyById(foundProperty);
      } else {
        setPropertyIdError(`No property found with ID ${propertyId}.`);
      }
    } catch (error) {
      console.error("Error fetching property by ID:", error);
      setPropertyIdError("Failed to fetch property. Please try again.");
      setPropertyById(null);
    } finally {
      setIsPropertyIdLoading(false);
    }
  };

  if (!isConnected || !isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header + Refresh */}
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

      {/* Error message for unverified properties */}
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

      {/* Divider */}
      <hr className="my-10 border-gray-300" />

      {/* Search by Owner Address */}
      <div className="mb-6 max-w-lg mx-auto">
        <label
          htmlFor="ownerAddress"
          className="block mb-2 font-semibold text-gray-700"
        >
          Search Properties by Owner Address
        </label>
        <div className="flex gap-2">
          <input
            id="ownerAddress"
            type="text"
            placeholder="0x..."
            value={ownerAddressInput}
            onChange={(e) => setOwnerAddressInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchPropertiesByOwner(ownerAddressInput)}
            disabled={!web3?.utils.isAddress(ownerAddressInput)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
        {ownerError && <p className="text-red-600 mt-2">{ownerError}</p>}
      </div>

      {/* Properties for Owner */}
      <PropertyList
        title={`Properties Owned by ${ownerAddressInput || ""}`}
        properties={ownerProperties}
        showActions={false}
        isLoading={isOwnerLoading}
        emptyMessage="No properties found for this owner."
      />

      {/* Divider */}
      <hr className="my-10 border-gray-300" />

      {/* Search by Property ID */}
      <div className="mb-6 max-w-lg mx-auto">
        <label
          htmlFor="propertyId"
          className="block mb-2 font-semibold text-gray-700"
        >
          Search Property by ID
        </label>
        <div className="flex gap-2">
          <input
            id="propertyId"
            type="text"
            placeholder="Property ID (number)"
            value={propertyIdInput}
            onChange={(e) => setPropertyIdInput(e.target.value)}
            className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchPropertyById(propertyIdInput)}
            disabled={!propertyIdInput.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
        {propertyIdError && (
          <p className="text-red-600 mt-2">{propertyIdError}</p>
        )}
      </div>

      {/* Single Property By ID Display */}
      {propertyById ? (
        <PropertyList
          title={`Property with ID: ${propertyById.id}`}
          properties={[propertyById]}
          showActions={false}
          isLoading={false}
        />
      ) : null}
    </div>
  );
};

export default AdminPanel;
