import { Inject } from "../container";
import { AccountService } from "../services/Account";
import { Controller, Route, TypedRequest } from "../utils/server";
import { RequestBody } from "./Account.schemas";

@Controller({ path: '/auth' })
export class AccountController {
  @Inject(AccountService)
  readonly service!: AccountService;

  @Route.Post('/create')
  async createAccount(request: TypedRequest) {
    const body = request.body(RequestBody.createAccount);

    return this.service.createAccount(body);
  }

  @Route.Get('/create-session')
  async createSession(request: TypedRequest) {
    
  }
}