import type { Account, Plugin } from "@polkahub/plugin";
import { state } from "@react-rxjs/core";
import {
  combineKeys,
  createKeyedSignal,
  createSignal,
  mergeWithKey,
} from "@react-rxjs/utils";
import { SS58String } from "polkadot-api";
import { distinctUntilChanged, map, merge, scan } from "rxjs";
import { Identity } from "./context";

const [addInstance$, addInstance] = createSignal<string>();
const [removeInstance$, removeInstance] = createSignal<string>();
export { addInstance, removeInstance };
export const contextInstances$ = state(
  mergeWithKey({ addInstance$, removeInstance$ }).pipe(
    scan((acc: Record<string, number>, v) => {
      acc[v.payload] =
        (acc[v.payload] ?? 0) + (v.type === "addInstance$" ? 1 : -1);
      return acc;
    }, {}),
    map((v) => Object.keys(v))
  ),
  []
);

const [pluginsChange$, changePlugins] = createKeyedSignal<string, Plugin[]>();
export const setPlugins = (id: string, plugins: Plugin[]) => {
  plugins.forEach((p) => p.receivePlugins?.(plugins));
  changePlugins(id, plugins);
};

export const plugins$ = state((id: string) => pluginsChange$(id));
export const plugin$ = <T extends Plugin<any>>(id: string, provider: string) =>
  plugins$(id).pipe(
    map((plugins) => plugins.find((p) => p.id === provider) as T | undefined),
    distinctUntilChanged()
  );

export const availableAccounts$ = state((id: string) =>
  combineKeys(
    plugins$(id),
    (plugin) =>
      plugin.accountGroups$ ??
      plugin.accounts$.pipe(map((accounts) => ({ [plugin.id]: accounts })))
  ).pipe(
    map((pluginMap) => Array.from(pluginMap.values())),
    map((groups) =>
      groups.reduce(
        (acc: Record<string, Account[]>, v) => ({
          ...acc,
          ...v,
        }),
        {}
      )
    )
  )
);

export const [identityProviderChange$, changeIdentityProvider] =
  createKeyedSignal<
    string,
    (address: SS58String) => Promise<Identity | null>
  >();
export const identityProvider$ = state((id: string) =>
  identityProviderChange$(id).pipe(distinctUntilChanged())
);

const subscription$ = state((id: string) =>
  merge(availableAccounts$(id), identityProvider$(id))
);
combineKeys(contextInstances$, subscription$).subscribe();
