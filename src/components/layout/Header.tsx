import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, Menu, X, Wallet } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";

const Header: React.FC = () => {
  const { account, isConnected, isAdmin, connectWallet, disconnectWallet } =
    useWeb3();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Building2
              size={32}
              className="text-emerald-300 group-hover:text-white transition-colors duration-300"
            />
            <div>
              <h1 className="text-2xl font-bold leading-none">SmartProperty</h1>
              <p className="text-xs text-emerald-300">Blockchain Real Estate</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/"
              className={`hover:text-emerald-300 transition-colors ${
                isActive("/")
                  ? "text-white font-semibold border-b-2 border-white"
                  : "text-gray-200"
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`hover:text-emerald-300 transition-colors ${
                isActive("/marketplace")
                  ? "text-white font-semibold border-b-2 border-white"
                  : "text-gray-200"
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/dashboard"
              className={`hover:text-emerald-300 transition-colors ${
                isActive("/dashboard")
                  ? "text-white font-semibold border-b-2 border-white"
                  : "text-gray-200"
              }`}
            >
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`hover:text-emerald-300 transition-colors ${
                  isActive("/admin")
                    ? "text-white font-semibold border-b-2 border-white"
                    : "text-gray-200"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>{account ? truncateAddress(account) : ""}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="bg-white text-emerald-800 px-4 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-emerald-800 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`p-2 rounded ${
                  isActive("/") ? "bg-emerald-800 font-semibold" : ""
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`p-2 rounded ${
                  isActive("/marketplace") ? "bg-emerald-800 font-semibold" : ""
                }`}
                onClick={closeMenu}
              >
                Marketplace
              </Link>
              <Link
                to="/dashboard"
                className={`p-2 rounded ${
                  isActive("/dashboard") ? "bg-emerald-800 font-semibold" : ""
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`p-2 rounded ${
                    isActive("/admin") ? "bg-emerald-800 font-semibold" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}
              {isConnected ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-emerald-600">
                  <div className="bg-emerald-800 px-3 py-2 rounded-full text-sm flex items-center self-start">
                    <Wallet className="h-4 w-4 mr-2" />
                    <span>{account ? truncateAddress(account) : ""}</span>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      closeMenu();
                    }}
                    className="bg-white text-emerald-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors self-start"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    closeMenu();
                  }}
                  className="bg-white text-emerald-800 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors flex items-center self-start mt-2"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
