import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LoanData {
  id: number;
  issuance_date: string;
  actual_return_date: string | null;
  return_date: string;
  body: number;
  percent: number;
}

@Component({
  selector: 'app-summary-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss']
})
export class SummaryInfoComponent implements OnInit {
  loans: LoanData[] = [];
  selectedMonth: string = ''; // формат: 'yyyy-MM'

  // Метрики
  totalLoans: number = 0;
  averageLoanAmount: number = 0;
  totalLoanAmount: number = 0;
  totalInterestAccrued: number = 0;
  totalLoansReturned: number = 0;

  private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<LoanData[]>(this.apiUrl).subscribe(data => {
      this.loans = data;
      this.calculateMetrics(); // Ініціальна обробка
    });
  }

  calculateMetrics(): void {
    if (!this.selectedMonth) return;

    // Обнулити значення метрик
    this.totalLoans = 0;
    this.averageLoanAmount = 0;
    this.totalLoanAmount = 0;
    this.totalInterestAccrued = 0;
    this.totalLoansReturned = 0;

    // Фільтрувати кредити за вибраний місяць
    const selectedYear = parseInt(this.selectedMonth.split('-')[0], 10);
    const selectedMonth = parseInt(this.selectedMonth.split('-')[1], 10);

    const filteredLoans = this.loans.filter(loan => {
      const issuanceDate = new Date(loan.issuance_date);
      return issuanceDate.getFullYear() === selectedYear && issuanceDate.getMonth() + 1 === selectedMonth;
    });

    // Обчислити метрики
    this.totalLoans = filteredLoans.length;
    this.totalLoanAmount = filteredLoans.reduce((sum, loan) => sum + loan.body, 0);
    this.totalInterestAccrued = filteredLoans.reduce((sum, loan) => sum + loan.percent, 0);
    this.averageLoanAmount = this.totalLoans ? this.totalLoanAmount / this.totalLoans : 0;
    this.totalLoansReturned = filteredLoans.filter(loan => loan.actual_return_date).length;
  }
}