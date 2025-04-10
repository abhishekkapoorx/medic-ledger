import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import UserRegistryArtifact from "../../../../sol_back/artifacts/contracts/UserRegistry.sol/UserRegistry.json";

export async function GET(request: NextRequest) {
  // Get the address from the URL search params
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  console.log("==========================");
  console.log("Received address:", address);
  console.log("==========================");
  
  // Check if the address is provided
  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  // Validate the address input
  if (!ethers.isAddress(address)) {
    return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
  }

  // Get contract address and RPC URL from environment variables
  const contractAddress = process.env.USER_REGISTRY_ADDRESS;
  const rpcUrl = process.env.RPC_URL;

  if (!contractAddress || !rpcUrl) {
    return NextResponse.json(
      { error: "Contract address or RPC URL is missing in .env" }, 
      { status: 500 }
    );
  }

  try {
    // Connect to the Ethereum provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, UserRegistryArtifact.abi, provider);

    // Fetch the user details
    const [name, isVerified] = await contract.getUserDetails(address);

    // Respond with registration status
    return NextResponse.json({ 
      isRegistered: name !== "", 
      isVerified,
      name
    });
  } catch (error) {
    if ((error as any).code === "CALL_EXCEPTION" && 
        (error as any).message.includes("User not registered")) {
      console.log("User not registered for address:", address);
      
      // Return a 200 status with isRegistered as false instead of an error
      return NextResponse.json({ 
        isRegistered: false, 
        isVerified: false,
        name: ""
      });
    }

    // For actual errors, log and return a 500 response
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Error fetching user details from contract" }, 
      { status: 500 }
    );
  }
}