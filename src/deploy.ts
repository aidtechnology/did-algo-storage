import * as algokit from "@algorandfoundation/algokit-utils";
import { AlgoClientConfig } from "@algorandfoundation/algokit-utils/types/network-client";
import { AlgoDidClient } from "../contracts/algo-did-client";
import { getAccount } from "./utils";

// deploy the smart contract to an Algorand network
async function deploy() {
  // Get selected network from command line
  const algoNetwork = process.argv[2] as "local" | "testnet" | "mainnet";

  // Get algod configuration
  let algodConf: AlgoClientConfig;
  if (algoNetwork === "local") {
    algodConf = {
      server: "http://localhost",
      port: 4001,
      token: "a".repeat(64),
    };
  } else {
    algodConf = algokit.getAlgoNodeConfig(algoNetwork, "algod");
  }

  // Get algod client and deployer account
  const algod = algokit.getAlgoClient(algodConf);
  const deployer = getAccount();

  // Check if deployer account has enough funds to perform the deployment
  // operation
  const { amount } = await algod.accountInformation(deployer.addr).do();
  if (amount === 0) {
    throw Error(
      `Account ${deployer.addr} has no funds. Please fund it and try again.`
    );
  }

  // Create application client and deploy the application
  const appClient = new AlgoDidClient(
    {
      sender: deployer,
      resolveBy: "id",
      id: 0,
    },
    algod
  );
  await appClient.create.createApplication({});
}

deploy();
