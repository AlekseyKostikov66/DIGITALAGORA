// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./HousingFund.sol";
import "./ContractorManager.sol";

contract ProjectVault is AccessControl {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct ProjectRecord {
        uint256 proposalId;
        string ipfsCid;
        address contractor;
        uint256 fundProjectId;
        bool assigned;
        bool finalized;
    }

    mapping(uint256 => ProjectRecord) public proposals;
    HousingFund public fund;
    ContractorManager public contractorManager;

    event ContractorAssigned(uint256 indexed proposalId, address contractor, uint256 fundProjectId);
    event MilestoneApproved(uint256 indexed proposalId, uint256 milestone);
    event Finalized(uint256 indexed proposalId);

    constructor(address _fund, address _contractorManager, address governor) {
        fund = HousingFund(_fund);
        contractorManager = ContractorManager(_contractorManager);
        _grantRole(GOVERNOR_ROLE, governor);
    }

    function assignContractor(
        uint256 proposalId,
        address contractor,
        uint256 totalBudget,
        uint256[] calldata milestonePercentages,
        string calldata ipfsCid
    ) external onlyRole(GOVERNOR_ROLE) {
        require(!proposals[proposalId].assigned, "Already assigned");
        uint256 fundProjectId = fund.createProject(totalBudget, contractor, milestonePercentages);
        proposals[proposalId] = ProjectRecord({
            proposalId: proposalId,
            ipfsCid: ipfsCid,
            contractor: contractor,
            fundProjectId: fundProjectId,
            assigned: true,
            finalized: false
        });
        emit ContractorAssigned(proposalId, contractor, fundProjectId);
    }

    function approveMilestone(uint256 proposalId) external onlyRole(GOVERNOR_ROLE) {
        ProjectRecord storage rec = proposals[proposalId];
        require(rec.assigned, "No contractor assigned");
        fund.approveMilestone(rec.fundProjectId);
        fund.releasePayment(rec.fundProjectId);
        emit MilestoneApproved(proposalId, rec.fundProjectId);
    }

    function finalize(uint256 proposalId) external onlyRole(GOVERNOR_ROLE) {
        ProjectRecord storage rec = proposals[proposalId];
        require(rec.assigned, "Not assigned");
        require(!rec.finalized, "Already finalized");
        rec.finalized = true;
        emit Finalized(proposalId);
    }
}