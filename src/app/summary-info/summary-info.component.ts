import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';
import { MetricsService } from '../services/metrics.service';
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

  // Metrics
  totalLoans = signal<number>(0);
  averageLoanAmount = signal<number>(0);
  totalLoanAmount = signal<number>(0);
  totalInterestAccrued = signal<number>(0);
  totalLoansReturned = signal<number>(0);

  topUsersByLoanCount = signal<{ user: string; count: number }[]>([]);
  topUsersByTotalInterest = signal<{ user: string; totalInterest: number }[]>([]);
  topUsersByInterestToBodyRatio = signal<{ user: string; ratio: number }[]>([]);

  private destroyRef = inject(DestroyRef);

  constructor(
    private loanDataService: LoanDataService,
    private metricsService: MetricsService
  ) {}

  ngOnInit(): void {
    this.loanDataService.loadLoans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.loans.set(data);
      this.calculateMetrics();
    });
  }

  calculateMetrics(): void {
    const month = this.selectedMonth();
    const loans = this.loans();

    if (month) {
      this.calculateMonthlyMetrics(month);
    } else {
      this.resetMetrics();
      this.calculateTopUsers(loans);
    }
  }

  private calculateMonthlyMetrics(month: string): void {
    const [selectedYear, selectedMonth] = month.split('-').map(Number);
    const loans = this.loans();

    const filteredLoans = this.metricsService.filterLoansByMonth(loans, selectedYear, selectedMonth);
  
    this.totalLoans.set(filteredLoans.length);
    this.totalLoanAmount.set(this.metricsService.calculateTotal(filteredLoans, 'body'));
    this.totalInterestAccrued.set(this.metricsService.calculateTotal(filteredLoans, 'percent'));
    this.averageLoanAmount.set(this.metricsService.calculateAverageLoanAmount(this.totalLoans(), this.totalLoanAmount()));
    this.totalLoansReturned.set(this.metricsService.calculateLoansReturned(filteredLoans));
  }

  private resetMetrics(): void {
    this.totalLoans.set(0);
    this.averageLoanAmount.set(0);
    this.totalLoanAmount.set(0);
    this.totalInterestAccrued.set(0);
    this.totalLoansReturned.set(0);
  }

  private calculateTopUsers(loans: LoanData[]): void {
    this.topUsersByLoanCount.set(this.metricsService.calculateTopUsersByLoanCount(loans));
    this.topUsersByTotalInterest.set(this.metricsService.calculateTopUsersByTotalInterest(loans));
    this.topUsersByInterestToBodyRatio.set(this.metricsService.calculateTopUsersByInterestToBodyRatio(loans));
  }
}
