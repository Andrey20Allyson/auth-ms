import { genSalt, hash } from 'bcryptjs';
import { AccountServiceConfig } from "../config/AccountService";
import { RequestBody } from "../controllers/Account.schemas";
import { Database } from "../database";
import { Inject, Injectable } from '../container';

@Injectable()
export class AccountService {
  @Inject(Database)
  readonly database!: Database;

  @Inject(AccountServiceConfig)
  readonly config!: AccountServiceConfig;

  async createAccount(data: RequestBody.CreateAccount) {
    const { email, password, username } = data;

    const salt = await genSalt(this.config.get('saltRounds'));

    const passwordHash = await hash(password, salt);

    const resp = await this.database.users.create({
      data: {
        password_hash: passwordHash,
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