import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Coins, Database, ArrowRight } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

const Home: React.FC = () => {
  const { connectWallet, isConnected } = useWeb3();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-800 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Revolutionizing Real Estate <br /> with Blockchain Technology
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl opacity-90">
            Register, verify, and trade properties securely on the blockchain with SmartProperty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Connect Wallet
              </button>
            ) : (
              <Link
                to="/marketplace"
                className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Explore Properties
              </Link>
            )}
            <Link
              to="/dashboard"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How SmartProperty Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A transparent and secure process for property registration and ownership transfer.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Register Your Property</h3>
              <p className="text-gray-600">
                Create an NFT representation of your property with all relevant details and documentation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Government Verification</h3>
              <p className="text-gray-600">
                Property details are verified by authorized government entities for authenticity.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
                <Coins size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Buy and Sell Securely</h3>
              <p className="text-gray-600">
                List your property for sale or purchase available properties with secure blockchain transactions.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/how-it-works" className="inline-flex items-center text-emerald-600 font-medium hover:text-emerald-700">
              Learn more about the process <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose SmartProperty?</h2>
              <p className="text-xl text-gray-600 mb-8">
                SmartProperty leverages blockchain technology to provide a secure, transparent, and efficient real estate transaction platform.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mr-4 mt-1">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Enhanced Security</h3>
                    <p className="text-gray-600">
                      Blockchain technology ensures tamper-proof records of property ownership and transactions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mr-4 mt-1">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Transparent History</h3>
                    <p className="text-gray-600">
                      Complete transaction history provides clear provenance and ownership records.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 mr-4 mt-1">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Reduced Costs</h3>
                    <p className="text-gray-600">
                      Eliminate intermediaries and reduce fees associated with traditional property transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <img
                src="https://images.pexels.com/photos/5876703/pexels-photo-5876703.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="SmartProperty Benefits"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-emerald-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Real Estate Experience?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join SmartProperty today and experience the future of property transactions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Connect Wallet
              </button>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-emerald-800 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Go to Dashboard
              </Link>
            )}
            <Link
              to="/marketplace"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;