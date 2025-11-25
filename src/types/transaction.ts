export interface Transaction {
  id: string;
  type: "DEPOSIT" | "TRANSFER" | "REVERSAL";
  amount: number;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  relatedTransactionId?: string | null;
  createdAt?: string;
}
