// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract HousingFund is AccessControl, ReentrancyGuard {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct Project {
        uint256 totalAmount;
        address contractor;
        uint256 releasedAmount;
        bool completed;
        uint256[] milestonePercentages;
        uint256 currentMilestone;
        mapping(uint256 => bool) milestoneApproved;
    }

    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId;

    event Deposited(address from, uint256 amount);
    event ProjectCreated(uint256 indexed projectId, uint256 amount, address contractor);
    event MilestoneApproved(uint256 indexed projectId, uint256 milestone);
    event PaymentReleased(uint256 indexed projectId, uint256 amount);

    constructor(address governor) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    function deposit() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    function createProject(uint256 amount, address contractor, uint256[] calldata milestonePercentages)
        external onlyRole(GOVERNOR_ROLE) returns (uint256)
    {
        require(amount <= address(this).balance, "Insufficient balance");
        uint256 sum;
        for (uint i = 0; i < milestonePercentages.length; i++) {
            sum += milestonePercentages[i];
        }
        require(sum == 100, "Milestones must sum to 100");
        uint256 projectId = nextProjectId++;
        Project storage p = projects[projectId];
        p.totalAmount = amount;
        p.contractor = contractor;
        p.currentMilestone = 0;
        for (uint i = 0; i < milestonePercentages.length; i++) {
            p.milestonePercentages.push(milestonePercentages[i]);
        }
        emit ProjectCreated(projectId, amount, contractor);
        return projectId;
    }

    function approveMilestone(uint256 projectId) external onlyRole(GOVERNOR_ROLE) {
        Project storage p = projects[projectId];
        require(!p.completed, "Already completed");
        require(!p.milestoneApproved[p.currentMilestone], "Already approved");
        p.milestoneApproved[p.currentMilestone] = true;
        emit MilestoneApproved(projectId, p.currentMilestone);
    }

    function releasePayment(uint256 projectId) external nonReentrant onlyRole(GOVERNOR_ROLE) {
        Project storage p = projects[projectId];
        require(p.milestoneApproved[p.currentMilestone], "Milestone not approved");
        uint256 payment = (p.totalAmount * p.milestonePercentages[p.currentMilestone]) / 100;
        require(payment > 0, "Zero payment");
        require(payment <= address(this).balance, "Insufficient balance");
        p.releasedAmount += payment;
        (bool sent, ) = p.contractor.call{value: payment}("");
        require(sent, "Payment failed");
        emit PaymentReleased(projectId, payment);
        p.currentMilestone++;
        if (p.currentMilestone >= p.milestonePercentages.length) {
            p.completed = true;
        }
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}