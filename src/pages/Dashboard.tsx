import React, { useState, useEffect } from "react";
import { Plus, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropertyList from "../components/common/PropertyList";
import PropertyRegistrationForm from "../components/forms/PropertyRegistrationForm";
import SellPropertyModal from "../components/modals/SellPropertyModal";
import EditPropertyModal from "../components/modals/EditPropertyModal";
import {
  PropertyData,
  PropertyRegistrationData,
} from "../types/property.types";
import { useWeb3 } from "../context/Web3Context";

type RawPropertyDetails = [
  string, // id (as string from BigNumber)
  string, // address
  string, // details
  string, // price (as string from BigNumber)
  string, // owner address
  boolean, // isVerified
  boolean // isForSale
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
  const [propertyToEdit, setPropertyToEdit] = useState<PropertyData | null>(
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

      const propertyIds = await propertyFactoryContract.methods
        .getPropertiesByOwner(account)
        .call();

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

      await propertyFactoryContract.methods
        .createProperty(data.address, data.details)
        .send({ from: account });

      await fetchMyProperties();
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
      if (!price || parseFloat(price) <= 0) {
        throw new Error("Price must be greater than 0 ETH");
      }

      const property = myProperties.find((p) => p.id === propertyId);
      if (!property || !account) {
        throw new Error("Property not found or wallet not connected");
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      const priceInWei = web3?.utils.toWei(price, "ether");

      await propertyContract.methods
        .setForSale(priceInWei)
        .send({ from: account });

      await fetchMyProperties();
      setPropertyForSale(null);
    } catch (error) {
      console.error("Error listing property for sale:", error);
      if (error instanceof Error) {
        alert("Failed to list property for sale: " + error.message);
      } else {
        alert("Failed to list property for sale: An unknown error occurred.");
      }
    }
  };

  const handleEditProperty = async (
    propertyId: number,
    updatedData: PropertyRegistrationData
  ) => {
    try {
      const property = myProperties.find((p) => p.id === propertyId);
      if (!property || !account) {
        throw new Error("Property not found or wallet not connected");
      }

      if (property.isVerified) {
        throw new Error("Verified properties cannot be edited");
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      await propertyContract.methods
        .updatePropertyDetails(updatedData.details)
        .send({ from: account });

      await fetchMyProperties();
      setPropertyToEdit(null);
    } catch (error) {
      console.error("Error updating property:", error);
      alert(
        "Failed to update property: " +
          (error instanceof Error ? error.message : "An unknown error occurred")
      );
    }
  };

  const handleBuyProperty = async (property: PropertyData) => {
    try {
      if (!account) throw new Error("Wallet not connected");
      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) throw new Error("Property contract not found");

      await propertyContract.methods.buyProperty().send({
        from: account,
        value: property.price,
      });

      await fetchMyProperties();
    } catch (error) {
      console.error("Failed to buy property:", error);
      alert(
        "Failed to buy property: " +
          (error instanceof Error ? error.message : "An unknown error occurred")
      );
    }
  };
  const handleRemoveFromSale = async (property: PropertyData) => {
    try {
      if (!property || !account) {
        throw new Error("Property not found or wallet not connected");
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      await propertyContract.methods.removeFromSale().send({ from: account });

      await fetchMyProperties();
    } catch (error) {
      console.error("Error removing property from sale:", error);
      alert(
        "Failed to remove property from sale: " +
          (error instanceof Error ? error.message : "An unknown error occurred")
      );
    }
  };

  const handleViewDetails = (property: PropertyData) => {
    navigate(`/property/${property.id}`);
  };

  const handleEditClick = (property: PropertyData) => {
    setPropertyToEdit(property);
  };

  const handleSellClick = (property: PropertyData) => {
    setPropertyForSale(property);
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
          onBuy={handleBuyProperty}
          onViewDetails={handleViewDetails}
          onEdit={handleEditClick}
          onSell={handleSellClick}
          onRemoveFromSale={handleRemoveFromSale}
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

        {propertyToEdit && (
          <EditPropertyModal
            property={propertyToEdit}
            onClose={() => setPropertyToEdit(null)}
            onSubmit={handleEditProperty}
          />
        )}
      </>
    );
  };

  return <div className="max-w-7xl mx-auto p-4">{renderContent()}</div>;
};

export default Dashboard;
