// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./UserRegistry.sol";
import "./MedicineNFT.sol";
import "./PrescriptionNFT.sol";

contract PharmacyMarketplace is Ownable, ReentrancyGuard {
    // Contract dependencies
    address public userRegistryAddress;
    address public medicineTokenAddress;
    address public prescriptionTokenAddress;

    // Marketplace parameters
    uint256 public platformFeePercentage = 1; // 1% platform fee
    address public feeWallet;

    // Medicine listing structure
    struct MedicineListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isDonation;
        bool isActive;
    }

    // Mapping of listings
    mapping(uint256 => MedicineListing) public listings;
    uint256[] public activeListings;

    // Events
    event MedicineListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        bool isDonation
    );
    event MedicineSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee
    );
    event MedicineDonated(
        uint256 indexed tokenId,
        address indexed donor,
        address indexed recipient
    );
    event ListingCancelled(uint256 indexed tokenId);
    event PlatformFeeUpdated(uint256 newPercentage);
    event FeeWalletUpdated(address newWallet);

    // Modifiers
    modifier onlyValidUser() {
        UserRegistry userRegistry = UserRegistry(userRegistryAddress);
        require(
            userRegistry.isValidUser(msg.sender),
            "Unauthorized user"
        );
        _;
    }

    modifier onlyMedicineOwner(uint256 tokenId) {
        IERC721 medicineToken = IERC721(medicineTokenAddress);
        require(
            medicineToken.ownerOf(tokenId) == msg.sender,
            "Not the medicine owner"
        );
        _;
    }

    modifier onlyActiveListing(uint256 tokenId) {
        require(listings[tokenId].isActive, "Listing not active");
        _;
    }

    constructor(
        address _userRegistry,
        address _medicineToken,
        address _prescriptionToken,
        address _feeWallet
    ) Ownable(msg.sender) {
        userRegistryAddress = _userRegistry;
        medicineTokenAddress = _medicineToken;
        prescriptionTokenAddress = _prescriptionToken;
        feeWallet = _feeWallet;
    }

    /**
     * @dev List medicine for sale or donation
     * @param tokenId Medicine NFT token ID
     * @param price Price in wei (0 for donations)
     */
    function listMedicine(uint256 tokenId, uint256 price)
        external
        onlyValidUser
        onlyMedicineOwner(tokenId)
        nonReentrant
    {
        MedicineTokenizer medicine = MedicineTokenizer(medicineTokenAddress);
        require(
            medicine.getMedicineDetails(tokenId).expiryDate > block.timestamp,
            "Medicine expired"
        );

        bool isDonation = (price == 0);
        
        listings[tokenId] = MedicineListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            isDonation: isDonation,
            isActive: true
        });

        activeListings.push(tokenId);
        emit MedicineListed(tokenId, msg.sender, price, isDonation);
    }

    /**
     * @dev Purchase medicine from marketplace
     * @param tokenId Medicine NFT token ID
     * @param prescriptionId Optional prescription ID (0 if not required)
     */
    function purchaseMedicine(uint256 tokenId, uint256 prescriptionId)
        external
        payable
        onlyValidUser
        onlyActiveListing(tokenId)
        nonReentrant
    {
        MedicineListing memory listing = listings[tokenId];
        require(!listing.isDonation, "This is a donation listing");
        require(msg.value >= listing.price, "Insufficient payment");

        // Check prescription if required
        if (prescriptionId != 0) {
            PrescriptionNFT prescription = PrescriptionNFT(prescriptionTokenAddress);
            PrescriptionNFT.Prescription memory presc = prescription.getPrescriptionDetails(prescriptionId);
            require(presc.patient == msg.sender, "Prescription not yours");
            require(!presc.isFilled, "Prescription already used");
            require(presc.expiryDate >= block.timestamp, "Prescription expired");
        }

        // Calculate fees
        uint256 feeAmount = (listing.price * platformFeePercentage) / 100;
        uint256 sellerAmount = listing.price - feeAmount;

        // Transfer funds
        (bool feeSuccess, ) = feeWallet.call{value: feeAmount}("");
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(feeSuccess && sellerSuccess, "Transfer failed");

        // Transfer medicine token
        IERC721(medicineTokenAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );

        // Update prescription if used
        if (prescriptionId != 0) {
            PrescriptionNFT(prescriptionTokenAddress).fulfillPrescription(
                prescriptionId,
                new uint256[](0) // Empty array for now
            );
        }

        // Remove listing
        _removeListing(tokenId);

        emit MedicineSold(tokenId, listing.seller, msg.sender, listing.price, feeAmount);
    }

    /**
     * @dev Donate medicine to a patient
     * @param tokenId Medicine NFT token ID
     * @param recipient Address of patient receiving donation
     * @param prescriptionId Optional prescription ID (0 if not required)
     */
    function donateMedicine(
        uint256 tokenId,
        address recipient,
        uint256 prescriptionId
    ) external onlyValidUser onlyActiveListing(tokenId) nonReentrant {
        MedicineListing memory listing = listings[tokenId];
        require(listing.isDonation, "Not a donation listing");
        require(listing.seller == msg.sender, "Not the lister");

        UserRegistry userRegistry = UserRegistry(userRegistryAddress);
        require(
            userRegistry.isValidUser(recipient),
            "Recipient must be a valid user"
        );

        // Check prescription if required
        if (prescriptionId != 0) {
            PrescriptionNFT prescription = PrescriptionNFT(prescriptionTokenAddress);
            PrescriptionNFT.Prescription memory presc = prescription.getPrescriptionDetails(prescriptionId);
            require(presc.patient == recipient, "Prescription not for recipient");
            require(!presc.isFilled, "Prescription already used");
            require(presc.expiryDate >= block.timestamp, "Prescription expired");
        }

        // Transfer medicine token
        IERC721(medicineTokenAddress).safeTransferFrom(
            msg.sender,
            recipient,
            tokenId
        );

        // Update prescription if used
        if (prescriptionId != 0) {
            PrescriptionNFT(prescriptionTokenAddress).fulfillPrescription(
                prescriptionId,
                new uint256[](0) // Empty array for now
            );
        }

        // Remove listing
        _removeListing(tokenId);

        emit MedicineDonated(tokenId, msg.sender, recipient);
    }

    /**
     * @dev Cancel a medicine listing
     * @param tokenId Medicine NFT token ID
     */
    function cancelListing(uint256 tokenId)
        external
        onlyMedicineOwner(tokenId)
        onlyActiveListing(tokenId)
        nonReentrant
    {
        _removeListing(tokenId);
        emit ListingCancelled(tokenId);
    }

    /**
     * @dev Internal function to remove a listing
     */
    function _removeListing(uint256 tokenId) internal {
        delete listings[tokenId];
        
        // Remove from active listings array
        for (uint256 i = 0; i < activeListings.length; i++) {
            if (activeListings[i] == tokenId) {
                activeListings[i] = activeListings[activeListings.length - 1];
                activeListings.pop();
                break;
            }
        }
    }

    /**
     * @dev Get active listings count
     */
    function getActiveListingsCount() external view returns (uint256) {
        return activeListings.length;
    }

    /**
     * @dev Get paginated active listings
     */
    function getActiveListings(uint256 page, uint256 pageSize)
        external
        view
        returns (MedicineListing[] memory)
    {
        uint256 start = page * pageSize;
        if (start >= activeListings.length) {
            return new MedicineListing[](0);
        }

        uint256 end = start + pageSize;
        if (end > activeListings.length) {
            end = activeListings.length;
        }

        MedicineListing[] memory result = new MedicineListing[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = listings[activeListings[i]];
        }

        return result;
    }

    /**
     * @dev Update platform fee percentage (onlyOwner)
     */
    function setPlatformFeePercentage(uint256 newPercentage) external onlyOwner {
        require(newPercentage <= 10, "Fee too high"); // Max 10%
        platformFeePercentage = newPercentage;
        emit PlatformFeeUpdated(newPercentage);
    }

    /**
     * @dev Update fee wallet address (onlyOwner)
     */
    function setFeeWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid address");
        feeWallet = newWallet;
        emit FeeWalletUpdated(newWallet);
    }

    /**
     * @dev Update medicine token address (onlyOwner)
     */
    function setMedicineTokenAddress(address newAddress) external onlyOwner {
        medicineTokenAddress = newAddress;
    }

    /**
     * @dev Update prescription token address (onlyOwner)
     */
    function setPrescriptionTokenAddress(address newAddress) external onlyOwner {
        prescriptionTokenAddress = newAddress;
    }

    /**
     * @dev Update user registry address (onlyOwner)
     */
    function setUserRegistryAddress(address newAddress) external onlyOwner {
        userRegistryAddress = newAddress;
    }
}