import { RequestBody } from "../controllers/Account.schemas";
import { Database } from "../database";
import { Inject, Injectable } from "../utils/injection";

@Injectable
export class AccountService {
  @Inject(Database)
  readonly database!: Database;

  async createAccount(data: RequestBody.CreateAccount) {
    const { email, password, username } = data;

    const resp = await this.database.users.create({
      data: {
        password_hash: password,
        username,
        email,
      },
      select: {
        user_id: true,
      },
    });

    return { id: resp.user_id };
  }
}