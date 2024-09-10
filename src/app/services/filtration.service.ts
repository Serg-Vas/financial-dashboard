import { Injectable } from '@angular/core';
import { LoanData } from '../models/loan-data.model';

@Injectable()
export class FilterService {

  filterLoans(loans: LoanData[], filters: any): LoanData[] {
    let filtered = loans;

    if (filters.issuanceDateFrom) {
      filtered = filtered.filter(loan => new Date(loan.issuance_date) >= new Date(filters.issuanceDateFrom));
    }
    if (filters.issuanceDateTo) {
      filtered = filtered.filter(loan => new Date(loan.issuance_date) <= new Date(filters.issuanceDateTo));
    }
    if (filters.returnDateFrom) {
      filtered = filtered.filter(loan => new Date(loan.return_date) >= new Date(filters.returnDateFrom));
    }
    if (filters.returnDateTo) {
      filtered = filtered.filter(loan => new Date(loan.return_date) <= new Date(filters.returnDateTo));
    }
    if (filters.showOverdueLoans) {
      filtered = filtered.filter(loan => !loan.actual_return_date || new Date(loan.actual_return_date) > new Date(loan.return_date));
    }

    return filtered;
  }
}