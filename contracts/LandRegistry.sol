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

    struct LandCertificate {
        uint256 landId;
        address owner;
        string certificateHash;
        uint256 issueDate;
        bool isValid;
    }

    struct User {
        address userAddress;
        string fullName;
        string email;
        string phone;
        string nationalId;
        string homeAddress;
        bool isApproved;
        bool isRegistered;
        uint256 registrationTime;
    }

    uint256 public landCount;
    uint256 public userCount;
    uint256 public certificateCount;
    mapping(uint256 => Land) public lands;
    mapping(address => uint256[]) public ownerLands;
    mapping(uint256 => OwnershipHistory[]) public landOwnershipHistory;
    mapping(bytes32 => bool) private landExists;
    mapping(address => User) public users;
    mapping(uint256 => address) public userAddresses;
    mapping(address => bool) public approvedUsers;
    mapping(uint256 => LandCertificate) public certificates;
    mapping(uint256 => uint256) public landToCertificate; // landId => certificateId
    mapping(string => bool) public certificateHashExists;

    address public admin;

    event LandRegistered(uint256 id, address owner, string plotNumber, uint256 areaSqYd);
    event LandForSale(uint256 id, address owner);
    event TransferRequested(uint256 id, address indexed requester, address indexed owner);
    event TransferApproved(uint256 id, address indexed from, address indexed to);
    event TransferDenied(uint256 id, address indexed requester, address indexed owner);
    event UserRegistered(address indexed user, string fullName, uint256 timestamp);
    event UserApproved(address indexed user, address indexed admin);
    event UserRejected(address indexed user, address indexed admin);
    event CertificateGenerated(uint256 indexed certificateId, uint256 indexed landId, address indexed owner, string certificateHash);

    modifier onlyOwner(uint256 _landId) {
        require(lands[_landId].owner == msg.sender, "You are not the owner of this land");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApprovedUser() {
        require(approvedUsers[msg.sender], "You must be an approved user to perform this action");
        _;
    }

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "You must be registered to perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        // Auto-approve the admin
        users[admin] = User({
            userAddress: admin,
            fullName: "System Administrator",
            email: "admin@landregistry.com",
            phone: "+1234567890",
            nationalId: "ADMIN001",
            homeAddress: "System Address",
            isApproved: true,
            isRegistered: true,
            registrationTime: block.timestamp
        });
        approvedUsers[admin] = true;
        userAddresses[userCount] = admin;
        userCount++;
    }

    // User registration function
    function registerUser(
        string memory _fullName,
        string memory _email,
        string memory _phone,
        string memory _nationalId,
        string memory _homeAddress
    ) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_fullName).length > 0, "Full name is required");
        require(bytes(_email).length > 0, "Email is required");
        require(bytes(_nationalId).length > 0, "National ID is required");

        users[msg.sender] = User({
            userAddress: msg.sender,
            fullName: _fullName,
            email: _email,
            phone: _phone,
            nationalId: _nationalId,
            homeAddress: _homeAddress,
            isApproved: false,
            isRegistered: true,
            registrationTime: block.timestamp
        });

        userAddresses[userCount] = msg.sender;
        userCount++;

        emit UserRegistered(msg.sender, _fullName, block.timestamp);
    }

    // Admin function to approve user
    function approveUser(address _userAddress) public onlyAdmin {
        require(users[_userAddress].isRegistered, "User not registered");
        require(!users[_userAddress].isApproved, "User already approved");

        users[_userAddress].isApproved = true;
        approvedUsers[_userAddress] = true;

        emit UserApproved(_userAddress, msg.sender);
    }

    // Admin function to reject user
    function rejectUser(address _userAddress) public onlyAdmin {
        require(users[_userAddress].isRegistered, "User not registered");
        require(!users[_userAddress].isApproved, "User already approved");

        users[_userAddress].isApproved = false;
        users[_userAddress].isRegistered = false;
        
        emit UserRejected(_userAddress, msg.sender);
    }

    // Get all pending users for admin review
    function getPendingUsers() public view onlyAdmin returns (address[] memory) {
        uint256 pendingCount = 0;
        
        // Count pending users
        for (uint256 i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            if (users[userAddr].isRegistered && !users[userAddr].isApproved) {
                pendingCount++;
            }
        }
        
        // Create array of pending users
        address[] memory pendingUsers = new address[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            if (users[userAddr].isRegistered && !users[userAddr].isApproved) {
                pendingUsers[index] = userAddr;
                index++;
            }
        }
        
        return pendingUsers;
    }

    // Get all approved users
    function getApprovedUsers() public view onlyAdmin returns (address[] memory) {
        uint256 approvedCount = 0;
        
        // Count approved users
        for (uint256 i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            if (users[userAddr].isApproved) {
                approvedCount++;
            }
        }
        
        // Create array of approved users
        address[] memory approvedUsersList = new address[](approvedCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            if (users[userAddr].isApproved) {
                approvedUsersList[index] = userAddr;
                index++;
            }
        }
        
        return approvedUsersList;
    }

    // Check if user is approved
    function isUserApproved(address _userAddress) public view returns (bool) {
        return approvedUsers[_userAddress];
    }

    // Get user details
    function getUserDetails(address _userAddress) public view returns (
        string memory fullName,
        string memory email,
        string memory phone,
        string memory nationalId,
        string memory homeAddress,
        bool isApproved,
        bool isRegistered,
        uint256 registrationTime
    ) {
        User memory user = users[_userAddress];
        return (
            user.fullName,
            user.email,
            user.phone,
            user.nationalId,
            user.homeAddress,
            user.isApproved,
            user.isRegistered,
            user.registrationTime
        );
    }

    // Land registration function - requires approved user
    function registerLand(
        string memory _plotNumber,
        string memory _area,
        string memory _district,
        string memory _city,
        string memory _state,
        uint256 _areaSqYd
    ) public onlyApprovedUser {
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
        
        // Remove from previous owner's list
        uint256[] storage ownerLandList = ownerLands[previousOwner];
        for (uint256 i = 0; i < ownerLandList.length; i++) {
            if (ownerLandList[i] == _landId) {
                ownerLandList[i] = ownerLandList[ownerLandList.length - 1];
                ownerLandList.pop();
                break;
            }
        }
        
        // Invalidate existing certificate
        invalidateCertificate(_landId);
        landToCertificate[_landId] = 0; // Reset certificate mapping
        
        // Transfer ownership
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

    // Get all transactions for a specific user (admin only)
    function getUserTransactionHistory(address _userAddress) public view onlyAdmin returns (
        uint256[] memory ownedLandIds,
        uint256[] memory soldLandIds,
        uint256[] memory purchasedLandIds
    ) {
        // Current owned lands
        ownedLandIds = ownerLands[_userAddress];
        
        // Count lands sold and purchased
        uint256 soldCount = 0;
        uint256 purchasedCount = 0;
        
        for (uint256 i = 1; i <= landCount; i++) {
            OwnershipHistory[] memory history = landOwnershipHistory[i];
            
            // Check if user has sold this land (was owner but not current owner)
            bool wasPreviousOwner = false;
            bool isCurrentOwner = lands[i].owner == _userAddress;
            
            for (uint256 j = 0; j < history.length; j++) {
                if (history[j].owner == _userAddress) {
                    wasPreviousOwner = true;
                    break;
                }
            }
            
            if (wasPreviousOwner && !isCurrentOwner) {
                soldCount++;
            }
            
            // Check if user has purchased this land (not the original registerer)
            if (history.length > 1 && isCurrentOwner) {
                if (history[0].owner != _userAddress) {
                    purchasedCount++;
                }
            }
        }
        
        // Build arrays for sold and purchased lands
        soldLandIds = new uint256[](soldCount);
        purchasedLandIds = new uint256[](purchasedCount);
        
        uint256 soldIndex = 0;
        uint256 purchasedIndex = 0;
        
        for (uint256 i = 1; i <= landCount; i++) {
            OwnershipHistory[] memory history = landOwnershipHistory[i];
            bool wasPreviousOwner = false;
            bool isCurrentOwner = lands[i].owner == _userAddress;
            
            for (uint256 j = 0; j < history.length; j++) {
                if (history[j].owner == _userAddress) {
                    wasPreviousOwner = true;
                    break;
                }
            }
            
            if (wasPreviousOwner && !isCurrentOwner) {
                soldLandIds[soldIndex] = i;
                soldIndex++;
            }
            
            if (history.length > 1 && isCurrentOwner && history[0].owner != _userAddress) {
                purchasedLandIds[purchasedIndex] = i;
                purchasedIndex++;
            }
        }
        
        return (ownedLandIds, soldLandIds, purchasedLandIds);
    }
    
    // Get transaction summary for all users (admin only)
    function getAllUsersTransactionSummary() public view onlyAdmin returns (
        address[] memory userAddressList,
        uint256[] memory registeredCount,
        uint256[] memory soldCount,
        uint256[] memory purchasedCount
    ) {
        // Create arrays for all registered users
        userAddressList = new address[](userCount);
        registeredCount = new uint256[](userCount);
        soldCount = new uint256[](userCount);
        purchasedCount = new uint256[](userCount);
        
        for (uint256 i = 0; i < userCount; i++) {
            address userAddr = userAddresses[i];
            userAddressList[i] = userAddr;
            
            // Count registered lands (lands they originally registered)
            uint256 regCount = 0;
            uint256 soldLands = 0;
            uint256 purchasedLands = 0;
            
            for (uint256 j = 1; j <= landCount; j++) {
                OwnershipHistory[] memory history = landOwnershipHistory[j];
                
                if (history.length > 0) {
                    // Original registerer
                    if (history[0].owner == userAddr) {
                        regCount++;
                    }
                    
                    // Check for sales and purchases
                    bool wasPreviousOwner = false;
                    bool isCurrentOwner = lands[j].owner == userAddr;
                    
                    for (uint256 k = 0; k < history.length; k++) {
                        if (history[k].owner == userAddr) {
                            wasPreviousOwner = true;
                            break;
                        }
                    }
                    
                    if (wasPreviousOwner && !isCurrentOwner) {
                        soldLands++;
                    }
                    
                    if (history.length > 1 && isCurrentOwner && history[0].owner != userAddr) {
                        purchasedLands++;
                    }
                }
            }
            
            registeredCount[i] = regCount;
            soldCount[i] = soldLands;
            purchasedCount[i] = purchasedLands;
        }
        
        return (userAddressList, registeredCount, soldCount, purchasedCount);
    }

    // Generate Land Certificate (only land owner can generate)
    function generateLandCertificate(uint256 _landId) public returns (uint256) {
        require(lands[_landId].owner == msg.sender, "Only the land owner can generate certificate");
        require(landToCertificate[_landId] == 0, "Certificate already exists for this land");
        
        certificateCount++;
        
        // Generate unique certificate hash
        string memory certificateHash = generateCertificateHash(_landId, msg.sender, block.timestamp);
        require(!certificateHashExists[certificateHash], "Certificate hash collision (very rare)");
        
        // Create certificate
        certificates[certificateCount] = LandCertificate({
            landId: _landId,
            owner: msg.sender,
            certificateHash: certificateHash,
            issueDate: block.timestamp,
            isValid: true
        });
        
        // Map land to certificate
        landToCertificate[_landId] = certificateCount;
        certificateHashExists[certificateHash] = true;
        
        emit CertificateGenerated(certificateCount, _landId, msg.sender, certificateHash);
        
        return certificateCount;
    }
    
    // Generate unique certificate hash
    function generateCertificateHash(uint256 _landId, address _owner, uint256 _timestamp) private view returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(
            "LAND_CERTIFICATE",
            _landId,
            _owner,
            _timestamp,
            block.difficulty,
            blockhash(block.number - 1)
        ));
        return toHexString(hash);
    }
    
    // Convert bytes32 to hex string
    function toHexString(bytes32 data) private pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[1+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }
    
    // Get certificate for a land
    function getCertificate(uint256 _landId) public view returns (
        uint256 certificateId,
        address owner,
        string memory certificateHash,
        uint256 issueDate,
        bool isValid
    ) {
        certificateId = landToCertificate[_landId];
        require(certificateId > 0, "No certificate exists for this land");
        
        LandCertificate memory cert = certificates[certificateId];
        return (certificateId, cert.owner, cert.certificateHash, cert.issueDate, cert.isValid);
    }
    
    // Verify certificate by hash
    function verifyCertificateHash(string memory _certificateHash) public view returns (
        bool exists,
        uint256 landId,
        address owner,
        uint256 issueDate
    ) {
        if (!certificateHashExists[_certificateHash]) {
            return (false, 0, address(0), 0);
        }
        
        // Find certificate by hash (linear search - could be optimized)
        for (uint256 i = 1; i <= certificateCount; i++) {
            if (keccak256(bytes(certificates[i].certificateHash)) == keccak256(bytes(_certificateHash))) {
                return (
                    certificates[i].isValid,
                    certificates[i].landId,
                    certificates[i].owner,
                    certificates[i].issueDate
                );
            }
        }
        
        return (false, 0, address(0), 0);
    }
    
    // Check if land has certificate
    function landHasCertificate(uint256 _landId) public view returns (bool) {
        return landToCertificate[_landId] > 0;
    }
    
    // Invalidate certificate (only by admin or in case of ownership transfer)
    function invalidateCertificate(uint256 _landId) internal {
        uint256 certificateId = landToCertificate[_landId];
        if (certificateId > 0) {
            certificates[certificateId].isValid = false;
        }
    }
}