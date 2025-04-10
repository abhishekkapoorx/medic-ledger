// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./UserRegistry.sol";

/**
 * @title MedicineTokenizer
 * @dev NFT-based drug batch authentication using ERC-721 standard
 */
contract MedicineTokenizer is ERC721, Ownable {
    // Counter for token IDs
    uint256 private _nextTokenId;
    
    // Core medicine data structure
    struct MedicineDetails {
        string name;
        string batchNumber;
        uint256 manufactureDate;
        uint256 expiryDate;
        string composition;
        string storageConditions;
        string ipfsHash; // Stores QR code + full specifications
        address manufacturer;
        address currentOwner;
    }

    // Ownership history record structure
    struct OwnershipRecord {
        address owner;
        uint256 timestamp;
    }

    // State variables
    address public userRegistryAddress;
    mapping(uint256 => MedicineDetails) private _medicineData;
    
    // Storage for ownership history
    mapping(uint256 => OwnershipRecord[]) private _ownershipHistory;

    // Events
    event MedicineMinted(
        uint256 indexed tokenId,
        address indexed manufacturer,
        string batchNumber,
        uint256 expiryDate
    );
    event OwnershipTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    // Modifier to verify manufacturer status
    modifier onlyManufacturer() {
        UserRegistry userRegistry = UserRegistry(userRegistryAddress);
        require(
            userRegistry.isValidUser(msg.sender),
            "Caller is not a verified manufacturer"
        );
        _;
    }

    constructor(address _userRegistry) 
        ERC721("PharmaNFT", "DRUG") 
        Ownable(msg.sender)
    {
        userRegistryAddress = _userRegistry;
    }

    /**
     * @dev Mint new medicine batch NFT
     * @param _name Medicine brand name
     * @param _batchNumber Unique batch identifier
     * @param _expiryDate Unix timestamp of expiration
     * @param _composition Active ingredients
     * @param _storageConditions Required storage parameters
     * @param _ipfsHash IPFS CID of full documentation
     */
    function mintMedicine(
        string memory _name,
        string memory _batchNumber,
        uint256 _expiryDate,
        string memory _composition,
        string memory _storageConditions,
        string memory _ipfsHash
    ) external onlyManufacturer {
        require(bytes(_batchNumber).length > 0, "Batch number required");
        require(_expiryDate > block.timestamp, "Invalid expiry date");

        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;

        _medicineData[newTokenId] = MedicineDetails({
            name: _name,
            batchNumber: _batchNumber,
            manufactureDate: block.timestamp,
            expiryDate: _expiryDate,
            composition: _composition,
            storageConditions: _storageConditions,
            ipfsHash: _ipfsHash,
            manufacturer: msg.sender,
            currentOwner: msg.sender
        });

        // Add first ownership record - the manufacturer
        _ownershipHistory[newTokenId].push(OwnershipRecord({
            owner: msg.sender,
            timestamp: block.timestamp
        }));

        _safeMint(msg.sender, newTokenId);
        emit MedicineMinted(newTokenId, msg.sender, _batchNumber, _expiryDate);
    }

    /**
     * @dev Get complete medicine details
     * @param tokenId NFT token ID
     */
    function getMedicineDetails(uint256 tokenId) 
        external 
        view 
        returns (MedicineDetails memory) 
    {
        require(_exists(tokenId), "Invalid token ID");
        return _medicineData[tokenId];
    }

    /**
     * @dev Get ownership history of a medicine
     * @param tokenId NFT token ID
     */
    function getOwnershipHistory(uint256 tokenId)
        external
        view
        returns (OwnershipRecord[] memory)
    {
        require(_exists(tokenId), "Invalid token ID");
        return _ownershipHistory[tokenId];
    }

    /**
     * @dev Check if token exists
     * @param tokenId NFT token ID
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Override transfer logic to track current owner and ownership history
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address previousOwner = super._update(to, tokenId, auth);
        
        // Update current owner in medicine details
        _medicineData[tokenId].currentOwner = to;
        
        // Don't record if it's initial minting (previousOwner is zero address)
        if (previousOwner != address(0) && to != previousOwner) {
            // Add new ownership record to history
            _ownershipHistory[tokenId].push(OwnershipRecord({
                owner: to,
                timestamp: block.timestamp
            }));
        }
        
        emit OwnershipTransferred(tokenId, previousOwner, to);
        return previousOwner;
    }

    /**
     * @dev Get NFT metadata URI
     * @param tokenId NFT token ID
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Invalid token ID");
        return string(abi.encodePacked("ipfs://", _medicineData[tokenId].ipfsHash));
    }

    /**
     * @dev Update user registry address (onlyOwner)
     */
    function setUserRegistry(address _newRegistry) external onlyOwner {
        userRegistryAddress = _newRegistry;
    }

    /**
     * @dev Get the next token ID (for testing purposes)
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}