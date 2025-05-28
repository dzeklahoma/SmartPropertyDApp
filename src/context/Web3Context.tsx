import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import PropertyFactoryJSON from "../contracts/PropertyFactory.json";
import PropertyJSON from "../contracts/Property.json";
import type { AbiItem } from "web3-utils";

//type PropertyFactoryAbi = typeof PropertyFactoryJSON.abi;
//type PropertyAbi = typeof PropertyJSON.abi;

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  propertyFactoryContract: Contract | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getPropertyContract: (address: string) => Contract | null;
  loading: boolean;
  error: string | null;
}

const PROPERTY_FACTORY_ADDRESS = import.meta.env.VITE_PROPERTY_FACTORY_ADDRESS;
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const GOVERNMENT_ADDRESS = import.meta.env.VITE_GOVERNMENT_ADDRESS;

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [propertyFactoryContract, setPropertyFactoryContract] =
    useState<Contract | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        setLoading(true);
        // Check if MetaMask is installed
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          // Check if user is already connected
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);

            // Initialize contracts
            initializeContracts(web3Instance, accounts[0]);
          }
        } else {
          // Fallback to Sepolia RPC
          const web3Instance = new Web3(SEPOLIA_RPC_URL);
          setWeb3(web3Instance);
          setError(
            "MetaMask is not installed. Please install it to use all features."
          );
        }
      } catch (error) {
        console.error("Error initializing Web3:", error);
        setError(
          "Failed to initialize Web3. Please refresh the page and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    initWeb3();
  }, []);

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          if (web3) {
            initializeContracts(web3, accounts[0]);
          }
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsAdmin(false);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      }
    };
  }, [web3]);

  // Initialize contracts
  const initializeContracts = async (
    web3Instance: Web3,
    userAccount: string
  ) => {
    try {
      const propertyFactoryContract = new web3Instance.eth.Contract(
        PropertyFactoryJSON.abi as AbiItem[],
        PROPERTY_FACTORY_ADDRESS
      );
      setPropertyFactoryContract(propertyFactoryContract);

      // Fetch the government address from contract on-chain
      const govAddressOnChain = await propertyFactoryContract.methods
        .governmentAddress()
        .call();

      setIsAdmin(userAccount.toLowerCase() === govAddressOnChain.toLowerCase());
    } catch (error) {
      console.error("Error initializing contracts:", error);
      setError(
        "Failed to initialize smart contracts. Please check your network connection."
      );
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          if (web3) {
            initializeContracts(web3, accounts[0]);
          }
        }
      } else {
        setError(
          "MetaMask is not installed. Please install it to use this application."
        );
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
  };

  // Get property contract instance
  const getPropertyContract = (address: string): Contract | null => {
    if (!web3) return null;

    try {
      return new web3.eth.Contract(PropertyJSON.abi as any, address);
    } catch (error) {
      console.error("Error creating property contract instance:", error);
      return null;
    }
  };

  const contextValue: Web3ContextType = {
    web3,
    account,
    isConnected,
    isAdmin,
    propertyFactoryContract,
    connectWallet,
    disconnectWallet,
    getPropertyContract,
    loading,
    error,
  };

  return (
    <Web3Context.Provider value={contextValue}>{children}</Web3Context.Provider>
  );
};
export { Web3Context };
export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
