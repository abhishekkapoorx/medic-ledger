import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Get the private key from the .env file
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("Private key is missing in .env file");
    return;
  }

  // Get the provider from the Hardhat runtime environment
  const provider = ethers.provider;

  // Create a signer using the private key
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with the account:", wallet.address);
  console.log("Account balance:", ethers.formatEther(await provider.getBalance(wallet.address)));

  // Set fee wallet address (for marketplace fees)
  const feeWallet = wallet.address; // Using deployer as fee wallet

  // Deploy UserRegistry contract first (no constructor params)
  console.log("Deploying UserRegistry...");
  const UserRegistry = await ethers.getContractFactory("UserRegistry", wallet);
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("UserRegistry contract deployed at:", userRegistryAddress);

  // Deploy MedicineNFT contract (requires UserRegistry address)
  console.log("Deploying MedicineNFT...");
  const MedicineNFT = await ethers.getContractFactory("MedicineTokenizer", wallet);
  const medicineNFT = await MedicineNFT.deploy(userRegistryAddress);
  await medicineNFT.waitForDeployment();
  const medicineNFTAddress = await medicineNFT.getAddress();
  console.log("MedicineNFT contract deployed at:", medicineNFTAddress);

  // Deploy PrescriptionNFT contract (requires UserRegistry address)
  console.log("Deploying PrescriptionNFT...");
  const PrescriptionNFT = await ethers.getContractFactory("PrescriptionNFT", wallet);
  const prescriptionNFT = await PrescriptionNFT.deploy(userRegistryAddress);
  await prescriptionNFT.waitForDeployment();
  const prescriptionNFTAddress = await prescriptionNFT.getAddress();
  console.log("PrescriptionNFT contract deployed at:", prescriptionNFTAddress);

  // Deploy Marketplace contract last (requires all other contract addresses)
  console.log("Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("PharmacyMarketplace", wallet);
  const marketplace = await Marketplace.deploy(
    userRegistryAddress,
    medicineNFTAddress,
    prescriptionNFTAddress,
    feeWallet
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace contract deployed at:", marketplaceAddress);

  // Output all contract addresses for easy reference
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("UserRegistry:", userRegistryAddress);
  console.log("MedicineNFT:", medicineNFTAddress);
  console.log("PrescriptionNFT:", prescriptionNFTAddress);
  console.log("PharmacyMarketplace:", marketplaceAddress);
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });