import { Plugin } from "@polkahub/plugin";
import { state, useStateObservable } from "@react-rxjs/core";
import type { SS58String } from "polkadot-api";
import { FC, PropsWithChildren, useEffect, useId, useMemo } from "react";
import { EMPTY, merge } from "rxjs";
import { AvailableAccountsContext, Identity, PolkaHubContext } from "./context";
import {
  addInstance,
  availableAccounts$,
  changeIdentityProvider,
  removeInstance,
  setPlugins,
} from "./state";

const defaultedAvailableAccounts$ = state(
  (id: string) => availableAccounts$(id),
  {}
);

type ProviderProps = PropsWithChildren<{
  plugins: Plugin<any>[];
  getIdentity?: (address: SS58String) => Promise<Identity | null>;
  getBalance?: (address: SS58String) => Promise<string | null>;
}>;
export const PolkaHubProvider: FC<ProviderProps> = ({
  children,
  plugins,
  getIdentity = async () => null,
  getBalance = async () => null,
}) => {
  const id = useId();
  const availableAccounts = useStateObservable(defaultedAvailableAccounts$(id));

  useEffect(() => {
    addInstance(id);
    return () => {
      removeInstance(id);
    };
  }, [id]);

  useEffect(() => {
    const sub = merge(plugins.map((p) => p.subscription$ ?? EMPTY)).subscribe();
    setPlugins(id, plugins);

    return () => sub.unsubscribe();
  }, [id, plugins]);

  useEffect(() => {
    changeIdentityProvider(id, getIdentity);
  }, [id, getIdentity]);

  return (
    <PolkaHubContext
      value={useMemo(
        () => ({
          id,
          plugins,
          getIdentity,
          getBalance,
        }),
        [id, plugins, getIdentity, getBalance]
      )}
    >
      <AvailableAccountsContext
        value={useMemo(() => ({ availableAccounts }), [availableAccounts])}
      >
        {children}
      </AvailableAccountsContext>
    </PolkaHubContext>
  );
};
