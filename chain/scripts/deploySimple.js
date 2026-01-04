// scripts/deploySimple.js
async function main() {
  console.log("Deploying SimpleSupplyChain...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  const SimpleSupplyChain = await ethers.getContractFactory("SimpleSupplyChain");
  const simpleSupplyChain = await SimpleSupplyChain.deploy();
  
  await simpleSupplyChain.waitForDeployment();
  
  const contractAddress = await simpleSupplyChain.getAddress();
  console.log("SimpleSupplyChain deployed to:", contractAddress);
  
  // Update frontend config
  console.log("\n=== Frontend Configuration ===");
  console.log("CONTRACT_ADDRESS:", contractAddress);
  console.log("Update your .env file with this address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });