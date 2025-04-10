// { Patient, Doctor, Manufacturer, Distributor, Retailer, Donor }
export const UserRoles = [
    "Patient",
    "Doctor",
    "Manufacturer",
    "Distributor",
    "Retailer",
    "Donor"
]

// Helper function to upload file to Pinata
export const uploadToPinata = async (file: File) => {
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