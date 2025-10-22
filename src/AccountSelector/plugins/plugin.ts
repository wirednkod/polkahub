import { SS58String } from "polkadot-api";
import type { Observable } from "rxjs";
import type { Account } from "../state";

export interface SerializableAccount<T = unknown> {
  provider: string;
  address: SS58String;
  name?: string;
  extra?: T;
}

export interface Plugin<A extends Account = Account> {
  id: string;
  serialize?: (account: A) => SerializableAccount;
  deserialize: (value: SerializableAccount) => Promise<A | null> | A | null;
  eq?: (a: A, b: A) => boolean;
  // group => Account
  accounts$: Observable<Record<string, A[]>>;

  // Hooks
  receivePlugins?: (plugins: Plugin[]) => void;
  subscription$?: Observable<unknown>;
}
