import { Database } from "../database";
import { Inject, Injectable } from "../utils/injection";

@Injectable
export class AccountService {
  @Inject(Database)
  readonly database!: Database;

  
}