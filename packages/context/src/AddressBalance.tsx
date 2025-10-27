import { SS58String } from "polkadot-api";
import { FC } from "react";
import { useBalance } from "./context";

export const AddressBalance: FC<{ addr: SS58String; className?: string }> = ({
  addr,
  className,
}) => {
  const balance = useBalance(addr);
  return balance ? <span className={className}>{balance}</span> : null;
};
