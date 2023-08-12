import { AccountService } from "../services/Account";
import { Inject } from "../utils/injection";
import { Controller, Route, TypedRequest } from "../utils/server";
import { RequestBody } from "./Account.schemas";

@Controller({ path: '/auth' })
export class AccountController {
  @Inject(AccountService)
  readonly service!: AccountService;

  @Route({
    path: '/create',
    method: 'POST',
  })
  async createAccount(request: TypedRequest) {
    const { body } = request.check({ body: RequestBody.createAccount });

    return this.service.createAccount(body);
  }
}