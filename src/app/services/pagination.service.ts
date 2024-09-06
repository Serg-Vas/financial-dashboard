import { Injectable } from '@angular/core';
import { LoanData } from '../models/loan-data.model';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {

  applyPagination(loans: LoanData[], currentPage: number, pageSize: number): LoanData[] {
    const startIndex = (currentPage - 1) * pageSize;
    return loans.slice(startIndex, startIndex + pageSize);
  }
}
