const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. AgoraToken
  const initialSupply = ethers.parseEther("1000000");
  const Token = await ethers.getContractFactory("AgoraToken");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("AgoraToken deployed to:", tokenAddress);

  // 2. TimelockController
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(
    86400,
    [deployer.address],
    [deployer.address],
    deployer.address
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("TimelockController deployed to:", timelockAddress);

  // 3. AgoraGovernor
  const votingDelay = 7200;
  const votingPeriod = 50400;
  const proposalThreshold = ethers.parseEther("1000");
  const quorumPercentage = 4;
  const Governor = await ethers.getContractFactory("AgoraGovernor");
  const governor = await Governor.deploy(
    tokenAddress,
    timelockAddress,
    votingDelay,
    votingPeriod,
    proposalThreshold,
    quorumPercentage
  );
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("AgoraGovernor deployed to:", governorAddress);

  // 4. HousingFund
  const Fund = await ethers.getContractFactory("HousingFund");
  const fund = await Fund.deploy(governorAddress);
  await fund.waitForDeployment();
  const fundAddress = await fund.getAddress();
  console.log("HousingFund deployed to:", fundAddress);

  // 5. ContractorManager
  const Manager = await ethers.getContractFactory("ContractorManager");
  const manager = await Manager.deploy(governorAddress);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("ContractorManager deployed to:", managerAddress);

  // 6. ProjectVault
  const Vault = await ethers.getContractFactory("ProjectVault");
  const vault = await Vault.deploy(fundAddress, managerAddress, governorAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("ProjectVault deployed to:", vaultAddress);

  // Передаём админку Timelock губернатору
  const adminRole = ethers.id("TIMELOCK_ADMIN_ROLE");
  await timelock.grantRole(adminRole, governorAddress);
  await timelock.revokeRole(adminRole, deployer.address);
  console.log("Timelock admin transferred to Governor");

  // Сохраняем адреса
  const addresses = {
    token: tokenAddress,
    governor: governorAddress,
    timelock: timelockAddress,
    housingFund: fundAddress,
    contractorManager: managerAddress,
    projectVault: vaultAddress
  };
  fs.writeFileSync("deployed.json", JSON.stringify(addresses, null, 2));
  console.log("\n✅ Deployment complete! Addresses saved to deployed.json");
  console.log(addresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});