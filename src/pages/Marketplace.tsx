import React, { useState, useEffect } from "react";
import { Search, Filter, AlertCircle } from "lucide-react";
import PropertyList from "../components/common/PropertyList";
import { PropertyData } from "../types/property.types";
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

const Marketplace: React.FC = () => {
  const {
    web3,
    account,
    isConnected,
    propertyFactoryContract,
    getPropertyContract,
  } = useWeb3();

  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState({
    onlyVerified: true,
    onlyForSale: true,
  });

  useEffect(() => {
    if (propertyFactoryContract) {
      fetchAllProperties();
    } else {
      setIsLoading(false);
    }
  }, [propertyFactoryContract]);

  useEffect(() => {
    applyFilters();
  }, [properties, search, filters]);

  const fetchAllProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!propertyFactoryContract) return;

      // Get all property contract addresses
      const propertyAddresses: any[] = (await propertyFactoryContract.methods
        .getAllProperties()
        .call()) as RawPropertyDetails;

      // Get property details for each address
      const propertiesData: PropertyData[] = [];

      for (const address of propertyAddresses) {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          const propertyContract = getPropertyContract(address);

          if (propertyContract) {
            const details = (await propertyContract.methods
              .getPropertyDetails()
              .call()) as RawPropertyDetails;

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
        }
      }

      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError("Failed to load properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...properties];

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (property) =>
          property.address.toLowerCase().includes(searchLower) ||
          property.details.toLowerCase().includes(searchLower) ||
          property.id.toString().includes(searchLower)
      );
    }

    // Apply verification filter
    if (filters.onlyVerified) {
      result = result.filter((property) => property.isVerified);
    }

    // Apply for sale filter
    if (filters.onlyForSale) {
      result = result.filter((property) => property.isForSale);
    }

    setFilteredProperties(result);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  const handleBuyProperty = async (property: PropertyData) => {
    try {
      if (!isConnected || !account || !web3) {
        alert("Please connect your wallet first");
        return;
      }

      if (!property.isForSale) {
        alert("This property is not for sale");
        return;
      }

      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error("Failed to get property contract");
      }

      // Call the buyProperty function on the property contract
      await propertyContract.methods
        .buyProperty()
        .send({ from: account, value: property.price });

      // Refresh the property list
      await fetchAllProperties();

      alert("Property purchased successfully!");
    } catch (error) {
      console.error("Error buying property:", error);
      alert("Failed to buy property. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Property Marketplace
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search properties by address, details, or ID"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="onlyVerified"
                name="onlyVerified"
                checked={filters.onlyVerified}
                onChange={handleFilterChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="onlyVerified"
                className="ml-2 text-sm text-gray-700"
              >
                Verified only
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="onlyForSale"
                name="onlyForSale"
                checked={filters.onlyForSale}
                onChange={handleFilterChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label
                htmlFor="onlyForSale"
                className="ml-2 text-sm text-gray-700"
              >
                For sale only
              </label>
            </div>

            <button
              onClick={fetchAllProperties}
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Properties List */}
      <PropertyList
        title="Available Properties"
        properties={filteredProperties}
        isLoading={isLoading}
        emptyMessage={
          search || !filters.onlyVerified || !filters.onlyForSale
            ? "No properties match your search criteria."
            : "No properties are currently available for sale."
        }
        onBuy={handleBuyProperty}
      />
    </div>
  );
};

export default Marketplace;
