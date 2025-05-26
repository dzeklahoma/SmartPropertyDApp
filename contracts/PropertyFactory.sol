// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Property.sol";

contract PropertyFactory {
    // Counter for property IDs
    uint256 private propertyIdCounter;
    
    // Government/admin address that can verify properties
    address public governmentAddress;
    
    // Mapping of property ID to property contract address
    mapping(uint256 => address) public properties;
    
    // Mapping of owner address to their property IDs
    mapping(address => uint256[]) public ownerProperties;
    
    // Events
    event PropertyContractCreated(uint256 propertyId, address propertyContract, address owner);
    
    constructor() {
        governmentAddress = msg.sender; // Initially, the deployer is the government
        propertyIdCounter = 1;
    }
    
    // Modifier for government-only functions
    modifier onlyGovernment() {
        require(msg.sender == governmentAddress, "Only the government can perform this action");
        _;
    }
    
    // Change government address
    function setGovernmentAddress(address _newGovernmentAddress) external onlyGovernment {
        require(_newGovernmentAddress != address(0), "Invalid address");
        governmentAddress = _newGovernmentAddress;
    }
    
    // Create a new property
    function createProperty(
        string memory _propertyAddress,
        string memory _propertyDetails
    ) external returns (address) {
        uint256 propertyId = propertyIdCounter;
        
        // Create new Property contract
        Property newProperty = new Property(
            propertyId,
            _propertyAddress,
            _propertyDetails,
            msg.sender,
            governmentAddress,
            address(this)
        );
        
        // Store property contract address
        properties[propertyId] = address(newProperty);
        
        // Add to owner's properties
        ownerProperties[msg.sender].push(propertyId);
        
        // Increment counter
        propertyIdCounter++;
        
        emit PropertyContractCreated(propertyId, address(newProperty), msg.sender);
        
        return address(newProperty);
    }
    
    // Get all properties
    function getAllProperties() external view returns (address[] memory) {
        address[] memory allProperties = new address[](propertyIdCounter - 1);
        
        for (uint256 i = 1; i < propertyIdCounter; i++) {
            allProperties[i - 1] = properties[i];
        }
        
        return allProperties;
    }
    
    // Get properties owned by an address
    function getPropertiesByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerProperties[_owner];
    }
    
    // Get property by ID
    function getPropertyById(uint256 _propertyId) external view returns (address) {
        require(_propertyId > 0 && _propertyId < propertyIdCounter, "Property does not exist");
        return properties[_propertyId];
    }
    
    // Add property to owner's list (called when property is transferred)
    function addPropertyToOwner(uint256 _propertyId, address _newOwner) external {
        require(properties[_propertyId] == msg.sender, "Only the property contract can call this function");
        ownerProperties[_newOwner].push(_propertyId);
    }
    
    // Remove property from owner's list (called when property is transferred)
    function removePropertyFromOwner(uint256 _propertyId, address _previousOwner) external {
        require(properties[_propertyId] == msg.sender, "Only the property contract can call this function");
        
        uint256[] storage ownerProps = ownerProperties[_previousOwner];
        for (uint256 i = 0; i < ownerProps.length; i++) {
            if (ownerProps[i] == _propertyId) {
                // Swap with the last element and pop
                ownerProps[i] = ownerProps[ownerProps.length - 1];
                ownerProps.pop();
                break;
            }
        }
    }
}