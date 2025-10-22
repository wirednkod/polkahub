import { state } from "@react-rxjs/core";
import { combineKeys, createKeyedSignal } from "@react-rxjs/utils";
import type { PolkadotSigner, SS58String } from "polkadot-api";
import { map } from "rxjs";
import type { Plugin } from "./plugins";

export interface Account {
  provider: string;
  address: SS58String;
  signer?: PolkadotSigner;
  name?: string;
}

const [pluginsChange$, changePlugins] = createKeyedSignal<string, Plugin[]>();
export const setPlugins = (id: string, plugins: Plugin[]) => {
  plugins.forEach((p) => p.receivePlugins?.(plugins));
  changePlugins(id, plugins);
};

export const plugins$ = state((id: string) => pluginsChange$(id));

export const availableAccounts$ = state((id: string) =>
  combineKeys(plugins$(id), (plugin) => plugin.accounts$).pipe(
    map((pluginMap) =>
      Object.fromEntries(
        Array.from(pluginMap.entries()).map(([plugin, accounts]) => [
          plugin.id,
          accounts,
        ])
      )
    )
  )
);

export const subscription$ = state((id: string) => availableAccounts$(id));
