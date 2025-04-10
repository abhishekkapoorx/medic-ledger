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

  // Get the contract factory for UserRegistry
  const UserRegistry = await ethers.getContractFactory("UserRegistry", wallet);

  // Deploy the contract
  console.log("Deploying UserRegistry...");
  const userRegistry = await UserRegistry.deploy();
  
  // Wait for the deployment transaction to be mined
  await userRegistry.waitForDeployment();
  
  // Get the contract address
  const userRegistryAddress = await userRegistry.getAddress();
  
  console.log("UserRegistry contract deployed at:", userRegistryAddress);
}


// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });