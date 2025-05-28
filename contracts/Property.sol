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

    // Reentrancy lock
    bool private locked;

    // Events
    event PropertyCreated(uint256 propertyId, string propertyAddress, address owner);
    event PropertyVerified(uint256 propertyId, string propertyAddress);
    event PropertyForSale(uint256 propertyId, uint256 price);
    event PropertySold(uint256 propertyId, address previousOwner, address newOwner, uint256 price);
    event PriceChanged(uint256 propertyId, uint256 newPrice);
    event UtilityNotified(uint256 propertyId, string utilityName, address newOwner);
    event DebugOwnershipNotifyAttempt(uint256 propertyId, address from, address to);

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

    modifier noReentrancy() {
        require(!locked, "Reentrant call.");
        locked = true;
        _;
        locked = false;
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
        locked = false;

        emit PropertyCreated(propertyId, propertyAddress, owner);
    }

    function verifyProperty() external onlyGovernment {
        isVerified = true;
        emit PropertyVerified(propertyId, propertyAddress);
    }

    function setForSale(uint256 _price) external onlyOwner onlyVerified {
        require(_price > 0, "Price must be greater than zero");
        price = _price;
        isForSale = true;
        emit PropertyForSale(propertyId, price);
    }

    function updatePrice(uint256 _newPrice) external onlyOwner onlyVerified {
        require(isForSale, "Property must be for sale");
        require(_newPrice > 0, "Price must be greater than zero");
        price = _newPrice;
        emit PriceChanged(propertyId, _newPrice);
    }

    function removeFromSale() external onlyOwner {
        isForSale = false;
    }

    function buyProperty() external payable onlyVerified noReentrancy {
        require(isForSale, "Property is not for sale");
        require(msg.sender != owner, "Owner cannot buy their own property");
        require(msg.value >= price, "Insufficient funds sent");

        address previousOwner = owner;

        // Transfer ownership
        owner = msg.sender;
        isForSale = false;

        // Transfer funds to previous owner
        (bool sent, ) = payable(previousOwner).call{value: msg.value}("");
        require(sent, "Failed to send funds to previous owner");

        // 🔍 Emit debug event before calling factory notify
        emit DebugOwnershipNotifyAttempt(propertyId, previousOwner, msg.sender);

        // Notify factory about ownership change
        factory.notifyOwnershipTransfer(propertyId, previousOwner, msg.sender);

        // Notify utilities
        notifyUtilities();

        emit PropertySold(propertyId, previousOwner, msg.sender, msg.value);
    }

    function notifyUtilities() private {
        emit UtilityNotified(propertyId, "Electricity", owner);
        emit UtilityNotified(propertyId, "Water", owner);
        emit UtilityNotified(propertyId, "Gas", owner);
    }

    function updatePropertyDetails(string memory _newDetails) external onlyOwner {
        propertyDetails = _newDetails;
    }

    function getPropertyDetails() external view returns (
        uint256, string memory, string memory, uint256, address, bool, bool
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
