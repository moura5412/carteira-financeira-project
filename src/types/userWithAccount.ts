import type { User } from "./user";

export interface UserWithAccount extends User {
  accountId: string;
  balance: number;
}
