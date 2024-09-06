import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-summary-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss'],
  providers: [LoanDataService]
})
export class SummaryInfoComponent implements OnInit {
  loans = signal<LoanData[]>([]);
  selectedMonth = signal<string | null>(null);

  // Метрики
  totalLoans = signal<number>(0);
  averageLoanAmount = signal<number>(0);
  totalLoanAmount = signal<number>(0);
  totalInterestAccrued = signal<number>(0);
  totalLoansReturned = signal<number>(0);

  topUsersByLoanCount = signal<{ user: string; count: number }[]>([]);
  topUsersByTotalInterest = signal<{ user: string; totalInterest: number }[]>([]);
  topUsersByInterestToBodyRatio = signal<{ user: string; ratio: number }[]>([]);

  private destroyRef = inject(DestroyRef);

  constructor(private loanDataService: LoanDataService) {}

  ngOnInit(): void {
    this.loanDataService.loadLoans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.loans.set(data);
      this.calculateMetrics();
    });
  }

  calculateMetrics(): void {
    const month = this.selectedMonth();
    
    if (month) {
      this.calculateMonthlyMetrics(month);
    } else {
      this.resetMetrics();
      this.calculateTopUsers();
    }
  }
  
  //обчислення метрик для вибраного місяця
  private calculateMonthlyMetrics(month: string): void {
    const [selectedYear, selectedMonth] = month.split('-').map(Number);
  
    const filteredLoans = this.filterLoansByMonth(selectedYear, selectedMonth);
  
    this.totalLoans.set(filteredLoans.length);
    this.totalLoanAmount.set(this.calculateTotal(filteredLoans, 'body'));
    this.totalInterestAccrued.set(this.calculateTotal(filteredLoans, 'percent'));
    this.averageLoanAmount.set(this.calculateAverageLoanAmount());
    this.totalLoansReturned.set(this.calculateLoansReturned(filteredLoans));
  }
  
  private filterLoansByMonth(year: number, month: number): LoanData[] {
    return this.loans().filter(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      return issuanceDate.getFullYear() === year && issuanceDate.getMonth() + 1 === month;
    });
  }
  
  private calculateTotal(loans: LoanData[], field: 'body' | 'percent'): number {
    return loans.reduce((sum, loan) => sum + loan[field], 0);
  }
  
  //Обчислюємо середню суму кредиту
  private calculateAverageLoanAmount(): number {
    return this.totalLoans() ? this.totalLoanAmount() / this.totalLoans() : 0;
  }
  
  //Підраховуємо кількість повернених кредитів
  private calculateLoansReturned(loans: LoanData[]): number {
    return loans.filter(loan => loan.actual_return_date).length;
  }
  
  //Скидаємо метрики при відсутності вибраного місяця
  private resetMetrics(): void {
    this.totalLoans.set(0);
    this.averageLoanAmount.set(0);
    this.totalLoanAmount.set(0);
    this.totalInterestAccrued.set(0);
    this.totalLoansReturned.set(0);
  }
  
  //Обчислюємо топ-10 користувачів
  private calculateTopUsers(): void {
    //за кількістю отриманих кредитів
    this.calculateTopUsersByLoanCount();
    //за сумою сплачених відсотків для повернених кредитів
    this.calculateTopUsersByTotalInterest();
    //з найбільшим співвідношенням суми сплачених відсотків до суми виданих кредитів
    this.calculateTopUsersByInterestToBodyRatio();
  }
  
  private calculateTopUsersByLoanCount(): void {
    const userLoanCount = this.countLoansByUser();
    
    this.topUsersByLoanCount.set(Object.entries(userLoanCount)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10));
  }
  
  private calculateTopUsersByTotalInterest(): void {
    const userTotalInterest = this.calculateUserTotalInterest();
  
    this.topUsersByTotalInterest.set(Object.entries(userTotalInterest)
      .map(([user, totalInterest]) => ({ user, totalInterest }))
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 10));
  }
  
  private calculateTopUsersByInterestToBodyRatio(): void {
    const userInterestToBodyRatio = this.calculateUserInterestToBodyRatio();
  
    this.topUsersByInterestToBodyRatio.set(Object.entries(userInterestToBodyRatio)
      .map(([user, { totalInterest, totalBody }]) => ({
        user,
        ratio: totalBody > 0 ? totalInterest / totalBody : 0
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10));
  }
  
  private countLoansByUser(): { [key: string]: number } {
    return this.loans().reduce((acc, loan) => {
      acc[loan.user] = (acc[loan.user] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }
  
  private calculateUserTotalInterest(): { [key: string]: number } {
    return this.loans().filter(loan => loan.actual_return_date !== null)
      .reduce((acc, loan) => {
        acc[loan.user] = (acc[loan.user] || 0) + loan.percent;
        return acc;
      }, {} as { [key: string]: number });
  }
  
  private calculateUserInterestToBodyRatio(): { [key: string]: { totalInterest: number, totalBody: number } } {
    return this.loans().filter(loan => loan.actual_return_date !== null)
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
