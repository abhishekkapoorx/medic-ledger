"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import UserRegistryArtifact from "../../../sol_back/artifacts/contracts/UserRegistry.sol/UserRegistry.json";

// Helper function to upload file to Pinata
const uploadToPinata = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        "pinata_api_key": process.env.NEXT_PUBLIC_PINATA_API_KEY || "970dfd5439f35fced039",
        "pinata_secret_api_key": process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "9396f7d6b63fd08a16f2c504de3186773af31a0a5e69ba877a073d65654a6fc1",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Pinata: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("File uploaded to IPFS:", data);
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

const RegisterPage = () => {
  const router = useRouter();
  const account = useSelector((state: RootState) => state.wallet.account);
  const [step, setStep] = useState(1);  // Stepper for multi-step form
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Role-specific fields
  const [practiceAddress, setPracticeAddress] = useState("");
  const [manufacturingAddress, setManufacturingAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [distributionAddress, setDistributionAddress] = useState("");
  const [retailAddress, setRetailAddress] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      // Upload document to IPFS if provided
      let fileHash = "";
      if (file) {
        fileHash = await uploadToPinata(file);
        console.log("Document uploaded with hash:", fileHash);
      }

      // Connect to MetaMask provider
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed or Ethereum provider is unavailable");
      }
      const provider = new ethers.BrowserProvider(window.ethereum as unknown as ethers.providers.ExternalProvider);
      const signer = await provider.getSigner();
      
      // Get contract address from environment variable
      const contractAddress = process.env.NEXT_PUBLIC_USER_REGISTRY_ADDRESS || "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f";
      
      // Create contract instance with full ABI
      const contract = new ethers.Contract(
        contractAddress,
        UserRegistryArtifact.abi,
        signer
      );

      console.log("I am Here " , contractAddress, UserRegistryArtifact.abi, signer);

      // Register user based on role
      let tx;
      
      switch (role) {
        case "Patient":
          console.log("Registering as Patient:", name);
          tx = await contract.registerPatient(name);
          console.log("Patient registration transaction:", tx);
          break;
        case "Doctor":
          // Ensure a license IPFS hash is provided for doctors
          if (!fileHash) throw new Error("License file is required for doctors");
          tx = await contract.registerDoctor(name, fileHash, practiceAddress);
          break;
        case "Manufacturer":
          // Ensure a license IPFS hash is provided for manufacturers
          if (!fileHash) throw new Error("License file is required for manufacturers");
          tx = await contract.registerManufacturer(name, fileHash, manufacturingAddress, gstNumber, registrationNumber);
          break;
        case "Distributor":
          // Ensure a license IPFS hash is provided for distributors
          if (!fileHash) throw new Error("License file is required for distributors");
          tx = await contract.registerDistributor(name, fileHash, distributionAddress);
          break;
        case "Retailer":
          // Ensure a license IPFS hash is provided for retailers
          if (!fileHash) throw new Error("License file is required for retailers");
          tx = await contract.registerRetailer(name, fileHash, retailAddress);
          break;
        case "Donor":
          // For donors, we require a government ID document
          if (!fileHash) throw new Error("Government ID file is required for donors");
          tx = await contract.registerDonor(name, fileHash);
          break;
        default:
          throw new Error("Invalid role selected");
      }

      console.log("Transaction hash:", tx.hash);

      // Wait for transaction to be mined
      console.log("Registration transaction submitted:", tx.hash);
      await tx.wait();
      console.log("Registration successful!");

      // Redirect to dashboard after successful registration
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Registration failed:", error);
      setError(error.reason || error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if ((step === 1 && !name) || (step === 2 && !role)) {
      setError("Please fill in all required fields");
      return;
    }
    
    // For patients, skip the document upload step and submit directly
    if (step === 2 && role === "Patient") {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      return;
    }
    
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  // Render role-specific form fields
  const renderRoleSpecificFields = () => {
    if (!role || role === "Patient") {
      return null;
    }

    return (
      <div className="space-y-4 mt-4">
        {role === "Doctor" && (
          <div>
            <label className="block text-neutralral-300 mb-2">Practice Address</label>
            <input
              type="text"
              value={practiceAddress}
              onChange={(e) => setPracticeAddress(e.target.value)}
              placeholder="Enter your practice address"
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
              required
            />
          </div>
        )}

        {role === "Manufacturer" && (
          <>
            <div>
              <label className="block text-neutralral-300 mb-2">Manufacturing Address</label>
              <input
                type="text"
                value={manufacturingAddress}
                onChange={(e) => setManufacturingAddress(e.target.value)}
                placeholder="Enter manufacturing facility address"
                className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
                required
              />
            </div>
            <div>
              <label className="block text-neutralral-300 mb-2">GST Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                placeholder="Enter GST registration number"
                className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
                required
              />
            </div>
            <div>
              <label className="block text-neutralral-300 mb-2">Registration Number</label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter company registration number"
                className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
                required
              />
            </div>
          </>
        )}

        {role === "Distributor" && (
          <div>
            <label className="block text-neutralral-300 mb-2">Distribution Address</label>
            <input
              type="text"
              value={distributionAddress}
              onChange={(e) => setDistributionAddress(e.target.value)}
              placeholder="Enter distribution center address"
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
              required
            />
          </div>
        )}

        {role === "Retailer" && (
          <div>
            <label className="block text-neutralral-300 mb-2">Retail Address</label>
            <input
              type="text"
              value={retailAddress}
              onChange={(e) => setRetailAddress(e.target.value)}
              placeholder="Enter retail location address"
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
              required
            />
          </div>
        )}

        {role === "Donor" && (
          <div className="text-neutralral-300">
            <p>Please upload your government ID document in the next step.</p>
          </div>
        )}
      </div>
    );
  };

  // Function to validate if all required role-specific fields are filled
  const validateRoleFields = () => {
    switch (role) {
      case "Doctor":
        return !!practiceAddress;
      case "Manufacturer":
        return !!manufacturingAddress && !!gstNumber && !!registrationNumber;
      case "Distributor":
        return !!distributionAddress;
      case "Retailer":
        return !!retailAddress;
      case "Patient":
      case "Donor":
      default:
        return true;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-neutralral-800 rounded-lg shadow-lg border bordneutraleutral-700">
      <h1 className="text-2xl font-bold text-center mb-6 text-white">Register Your Details</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-md border border-red-700">
          {error}
        </div>
      )}

      {!account && (
        <div className="mb-4 p-3 bg-yellow-900 text-yellow-200 rounded-md border border-yellow-700">
          Please connect your wallet first
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400">Step 1: Enter Your Name</h2>
          <div>
            <label className="block text-neutralral-300 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placehneutralr-neutral-400"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={nextStep}
              disabled={!account || !name}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-neutralral-600 disabled:teneutraleutral-400"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400">Step 2: Choose Your Role</h2>
          <div>
            <label className="block text-neutralral-300 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select Role</option>
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Distributor">Distributor</option>
              <option value="Retailer">Retailer</option>
              <option value="Donor">Donor</option>
            </select>
          </div>
          
          {/* Render role-specific fields */}
          {renderRoleSpecificFields()}
          
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-neutralral-600 teneutraleutral-200 rounded-md hovneutralg-neutral-500 focus:outline-none focus:ring-2 foneutralring-neutral-500"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={!role || !validateRoleFields()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-neutralral-600 disabled:teneutraleutral-400"
            >
              {role === "Patient" ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && role !== "Patient" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-green-400">
            Step 3: Upload Your {role === "Donor" ? "Government ID" : "License"}
          </h2>
          <div>
            <label className="block text-neutralral-300 mb-2">
              {role === "Donor" ? "Government ID Document" : "Professional License"}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-4 py-2 bg-neutralral-700 text-white border bordneutraleutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 fineutralg-neutral-600 fneutraltext-neutral-200 honeutralfile:bg-neutral-500"
              required
            />
            {file && (
              <p className="mt-2 text-sm text-neutralral-400">
                Selected file: {file.name}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-neutralral-600 teneutraleutral-200 rounded-md hovneutralg-neutral-500 focus:outline-none focus:ring-2 foneutralring-neutral-500"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !file}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-neutralral-600 disabled:teneutraleutral-400"
            >
              {loading ? "Registering..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;