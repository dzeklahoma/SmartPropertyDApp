// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./PropertyFactory.sol";

contract Property {
    // Property details
    uint256 public propertyId;
    string public propertyAddress;
    string public propertyDetails;
    uint256 public price;
    address public owner;
    bool public isVerified;
    bool public isForSale;
    
    // Government/admin address that can verify properties
    address public governmentAddress;
    
    // PropertyFactory reference
    PropertyFactory private factory;
    
    // Events
    event PropertyCreated(uint256 propertyId, string propertyAddress, address owner);
    event PropertyVerified(uint256 propertyId, string propertyAddress);
    event PropertyForSale(uint256 propertyId, uint256 price);
    event PropertySold(uint256 propertyId, address previousOwner, address newOwner, uint256 price);
    event PriceChanged(uint256 propertyId, uint256 newPrice);
    event UtilityNotified(uint256 propertyId, string utilityName, address newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the property owner can perform this action");
        _;
    }
    
    modifier onlyGovernment() {
        require(msg.sender == governmentAddress, "Only the government can perform this action");
        _;
    }
    
    modifier onlyVerified() {
        require(isVerified, "Property must be verified first");
        _;
    }
    
    constructor(
        uint256 _propertyId,
        string memory _propertyAddress,
        string memory _propertyDetails,
        address _owner,
        address _governmentAddress,
        address _factoryAddress
    ) {
        propertyId = _propertyId;
        propertyAddress = _propertyAddress;
        propertyDetails = _propertyDetails;
        owner = _owner;
        governmentAddress = _governmentAddress;
        isVerified = false;
        isForSale = false;
        factory = PropertyFactory(_factoryAddress);
        
        emit PropertyCreated(propertyId, propertyAddress, owner);
    }
    
    // Verify property by government
    function verifyProperty() external onlyGovernment {
        isVerified = true;
        emit PropertyVerified(propertyId, propertyAddress);
    }
    
    // Set property for sale
    function setForSale(uint256 _price) external onlyOwner onlyVerified {
        require(_price > 0, "Price must be greater than zero");
        price = _price;
        isForSale = true;
        emit PropertyForSale(propertyId, price);
    }
    
    // Update property price
    function updatePrice(uint256 _newPrice) external onlyOwner onlyVerified {
        require(isForSale, "Property must be for sale");
        require(_newPrice > 0, "Price must be greater than zero");
        price = _newPrice;
        emit PriceChanged(propertyId, _newPrice);
    }
    
    // Remove from sale
    function removeFromSale() external onlyOwner {
        isForSale = false;
    }
    
    // Buy property
    function buyProperty() external payable onlyVerified {
        require(isForSale, "Property is not for sale");
        require(msg.sender != owner, "Owner cannot buy their own property");
        require(msg.value >= price, "Insufficient funds sent");
        
        address previousOwner = owner;
        
        // Transfer ownership
        owner = msg.sender;
        isForSale = false;
        
        // Transfer funds to previous owner
        payable(previousOwner).transfer(msg.value);
        
        // Notify utilities about ownership change
        notifyUtilities();
        
        emit PropertySold(propertyId, previousOwner, msg.sender, msg.value);
    }
    
    // Notify utilities about ownership change
    function notifyUtilities() private {
        // In a real implementation, this would integrate with utility providers' APIs
        // For the MVP, we'll just emit events
        emit UtilityNotified(propertyId, "Electricity", owner);
        emit UtilityNotified(propertyId, "Water", owner);
        emit UtilityNotified(propertyId, "Gas", owner);
    }
    
    // Update property details
    function updatePropertyDetails(string memory _newDetails) external onlyOwner {
        propertyDetails = _newDetails;
    }
    
    // Get property details
    function getPropertyDetails() external view returns (
        uint256, 
        string memory, 
        string memory, 
        uint256, 
        address, 
        bool, 
        bool
    ) {
        return (
            propertyId,
            propertyAddress,
            propertyDetails,
            price,
            owner,
            isVerified,
            isForSale
        );
    }
}