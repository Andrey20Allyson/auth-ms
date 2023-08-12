import zod from 'zod';

export namespace RequestBody {
  export const createAccount = zod.object({
    username: zod.string(),
    password: zod.string(),
    email: zod.string(),
  });

  export type CreateAccount = zod.infer<typeof createAccount>;
}