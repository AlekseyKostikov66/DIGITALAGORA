// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ContractorManager is AccessControl {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct Contractor {
        address wallet;
        string name;
        string description;
        uint256 rating;
        uint256 completedProjects;
        bool active;
    }

    mapping(address => Contractor) public contractors;
    address[] public contractorList;

    event Registered(address indexed wallet, string name);
    event RatingUpdated(address indexed wallet, uint256 newRating);

    constructor(address governor) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    function register(address wallet, string calldata name, string calldata description) external onlyRole(GOVERNOR_ROLE) {
        require(!contractors[wallet].active, "Already registered");
        contractors[wallet] = Contractor(wallet, name, description, 0, 0, true);
        contractorList.push(wallet);
        emit Registered(wallet, name);
    }

    function updateRating(address wallet, uint256 newRating) external onlyRole(GOVERNOR_ROLE) {
        require(contractors[wallet].active, "Not active");
        contractors[wallet].rating = newRating;
        emit RatingUpdated(wallet, newRating);
    }

    function getAll() external view returns (Contractor[] memory) {
        Contractor[] memory result = new Contractor[](contractorList.length);
        for (uint i = 0; i < contractorList.length; i++) {
            result[i] = contractors[contractorList[i]];
        }
        return result;
    }
}