// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract LandRegistry {
    struct Land {
        uint256 id;
        string plotNumber;
        string area;
        string district;
        string city;
        string state;
        uint256 areaSqYd;
        address owner;
        bool isForSale;
        address transferRequest;
    }

    struct OwnershipHistory {
        address owner;
        uint256 timestamp;
    }

    uint256 public landCount;
    mapping(uint256 => Land) public lands;
    mapping(address => uint256[]) public ownerLands;
    mapping(uint256 => OwnershipHistory[]) public landOwnershipHistory;
    mapping(bytes32 => bool) private landExists;

    address public admin;

    event LandRegistered(uint256 id, address owner, string plotNumber, uint256 areaSqYd);
    event LandForSale(uint256 id, address owner);
    event TransferRequested(uint256 id, address indexed requester, address indexed owner);
    event TransferApproved(uint256 id, address indexed from, address indexed to);
    event TransferDenied(uint256 id, address indexed requester, address indexed owner);

    modifier onlyOwner(uint256 _landId) {
        require(lands[_landId].owner == msg.sender, "You are not the owner of this land");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // *** KEY CHANGE: Removed 'onlyAdmin' so any user can register land ***
    function registerLand(
        string memory _plotNumber,
        string memory _area,
        string memory _district,
        string memory _city,
        string memory _state,
        uint256 _areaSqYd
    ) public {
        bytes32 landHash = keccak256(abi.encodePacked(_plotNumber, _district, _state));
        require(!landExists[landHash], "Error: Land with these details is already registered");

        landCount++;
        lands[landCount] = Land(
            landCount,
            _plotNumber,
            _area,
            _district,
            _city,
            _state,
            _areaSqYd,
            msg.sender, // The person calling the function is the owner
            false,
            address(0)
        );

        landExists[landHash] = true;
        ownerLands[msg.sender].push(landCount);
        landOwnershipHistory[landCount].push(OwnershipHistory(msg.sender, block.timestamp));

        emit LandRegistered(landCount, msg.sender, _plotNumber, _areaSqYd);
    }
    
    // All other functions remain the same as our previous version...

    function putLandForSale(uint256 _landId) public onlyOwner(_landId) {
        lands[_landId].isForSale = true;
        emit LandForSale(_landId, msg.sender);
    }

    function requestTransfer(uint256 _landId) public {
        require(lands[_landId].isForSale, "Land is not for sale");
        require(lands[_landId].transferRequest == address(0), "Transfer already requested by someone");
        require(msg.sender != lands[_landId].owner, "Owner cannot request transfer to themselves");

        lands[_landId].transferRequest = msg.sender;
        emit TransferRequested(_landId, msg.sender, lands[_landId].owner);
    }

    function approveTransfer(uint256 _landId) public onlyOwner(_landId) {
        require(lands[_landId].transferRequest != address(0), "No transfer request pending");
        address newOwner = lands[_landId].transferRequest;
        address previousOwner = lands[_landId].owner;
        uint256[] storage ownerLandList = ownerLands[previousOwner];
        for (uint256 i = 0; i < ownerLandList.length; i++) {
            if (ownerLandList[i] == _landId) {
                ownerLandList[i] = ownerLandList[ownerLandList.length - 1];
                ownerLandList.pop();
                break;
            }
        }
        lands[_landId].owner = newOwner;
        lands[_landId].isForSale = false;
        lands[_landId].transferRequest = address(0);
        ownerLands[newOwner].push(_landId);
        landOwnershipHistory[_landId].push(OwnershipHistory(newOwner, block.timestamp));
        emit TransferApproved(_landId, previousOwner, newOwner);
    }

    function denyTransfer(uint256 _landId) public onlyOwner(_landId) {
        require(lands[_landId].transferRequest != address(0), "No transfer request pending");
        address requester = lands[_landId].transferRequest;
        lands[_landId].transferRequest = address(0);
        emit TransferDenied(_landId, requester, msg.sender);
    }

    function verifyLand(uint256 _landId) public view returns (string memory, string memory, string memory, string memory, string memory, uint256, address) {
        Land memory land = lands[_landId];
        return (land.plotNumber, land.area, land.district, land.city, land.state, land.areaSqYd, land.owner);
    }

    function getLandsByOwner(address _owner) public view returns (uint256[] memory) {
        return ownerLands[_owner];
    }

    function getPendingTransferRequests(address _owner) public view returns (uint256[] memory) {
        uint256[] memory ownedLands = ownerLands[_owner];
        uint256 pendingCount = 0;
        for (uint256 i = 0; i < ownedLands.length; i++) {
            if (lands[ownedLands[i]].transferRequest != address(0)) {
                pendingCount++;
            }
        }
        uint256[] memory pendingRequests = new uint256[](pendingCount);
        uint256 index = 0;
        for (uint256 i = 0; i < ownedLands.length; i++) {
            uint256 landId = ownedLands[i];
            if (lands[landId].transferRequest != address(0)) {
                pendingRequests[index] = landId;
                index++;
            }
        }
        return pendingRequests;
    }

    function getAllLands() public view onlyAdmin returns (Land[] memory) {
        Land[] memory allLands = new Land[](landCount);
        for (uint256 i = 1; i <= landCount; i++) {
            allLands[i - 1] = lands[i];
        }
        return allLands;
    }

    function getPastOwnershipDetails(uint256 _landId) public view returns (OwnershipHistory[] memory) {
        return landOwnershipHistory[_landId];
    }
}