import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LoanData {
  id: number;
  user: string;
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

  // Нові метрики
  topUsersByLoanCount: { user: string; count: number }[] = [];
  topUsersByInterestPaid: { user: string; totalInterest: number }[] = [];
  topUsersByRatio: { user: string; ratio: number }[] = [];

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

    // Обчислити нові метрики
    this.calculateTopUsers(filteredLoans);
  }

  calculateTopUsers(filteredLoans: LoanData[]): void {
    // Топ-10 користувачів за кількістю отриманих кредитів
    const userLoanCounts = filteredLoans.reduce((acc, loan) => {
      acc[loan.user] = (acc[loan.user] || 0) + 1;
      return acc;
    }, {} as { [user: string]: number });

    this.topUsersByLoanCount = Object.entries(userLoanCounts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Топ-10 користувачів за сумою сплачених відсотків
    const userInterestTotals = filteredLoans
      .filter(loan => loan.actual_return_date) // Враховуємо тільки повернені кредити
      .reduce((acc, loan) => {
        acc[loan.user] = (acc[loan.user] || 0) + loan.percent;
        return acc;
      }, {} as { [user: string]: number });

    this.topUsersByInterestPaid = Object.entries(userInterestTotals)
      .map(([user, totalInterest]) => ({ user, totalInterest }))
      .sort((a, b) => b.totalInterest - a.totalInterest)
      .slice(0, 10);

    // Топ-10 користувачів за співвідношенням суми сплачених відсотків до суми виданих кредитів
    const userRatios = filteredLoans
      .filter(loan => loan.actual_return_date) // Враховуємо тільки повернені кредити
      .reduce((acc, loan) => {
        if (!acc[loan.user]) {
          acc[loan.user] = { totalInterest: 0, totalBody: 0 };
        }
        acc[loan.user].totalInterest += loan.percent;
        acc[loan.user].totalBody += loan.body;
        return acc;
      }, {} as { [user: string]: { totalInterest: number; totalBody: number } });

    this.topUsersByRatio = Object.entries(userRatios)
      .map(([user, { totalInterest, totalBody }]) => ({
        user,
        ratio: totalBody ? totalInterest / totalBody : 0
      }))
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);
  }
}
