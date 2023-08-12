import { AccountService } from "../services/Account";
import { Inject } from "../utils/injection";
import { Controller, Route, TypedRequest } from "../utils/server";

@Controller({ path: '/auth' })
export class AccountController {
  @Inject(AccountService)
  service!: AccountService;

  @Route({
    path: '/create',
    method: 'POST',
  })
  createAccount(request: TypedRequest) {
    // request.check({ body: RequestBody.createAccount });

    console.log(!!this.service);
  }
}