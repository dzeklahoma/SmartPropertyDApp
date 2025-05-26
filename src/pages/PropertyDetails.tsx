import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, User, Calendar, CheckCircle, AlertCircle, DollarSign, ArrowLeft } from 'lucide-react';
import { PropertyDetailData, Transaction } from '../types/property.types';
import { useWeb3 } from '../context/Web3Context';

const PropertyDetails: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { web3, account, propertyFactoryContract, getPropertyContract } = useWeb3();
  
  const [property, setProperty] = useState<PropertyDetailData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sample transactions for display purposes
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (propertyId && propertyFactoryContract) {
      fetchPropertyDetails(parseInt(propertyId));
    } else {
      setIsLoading(false);
    }
  }, [propertyId, propertyFactoryContract]);

  const fetchPropertyDetails = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!propertyFactoryContract) return;
      
      // Get property contract address
      const propertyAddress = await propertyFactoryContract.methods.getPropertyById(id).call();
      
      if (!propertyAddress || propertyAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('Property not found');
      }
      
      const propertyContract = getPropertyContract(propertyAddress);
      
      if (!propertyContract) {
        throw new Error('Failed to get property contract');
      }
      
      // Get property details
      const details = await propertyContract.methods.getPropertyDetails().call();
      
      // Get transaction history (in a real application, this would query blockchain events)
      // For the MVP, we'll use mock data
      const mockTransactions: Transaction[] = [
        {
          id: '0x1234567890',
          type: 'CREATED',
          from: details[4], // Owner
          timestamp: Date.now() - 1000000
        }
      ];
      
      if (details[5]) { // If verified
        mockTransactions.push({
          id: '0x2345678901',
          type: 'VERIFIED',
          timestamp: Date.now() - 800000
        });
      }
      
      if (details[6]) { // If for sale
        mockTransactions.push({
          id: '0x3456789012',
          type: 'LISTED',
          price: details[3],
          timestamp: Date.now() - 600000
        });
      }
      
      setTransactions(mockTransactions);
      
      setProperty({
        id: parseInt(details[0]),
        address: details[1],
        details: details[2],
        price: details[3],
        owner: details[4],
        isVerified: details[5],
        isForSale: details[6],
        contractAddress: propertyAddress,
        transactionHistory: mockTransactions
      });
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details. The property may not exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBuyProperty = async () => {
    try {
      if (!property || !account || !web3) return;
      
      if (!property.isForSale) {
        alert('This property is not for sale');
        return;
      }
      
      const propertyContract = getPropertyContract(property.contractAddress);
      if (!propertyContract) {
        throw new Error('Failed to get property contract');
      }
      
      // Call the buyProperty function on the property contract
      await propertyContract.methods
        .buyProperty()
        .send({ from: account, value: property.price });
      
      // Refresh the property details
      await fetchPropertyDetails(property.id);
      
      alert('Property purchased successfully!');
    } catch (error) {
      console.error('Error buying property:', error);
      alert('Failed to buy property. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <ArrowLeft className="h-5 w-5 mr-2 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-3xl font-bold text-gray-800">Loading property details...</h1>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-6"></div>
          <div className="h-10 bg-gray-300 rounded w-48 mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <ArrowLeft className="h-5 w-5 mr-2 cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-3xl font-bold text-gray-800">Property Details</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <span>{error || 'Property not found.'}</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-red-700 font-medium hover:text-red-800 underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Property image placeholder
  const propertyImage = "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <ArrowLeft 
          className="h-5 w-5 mr-2 cursor-pointer hover:text-emerald-600 transition-colors" 
          onClick={() => navigate(-1)} 
        />
        <h1 className="text-3xl font-bold text-gray-800">Property Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Property Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Property Image */}
            <div className="relative h-64 sm:h-96">
              <img 
                src={propertyImage} 
                alt={property.address}
                className="w-full h-full object-cover"
              />
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {property.isVerified ? (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full flex items-center text-sm font-medium">
                    <CheckCircle size={16} className="mr-1.5" /> Verified
                  </span>
                ) : (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full flex items-center text-sm font-medium">
                    <AlertCircle size={16} className="mr-1.5" /> Pending Verification
                  </span>
                )}
              </div>
            </div>
            
            {/* Property Information */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{property.address}</h2>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={18} className="mr-1.5" />
                <span>Property ID: {property.id}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line mb-6">
                  {property.details}
                </p>
                
                <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Owner</h4>
                    <p className="flex items-center text-gray-800">
                      <User size={16} className="mr-1.5" />
                      {formatAddress(property.owner)}
                    </p>
                  </div>
                  
                  {property.isForSale && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Price</h4>
                      <p className="flex items-center text-gray-800 font-medium">
                        <DollarSign size={16} className="mr-1.5" />
                        {web3?.utils.fromWei(property.price, 'ether')} ETH
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    <p className="text-gray-800">
                      {property.isForSale ? 'For Sale' : 'Not For Sale'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              {property.isVerified && property.isForSale && property.owner !== account && (
                <div className="mt-6">
                  <button
                    onClick={handleBuyProperty}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-md font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full sm:w-auto flex items-center justify-center"
                  >
                    <DollarSign size={18} className="mr-2" />
                    Buy Property for {web3?.utils.fromWei(property.price, 'ether')} ETH
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Transaction History Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
            </div>
            
            <div className="p-6">
              {transactions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transaction history available.</p>
              ) : (
                <div className="space-y-6">
                  {transactions.map((tx, index) => (
                    <div 
                      key={tx.id}
                      className={`relative pl-6 ${
                        index !== transactions.length - 1 ? 'pb-6 border-l-2 border-gray-200' : ''
                      }`}
                    >
                      {/* Timeline Node */}
                      <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white"></div>
                      
                      {/* Transaction Content */}
                      <div>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(tx.timestamp)}
                        </span>
                        
                        <h4 className="text-sm font-semibold text-gray-800 mt-1">
                          {tx.type === 'CREATED' && 'Property Registered'}
                          {tx.type === 'VERIFIED' && 'Property Verified'}
                          {tx.type === 'LISTED' && 'Listed For Sale'}
                          {tx.type === 'SOLD' && 'Property Sold'}
                          {tx.type === 'PRICE_UPDATED' && 'Price Updated'}
                        </h4>
                        
                        <div className="mt-1 text-sm">
                          {tx.type === 'CREATED' && (
                            <p className="text-gray-600">
                              Registered by <span className="font-medium">{formatAddress(tx.from || '')}</span>
                            </p>
                          )}
                          
                          {tx.type === 'VERIFIED' && (
                            <p className="text-gray-600">
                              Verified by government admin
                            </p>
                          )}
                          
                          {tx.type === 'LISTED' && (
                            <p className="text-gray-600">
                              Listed for <span className="font-medium">{web3?.utils.fromWei(tx.price || '0', 'ether')} ETH</span>
                            </p>
                          )}
                          
                          {tx.type === 'SOLD' && (
                            <p className="text-gray-600">
                              Sold to <span className="font-medium">{formatAddress(tx.to || '')}</span> for <span className="font-medium">{web3?.utils.fromWei(tx.price || '0', 'ether')} ETH</span>
                            </p>
                          )}
                          
                          {tx.type === 'PRICE_UPDATED' && (
                            <p className="text-gray-600">
                              Price updated to <span className="font-medium">{web3?.utils.fromWei(tx.price || '0', 'ether')} ETH</span>
                            </p>
                          )}
                        </div>
                        
                        <a 
                          href={`https://etherscan.io/tx/${tx.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline mt-1 inline-block"
                        >
                          View on Etherscan
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Contract Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Contract Information</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Contract Address</h4>
                <p className="text-gray-800 break-all">
                  {property.contractAddress}
                </p>
                <a 
                  href={`https://etherscan.io/address/${property.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline mt-1 inline-block"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;