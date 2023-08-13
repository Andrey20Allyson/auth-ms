import { Injectable } from "../container";
import { Config } from "./Config";

export interface AccountServiceConfigData {
  saltRounds: number;
}

@Injectable({
  saltRounds: 8
})
export class AccountServiceConfig extends Config<AccountServiceConfigData> {
  constructor(data: AccountServiceConfigData) {
    super(data);
  }
}