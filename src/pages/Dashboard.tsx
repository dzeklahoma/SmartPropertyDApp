import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import PropertyList from "../components/common/PropertyList";
import PropertyRegistrationForm from "../components/forms/PropertyRegistrationForm";
import SellPropertyModal from "../components/modals/SellPropertyModal";
import {
  PropertyData,
  PropertyRegistrationData,
} from "../types/property.types";
import { useWeb3 } from "../context/Web3Context";

const Dashboard: React.FC = () => {
  const {
    web3,
    account,
    isConnected,
    propertyFactoryContract,
    getPropertyContract,
    connectWallet,
  } = useWeb3();

  const [myProperties, setMyProperties] = useState<PropertyData[]>([]);
  const [showRegistrationForm, setShowRegistrationForm] =
    useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [propertyForSale, setPropertyForSale] = useState<PropertyData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && account && propertyFactoryContract) {
      fetchMyProperties();
    } else {
      setIsLoading(false);
    }
  }, [isConnected, account, propertyFactoryContract]);

  const fetchMyProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!propertyFactoryContract || !account) return;

      // Get property IDs owned by the current user
      const propertyIds = await propertyFactoryContract.methods
        .getPropertiesByOwner(account)
        .call();

      // Get property details for each ID
      const propertiesData: PropertyData[] = [];

      for (const id of propertyIds) {
        const propertyAddress = await propertyFactoryContract.methods
          .getPropertyById(id)
          .call();
        if (
          propertyAddress &&
          propertyAddress !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(propertyAddress);

          if (propertyContract) {
            const details = await propertyContract.methods
              .getPropertyDetails()
              .call();

            propertiesData.push({
              id: parseInt(details[0]),
              address: details[1],
              details: details[2],
              price: details[3],
              owner: details[4],
              isVerified: details[5],
              isForSale: details[6],
              contractAddress: propertyAddress,
            });
          }
        }
      }

      setMyProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to load your properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyRegistration = async (data: PropertyRegistrationData) => {
    try {
      setIsSubmitting(true);

      if (!propertyFactoryContract || !account) {
        throw new Error("Wallet not connected or contract not available");
      }

      // Call the createProperty function on the smart contract
      await propertyFactoryContract.methods
        .createProperty(data.address, data.details)
        .send({ from: account });

      // Refresh the property list
      await fetchMyProperties();

      // Hide the form
      setShowRegistrationForm(false);
    } catch (error) {
      console.error("Error registering property:", error);
      setError("Failed to register property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSellProperty = async (propertyId: number, price: string) => {
    try {
      const property = myProperties.find((p) => p.id === propertyId);
      if (!property || !account) {
        throw new Error("Property not found or wallet not connected");
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      // Convert price from ETH to Wei
      const priceInWei = web3?.utils.toWei(price, "ether");

      // Call the setForSale function on the property contract
      await propertyContract.methods
        .setForSale(priceInWei)
        .send({ from: account });

      // Refresh the property list
      await fetchMyProperties();

      // Close the modal
      setPropertyForSale(null);
    } catch (error) {
      console.error("Error listing property for sale:", error);
      throw error;
    }
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-3">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Please connect your Ethereum wallet to view your properties and
            access dashboard features.
          </p>
          <button
            onClick={connectWallet}
            className="bg-emerald-600 text-white px-6 py-2 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    return (
      <>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Dashboard</h2>
          <div className="flex space-x-2">
            <button
              onClick={fetchMyProperties}
              className="flex items-center text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </button>
            <button
              onClick={() => setShowRegistrationForm(!showRegistrationForm)}
              className="flex items-center text-white bg-emerald-600 hover:bg-emerald-700 rounded-md px-3 py-1.5 text-sm"
            >
              <Plus size={16} className="mr-1" />
              Register Property
            </button>
          </div>
        </div>

        {showRegistrationForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Register New Property
            </h3>
            <PropertyRegistrationForm
              onSubmit={handlePropertyRegistration}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        <PropertyList
          title="My Properties"
          properties={myProperties}
          showActions={true}
          isLoading={isLoading}
          emptyMessage="You don't have any registered properties yet. Use the 'Register Property' button to add one."
        />

        {propertyForSale && (
          <SellPropertyModal
            property={propertyForSale}
            onClose={() => setPropertyForSale(null)}
            onSubmit={handleSellProperty}
          />
        )}
      </>
    );
  };

  return <div className="container mx-auto px-4 py-8">{renderContent()}</div>;
};

export default Dashboard;
