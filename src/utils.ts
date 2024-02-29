import * as algokit from "@algorandfoundation/algokit-utils";
import { Account, Algodv2 } from "algosdk";
import { AlgoDidClient } from "../contracts/algo-did-client";

// local account setup
import setup from "../setup.json";

// account settings format
type Profile = {
  name: string;
  node: string;
  app_id: number;
  address: string;
  mnemonic: string;
  private_key: string;
  access_token: string;
};

// get active profile from setup.json
function getProfile(): Profile | undefined {
  return setup.profiles.find((p) => p.name === setup.current_profile);
}

// get Algorand account from setup.json
function getAccount(): Account {
  const profile = getProfile();
  if (!profile) {
    throw new Error("proflie not found, check 'current_profile' in setup.json");
  }
  return algokit.mnemonicAccount(profile.mnemonic);
}

// get algod client based on the active profile
function getAlgodClient(): Algodv2 {
  const profile = getProfile();
  if (!profile) {
    throw new Error("proflie not found, check 'current_profile' in setup.json");
  }
  return algokit.getAlgoClient({
    server: profile.node,
    token: profile.access_token,
  });
}

// get application client based on the active profile
async function getAppClient(): Promise<AlgoDidClient> {
  const profile = getProfile();
  if (!profile) {
    throw new Error("proflie not found, check 'current_profile' in setup.json");
  }
  return new AlgoDidClient(
    {
      sender: getAccount(),
      resolveBy: "id",
      id: profile.app_id,
    },
    getAlgodClient()
  );
}

// create a new account using the local KMD instance
async function createNewAccount(
  name: string,
  algod: Algodv2
): Promise<Account> {
  return algokit.getOrCreateKmdWalletAccount(
    {
      name,
      // set fundWith to 0 so algokit doesn't try to fund the account
      // from another kmd account
      fundWith: algokit.microAlgos(0),
    },
    algod,
    algokit.getAlgoKmdClient({
      server: "http://localhost",
      port: 4002,
      token: "a".repeat(64),
    })
  );
}

export { getAccount, getAlgodClient, getAppClient, createNewAccount, Profile };
