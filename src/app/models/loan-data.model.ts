export interface LoanData {
    id: number;
    user: string;
    issuance_date: string;
    return_date: string;
    actual_return_date: string | null;
    body: number;
    percent: number;
  }