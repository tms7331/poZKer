import { Balance } from "@proto-kit/library";
import { Balances } from "./balances";
import { PoZKerApp } from "./poZKer";
import { ModulesConfig } from "@proto-kit/common";

export const modules = {
  PoZKerApp,
  Balances,
};

export const config: ModulesConfig<typeof modules> = {
  PoZKerApp: {},
  Balances: {
    totalSupply: Balance.from(10_000),
  },
};

export default {
  modules,
  config,
};
