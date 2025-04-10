// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserRegistry.sol";

/**
 * @title PrescriptionNFT
 * @dev NFT-based prescription system with role-based access control
 */
contract PrescriptionNFT is ERC721, Ownable {
    // Core prescription data structure
    struct Prescription {
        address patient;
        address doctor;
        uint256 issueDate;
        uint256 expiryDate;
        string ipfsHash; // Stores prescription details
        bool isFilled;
        uint256[] medicineTokens; // Linked medicine NFTs
    }

    // State variables
    uint256 private _nextTokenId;
    address public userRegistryAddress;
    mapping(uint256 => Prescription) private _prescriptions;
    mapping(address => uint256[]) private _patientPrescriptions;
    mapping(address => uint256[]) private _doctorPrescriptions;

    // Events
    event PrescriptionCreated(
        uint256 indexed tokenId,
        address indexed patient,
        address indexed doctor,
        uint256 expiryDate
    );
    event PrescriptionFilled(
        uint256 indexed tokenId,
        address indexed pharmacist
    );

    // Modifiers
    modifier onlyDoctor() {
        UserRegistry userRegistry = UserRegistry(userRegistryAddress);
        require(
            userRegistry.isValidUser(msg.sender, UserRegistry.UserRole.Doctor),
            "Only verified doctors can create prescriptions"
        );
        _;
    }

    modifier onlyValidPatient(address patient) {
        UserRegistry userRegistry = UserRegistry(userRegistryAddress);
        require(
            userRegistry.isValidUser(patient, UserRegistry.UserRole.Patient),
            "Invalid patient address"
        );
        _;
    }

    constructor(address _userRegistry) 
        ERC721("MedicalPrescription", "RX")
        Ownable(msg.sender)
    {
        userRegistryAddress = _userRegistry;
        _nextTokenId = 1;
    }

    /**
     * @dev Create a new prescription NFT
     * @param patient Address of the patient
     * @param expiryDate Prescription validity period
     * @param ipfsHash IPFS hash of prescription details
     */
    function createPrescription(
        address patient,
        uint256 expiryDate,
        string memory ipfsHash
    ) external onlyDoctor onlyValidPatient(patient) {
        require(expiryDate > block.timestamp, "Expiry date must be in the future");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");

        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;

        _prescriptions[newTokenId] = Prescription({
            patient: patient,
            doctor: msg.sender,
            issueDate: block.timestamp,
            expiryDate: expiryDate,
            ipfsHash: ipfsHash,
            isFilled: false,
            medicineTokens: new uint256[](0)
        });

        _safeMint(patient, newTokenId);
        _patientPrescriptions[patient].push(newTokenId);
        _doctorPrescriptions[msg.sender].push(newTokenId);

        emit PrescriptionCreated(newTokenId, patient, msg.sender, expiryDate);
    }

    /**
     * @dev Mark prescription as filled (by pharmacist)
     * @param tokenId Prescription NFT ID
     * @param medicineTokens Array of medicine NFT IDs used
     */
    function fulfillPrescription(
        uint256 tokenId,
        uint256[] memory medicineTokens
    ) external {
        require(ownerOf(tokenId) == msg.sender, "Not prescription owner");
        require(!_prescriptions[tokenId].isFilled, "Already filled");
        require(_prescriptions[tokenId].expiryDate >= block.timestamp, "Prescription expired");

        _prescriptions[tokenId].isFilled = true;
        _prescriptions[tokenId].medicineTokens = medicineTokens;

        emit PrescriptionFilled(tokenId, msg.sender);
    }

    /**
     * @dev Get prescription details
     * @param tokenId Prescription NFT ID
     */
    function getPrescriptionDetails(uint256 tokenId)
        external
        view
        returns (Prescription memory)
    {
        require(_exists(tokenId), "Invalid prescription ID");
        return _prescriptions[tokenId];
    }

    /**
     * @dev Get patient's prescriptions
     * @param patient Address of the patient
     */
    function getPatientPrescriptions(address patient)
        external
        view
        returns (uint256[] memory)
    {
        return _patientPrescriptions[patient];
    }

    /**
     * @dev Get doctor's prescriptions
     * @param doctor Address of the doctor
     */
    function getDoctorPrescriptions(address doctor)
        external
        view
        returns (uint256[] memory)
    {
        return _doctorPrescriptions[doctor];
    }

    /**
     * @dev Check if prescription is valid
     * @param tokenId Prescription NFT ID
     */
    function isValidPrescription(uint256 tokenId)
        external
        view
        returns (bool)
    {
        return _exists(tokenId) && 
               !_prescriptions[tokenId].isFilled && 
               _prescriptions[tokenId].expiryDate >= block.timestamp;
    }

    /**
     * @dev Internal existence check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Get prescription metadata URI
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Invalid prescription ID");
        return string(abi.encodePacked("ipfs://", _prescriptions[tokenId].ipfsHash));
    }

    /**
     * @dev Update user registry address
     */
    function setUserRegistry(address _newRegistry) external onlyOwner {
        userRegistryAddress = _newRegistry;
    }
}