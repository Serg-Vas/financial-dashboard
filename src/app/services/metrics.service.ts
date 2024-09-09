import { Injectable } from '@angular/core';
import { LoanData } from '../models/loan-data.model';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  
  // Filter loans by the selected month
  filterLoansByMonth(loans: LoanData[], year: number, month: number): LoanData[] {
    return loans.filter(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      return issuanceDate.getFullYear() === year && issuanceDate.getMonth() + 1 === month;
    });
  }

  // Calculate total amount (body or percent)
  calculateTotal(loans: LoanData[], field: 'body' | 'percent'): number {
    return loans.reduce((sum, loan) => sum + loan[field], 0);
  }

  // Calculate average loan amount
  calculateAverageLoanAmount(totalLoans: number, totalLoanAmount: number): number {
    return totalLoans ? totalLoanAmount / totalLoans : 0;
  }

  // Calculate loans returned
  calculateLoansReturned(loans: LoanData[]): number {
    return loans.filter(loan => loan.actual_return_date).length;
  }

  // Top users by loan count
  calculateTopUsersByLoanCount(loans: LoanData[]): { user: string; count: number }[] {
    const userLoanCount = this.countLoansByUser(loans);
    return Object.entries(userLoanCount)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Top users by total interest
  calculateTopUsersByTotalInterest(loans: LoanData[]): { user: string; totalInterest: number }[] {
    const userTotalInterest = this.calculateUserTotalInterest(loans);
    return Object.entries(userTotalInterest)
      .map(([user, totalInterest]) => ({ user, totalInterest }))
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 10);
  }

  // Top users by interest-to-body ratio
  calculateTopUsersByInterestToBodyRatio(loans: LoanData[]): { user: string; ratio: number }[] {
    const userInterestToBodyRatio = this.calculateUserInterestToBodyRatio(loans);
    return Object.entries(userInterestToBodyRatio)
      .map(([user, { totalInterest, totalBody }]) => ({
        user,
        ratio: totalBody > 0 ? totalInterest / totalBody : 0
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);
  }

  private countLoansByUser(loans: LoanData[]): { [key: string]: number } {
    return loans.reduce((acc, loan) => {
      acc[loan.user] = (acc[loan.user] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private calculateUserTotalInterest(loans: LoanData[]): { [key: string]: number } {
    return loans.filter(loan => loan.actual_return_date !== null)
      .reduce((acc, loan) => {
        acc[loan.user] = (acc[loan.user] || 0) + loan.percent;
        return acc;
      }, {} as { [key: string]: number });
  }

  private calculateUserInterestToBodyRatio(loans: LoanData[]): { [key: string]: { totalInterest: number, totalBody: number } } {
    return loans.filter(loan => loan.actual_return_date !== null)
      .reduce((acc, loan) => {
        if (!acc[loan.user]) {
          acc[loan.user] = { totalInterest: 0, totalBody: 0 };
        }
        acc[loan.user].totalInterest += loan.percent;
        acc[loan.user].totalBody += loan.body;
        return acc;
      }, {} as { [key: string]: { totalInterest: number, totalBody: number } });
  }
}
