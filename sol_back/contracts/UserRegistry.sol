// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title UserRegistry
 * @dev Manages the registration and verification of users in the pharmaceutical supply chain
 */
contract UserRegistry is Ownable, Pausable {
    // User types mapped to numerical values for efficient storage
    enum UserRole { Patient, Doctor, Manufacturer, Distributor, Retailer, Donor }
    
    // Events
    event UserRegistered(address indexed userAddress, UserRole role, string name);
    event UserVerified(address indexed userAddress, UserRole role);
    event UserDeactivated(address indexed userAddress);
    event UserReactivated(address indexed userAddress);
    
    // Core user structure
    struct User {
        address walletAddress;
        UserRole role;
        string name;
        string licenseIPFSHash;  // Empty for patients/donors without license requirements
        bool isVerified;
        bool isActive;
        uint256 registrationDate;
    }
    
    // Additional data structures for role-specific information
    struct ManufacturerDetails {
        string manufacturingAddress;
        string gstNumber;
        string registrationNumber;
    }
    
    struct DoctorDetails {
        string practiceAddress;
    }
    
    struct DistributorDetails {
        string distributionAddress;
    }
    
    struct RetailerDetails {
        string retailAddress;
    }
    
    struct DonorDetails {
        string governmentIdIPFSHash;
    }
    
    // Mappings to store user data
    mapping(address => User) public users;
    mapping(address => ManufacturerDetails) public manufacturerDetails;
    mapping(address => DoctorDetails) public doctorDetails;
    mapping(address => DistributorDetails) public distributorDetails;
    mapping(address => RetailerDetails) public retailerDetails;
    mapping(address => DonorDetails) public donorDetails;
    
    // Address list of all verifiers who can approve regulated users
    mapping(address => bool) public verifiers;
    
    // Modifier to restrict functions to specific roles
    modifier onlyRole(UserRole _role) {
        require(users[msg.sender].walletAddress == msg.sender, "User not registered");
        require(users[msg.sender].role == _role, "Incorrect role");
        require(users[msg.sender].isActive, "User account is not active");
        _;
    }
    
    // Modifier to restrict functions to verified users
    modifier onlyVerified() {
        require(users[msg.sender].isVerified, "User not verified");
        _;
    }
    
    // Modifier to restrict functions to verifiers
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized to verify");
        _;
    }
    
    /**
     * @dev Constructor sets the deployer as the first verifier and owner
     */
    constructor() Ownable(msg.sender) {
        verifiers[msg.sender] = true;
    }
    
    /**
     * @dev Add a new verifier who can approve regulated users
     * @param _verifier Address of the new verifier
     */
    function addVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid address");
        verifiers[_verifier] = true;
    }
    
    /**
     * @dev Remove a verifier
     * @param _verifier Address of the verifier to remove
     */
    function removeVerifier(address _verifier) external onlyOwner {
        verifiers[_verifier] = false;
    }
    
    /**
     * @dev Register a new patient
     * @param _name Name of the patient
     * @return success Boolean indicating success
     */
    function registerPatient(string memory _name) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Patient,
            name: _name,
            licenseIPFSHash: "",
            isVerified: true, // Patients don't need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        emit UserRegistered(msg.sender, UserRole.Patient, _name);
        emit UserVerified(msg.sender, UserRole.Patient);
        return true;
    }
    
    /**
     * @dev Register a new doctor
     * @param _name Name of the doctor
     * @param _licenseIPFSHash IPFS hash of the doctor's license
     * @param _practiceAddress Physical address of practice
     * @return success Boolean indicating success
     */
    function registerDoctor(
        string memory _name,
        string memory _licenseIPFSHash,
        string memory _practiceAddress
    ) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        require(bytes(_licenseIPFSHash).length > 0, "License IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Doctor,
            name: _name,
            licenseIPFSHash: _licenseIPFSHash,
            isVerified: false, // Doctors need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        doctorDetails[msg.sender] = DoctorDetails({
            practiceAddress: _practiceAddress
        });
        
        emit UserRegistered(msg.sender, UserRole.Doctor, _name);
        return true;
    }
    
    /**
     * @dev Register a new manufacturer
     * @param _name Name of the manufacturer
     * @param _licenseIPFSHash IPFS hash of the manufacturer's license
     * @param _manufacturingAddress Physical address of manufacturing facility
     * @param _gstNumber GST registration number
     * @param _registrationNumber Company registration number
     * @return success Boolean indicating success
     */
    function registerManufacturer(
        string memory _name,
        string memory _licenseIPFSHash,
        string memory _manufacturingAddress,
        string memory _gstNumber,
        string memory _registrationNumber
    ) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        require(bytes(_licenseIPFSHash).length > 0, "License IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Manufacturer,
            name: _name,
            licenseIPFSHash: _licenseIPFSHash,
            isVerified: false, // Manufacturers need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        manufacturerDetails[msg.sender] = ManufacturerDetails({
            manufacturingAddress: _manufacturingAddress,
            gstNumber: _gstNumber,
            registrationNumber: _registrationNumber
        });
        
        emit UserRegistered(msg.sender, UserRole.Manufacturer, _name);
        return true;
    }
    
    /**
     * @dev Register a new distributor
     * @param _name Name of the distributor
     * @param _licenseIPFSHash IPFS hash of the distributor's license
     * @param _distributionAddress Physical address of distribution center
     * @return success Boolean indicating success
     */
    function registerDistributor(
        string memory _name,
        string memory _licenseIPFSHash,
        string memory _distributionAddress
    ) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        require(bytes(_licenseIPFSHash).length > 0, "License IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Distributor,
            name: _name,
            licenseIPFSHash: _licenseIPFSHash,
            isVerified: false, // Distributors need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        distributorDetails[msg.sender] = DistributorDetails({
            distributionAddress: _distributionAddress
        });
        
        emit UserRegistered(msg.sender, UserRole.Distributor, _name);
        return true;
    }
    
    /**
     * @dev Register a new retailer
     * @param _name Name of the retailer
     * @param _licenseIPFSHash IPFS hash of the retailer's license
     * @param _retailAddress Physical address of retail location
     * @return success Boolean indicating success
     */
    function registerRetailer(
        string memory _name,
        string memory _licenseIPFSHash,
        string memory _retailAddress
    ) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        require(bytes(_licenseIPFSHash).length > 0, "License IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Retailer,
            name: _name,
            licenseIPFSHash: _licenseIPFSHash,
            isVerified: false, // Retailers need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        retailerDetails[msg.sender] = RetailerDetails({
            retailAddress: _retailAddress
        });
        
        emit UserRegistered(msg.sender, UserRole.Retailer, _name);
        return true;
    }
    
    /**
     * @dev Register a new donor
     * @param _name Name of the donor
     * @param _governmentIdIPFSHash IPFS hash of the donor's government ID
     * @return success Boolean indicating success
     */
    function registerDonor(
        string memory _name,
        string memory _governmentIdIPFSHash
    ) external whenNotPaused returns (bool success) {
        require(users[msg.sender].walletAddress == address(0), "User already registered");
        require(bytes(_governmentIdIPFSHash).length > 0, "Government ID IPFS hash required");
        
        users[msg.sender] = User({
            walletAddress: msg.sender,
            role: UserRole.Donor,
            name: _name,
            licenseIPFSHash: "",
            isVerified: false, // Donors need verification
            isActive: true,
            registrationDate: block.timestamp
        });
        
        donorDetails[msg.sender] = DonorDetails({
            governmentIdIPFSHash: _governmentIdIPFSHash
        });
        
        emit UserRegistered(msg.sender, UserRole.Donor, _name);
        return true;
    }
    
    /**
     * @dev Verify a user (only callable by verifiers)
     * @param _userAddress Address of the user to verify
     * @return success Boolean indicating success
     */
    function verifyUser(address _userAddress) external onlyVerifier whenNotPaused returns (bool success) {
        require(users[_userAddress].walletAddress != address(0), "User not registered");
        require(!users[_userAddress].isVerified, "User already verified");
        
        users[_userAddress].isVerified = true;
        
        emit UserVerified(_userAddress, users[_userAddress].role);
        return true;
    }
    
    /**
     * @dev Deactivate a user (only callable by owner)
     * @param _userAddress Address of the user to deactivate
     * @return success Boolean indicating success
     */
    function deactivateUser(address _userAddress) external onlyOwner returns (bool success) {
        require(users[_userAddress].walletAddress != address(0), "User not registered");
        require(users[_userAddress].isActive, "User already deactivated");
        
        users[_userAddress].isActive = false;
        
        emit UserDeactivated(_userAddress);
        return true;
    }
    
    /**
     * @dev Reactivate a user (only callable by owner)
     * @param _userAddress Address of the user to reactivate
     * @return success Boolean indicating success
     */
    function reactivateUser(address _userAddress) external onlyOwner returns (bool success) {
        require(users[_userAddress].walletAddress != address(0), "User not registered");
        require(!users[_userAddress].isActive, "User already active");
        
        users[_userAddress].isActive = true;
        
        emit UserReactivated(_userAddress);
        return true;
    }
    
    /**
     * @dev Check if a user is registered, verified, and active
     * @param _userAddress Address of the user to check
     * @return isValid Boolean indicating if the user is valid
     */
    function isValidUser(address _userAddress) external view returns (bool isValid) {
        return (
            users[_userAddress].walletAddress != address(0) &&
            users[_userAddress].isVerified &&
            users[_userAddress].isActive
        );
    }
    
    /**
     * @dev Get user details
     * @param _userAddress Address of the user
     * @return role User role
     * @return name User name
     * @return licenseIPFSHash IPFS hash of license
     * @return isVerified Verification status
     * @return isActive Active status
     * @return registrationDate Registration timestamp
     */
    function getUserDetails(address _userAddress)
        external
        view
        returns (
            UserRole role,
            string memory name,
            string memory licenseIPFSHash,
            bool isVerified,
            bool isActive,
            uint256 registrationDate
        )
    {
        require(users[_userAddress].walletAddress != address(0), "User not registered");
        
        User memory user = users[_userAddress];
        return (
            user.role,
            user.name,
            user.licenseIPFSHash,
            user.isVerified,
            user.isActive,
            user.registrationDate
        );
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}