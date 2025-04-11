import { ethers } from "ethers";

// Import contract ABIs
import MedicineTokenizerArtifact from "../../sol_back/artifacts/contracts/MedicineNFT.sol/MedicineTokenizer.json";
import PharmacyMarketplaceArtifact from "../../sol_back/artifacts/contracts/MarketPlace.sol/PharmacyMarketplace.json";
import UserRegistryArtifact from "../../sol_back/artifacts/contracts/UserRegistry.sol/UserRegistry.json";

// Environment variables for contract addresses
const MEDICINE_NFT_ADDRESS = process.env.NEXT_PUBLIC_MEDICINE_NFT_ADDRESS || "0x43ca3D2C94be00692D207C6A1e60D8B325c6f12f";
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// Define types for our ethereum window object
declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

/**
 * Initialize provider from browser ethereum object
 */
export const initializeProvider = async (): Promise<ethers.BrowserProvider | null> => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected! Please install MetaMask.");
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    return provider;
  } catch (error) {
    console.error("Failed to initialize provider:", error);
    throw error;
  }
};

/**
 * Get signer from provider
 */
export const getSigner = async (provider: ethers.BrowserProvider): Promise<ethers.Signer> => {
  try {
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error("Failed to get signer:", error);
    throw error;
  }
};

/**
 * Request accounts from MetaMask
 */
export const requestAccounts = async (): Promise<string[]> => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected! Please install MetaMask.");
  }
  
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts;
  } catch (error) {
    console.error("Failed to request accounts:", error);
    throw error;
  }
};

/**
 * Initialize contracts with signer
 */
export const initializeContracts = (signer: ethers.Signer) => {
  try {
    console.log("Initializing contracts with signer:", signer);
    
    // Log the artifacts to ensure they're loaded correctly
    console.log("MedicineTokenizer ABI loaded:", 
      MedicineTokenizerArtifact && MedicineTokenizerArtifact.abi ? "Yes" : "No");
    
    const medicineContract = new ethers.Contract(
      MEDICINE_NFT_ADDRESS,
      MedicineTokenizerArtifact.abi,
      signer
    );
    
    const marketplaceContract = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      PharmacyMarketplaceArtifact.abi,
      signer
    );
    
    const userRegistryContract = new ethers.Contract(
      USER_REGISTRY_ADDRESS,
      UserRegistryArtifact.abi,
      signer
    );
    
    console.log("Medicine contract initialized at:", MEDICINE_NFT_ADDRESS);
    
    // Log available functions to help with debugging
    if (medicineContract.interface) {
      try {
        // Get function signatures from the interface
        const functionSignatures = Object.values(medicineContract.interface.fragments)
          .filter(fragment => fragment.type === 'function')
          .map(fragment => fragment.format());
        
        console.log("Medicine contract functions:", functionSignatures);
      } catch (err) {
        console.log("Could not list contract functions:", err);
      }
    }
    
    return { medicineContract, marketplaceContract, userRegistryContract };
  } catch (error) {
    console.error("Failed to initialize contracts:", error);
    throw error;
  }
};

/**
 * Format Ethereum address for display
 */
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Setup account change listeners
 */
export const setupAccountChangeListener = (callback: (accounts: string[]) => void) => {
  if (!window.ethereum) return;
  
  const handleAccountsChanged = (accounts: string[]) => {
    callback(accounts);
  };
  
  window.ethereum.on('accountsChanged', handleAccountsChanged);
  
  // Return cleanup function
  return () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };
};

/**
 * Get next token ID from medicine contract
 */
export const getNextTokenId = async (medicineContract: ethers.Contract): Promise<number> => {
  try {
    const nextTokenId = await medicineContract.getNextTokenId?.() || 0;
    return Number(nextTokenId);
  } catch (error) {
    console.error("Failed to get next token ID:", error);
    return 0;
  }
}; 