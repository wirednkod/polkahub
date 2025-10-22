import { SS58String } from "polkadot-api";
import { getPolkadotSigner } from "polkadot-api/signer";
import { map } from "rxjs";
import { Account } from "../state";
import { getPublicKey } from "../util";
import {
  localStorageProvider,
  persistedState,
  PersistenceProvider,
} from "./persist";
import { Plugin } from "./plugin";

export interface ReadOnlyPlugin extends Plugin {
  id: "readonly";
  setPersistedAccounts: (payload: SS58String[]) => void;
}

export const readOnlyPlugin = (
  opts?: Partial<{
    fakeSigner: boolean;
    persist: PersistenceProvider;
  }>
): ReadOnlyPlugin => {
  const { fakeSigner, persist } = {
    fakeSigner: false,
    persist: localStorageProvider("readonly-accounts"),
    ...opts,
  };

  const [persistedAccounts$, setPersistedAccounts] = persistedState(
    persist,
    [] as SS58String[]
  );

  const getAccount = (address: SS58String): Account => ({
    provider: "readonly",
    address,
    signer: fakeSigner ? createFakeSigner(address) : undefined,
  });

  const accounts$ = persistedAccounts$.pipe(
    map((accounts) => ({
      readonly: accounts.map(getAccount),
    }))
  );

  return {
    id: "readonly",
    deserialize: (acc) => getAccount(acc.address),
    accounts$,
    setPersistedAccounts,
  };
};

const createFakeSigner = (address: SS58String) =>
  getPolkadotSigner(getPublicKey(address)!, "Sr25519", () => {
    // From https://wiki.acala.network/build/sdks/homa
    const signature = new Uint8Array(64);
    signature.fill(0xcd);
    signature.set([0xde, 0xad, 0xbe, 0xef]);
    return signature;
  });
