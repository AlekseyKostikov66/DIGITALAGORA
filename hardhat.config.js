require("@nomicfoundation/hardhat-toolbox");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");
const path = require("path");

// Переопределяем задачу для использования локального компилятора (обход HH502)
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion === "0.8.28") {
        const compilerPath = path.join(__dirname, "node_modules/solc/soljson.js");
        return {
            compilerPath,
            isSolcJs: true,
            version: args.solcVersion,
            longVersion: "0.8.28+commit.7893614a"
        };
    }
    return runSuper();
});

module.exports = {
    solidity: {
        version: "0.8.28",
        settings: {
            optimizer: { enabled: true, runs: 200 },
            evmVersion: "cancun"
        }
    },
networks: {
    hardhat: {
        chainId: 1337
    },
    localhost: {
        url: "http://127.0.0.1:8545"
    }
}
};