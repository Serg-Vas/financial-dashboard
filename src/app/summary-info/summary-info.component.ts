import { Component, OnInit, signal } from '@angular/core';
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
  selector: 'app-summary-info',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.scss']
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

  // Обробляємі дані
  private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';

  constructor(private http: HttpClient) {}

  // Ініціалізація
  ngOnInit(): void {
    this.http.get<LoanData[]>(this.apiUrl).subscribe(data => {
      this.loans.set(data);
      this.calculateMetrics();
    });
  }

  calculateMetrics(): void {
    const month = this.selectedMonth();

    if (month) {
      const [selectedYear, selectedMonth] = month.split('-').map(Number);

      const filteredLoans = this.loans().filter(loan => {
        const issuanceDate = new Date(loan.issuance_date);
        return issuanceDate.getFullYear() === selectedYear && issuanceDate.getMonth() + 1 === selectedMonth;
      });

      // Обчислити метрики
      this.totalLoans.set(filteredLoans.length);
      this.totalLoanAmount.set(filteredLoans.reduce((sum, loan) => sum + loan.body, 0));
      this.totalInterestAccrued.set(filteredLoans.reduce((sum, loan) => sum + loan.percent, 0));
      this.averageLoanAmount.set(this.totalLoans() ? this.totalLoanAmount() / this.totalLoans() : 0);
      this.totalLoansReturned.set(filteredLoans.filter(loan => loan.actual_return_date).length);
    } else {
      // Якщо місяць не вибрано, скидаємо метрики
      this.totalLoans.set(0);
      this.averageLoanAmount.set(0);
      this.totalLoanAmount.set(0);
      this.totalInterestAccrued.set(0);
      this.totalLoansReturned.set(0);

      // Топ-10 користувачів за кількістю отриманих кредитів
      const userLoanCount = this.loans().reduce((acc, loan) => {
        acc[loan.user] = (acc[loan.user] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      this.topUsersByLoanCount.set(Object.entries(userLoanCount)
        .map(([user, count]) => ({ user, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10));

      // Топ-10 користувачів за сумою сплачених відсотків для повернених кредитів
      const userTotalInterest = this.loans()
        .filter(loan => loan.actual_return_date !== null)
        .reduce((acc, loan) => {
          acc[loan.user] = (acc[loan.user] || 0) + loan.percent;
          return acc;
        }, {} as { [key: string]: number });

      this.topUsersByTotalInterest.set(Object.entries(userTotalInterest)
        .map(([user, totalInterest]) => ({ user, totalInterest }))
        .sort((a, b) => b.totalInterest - a.totalInterest)
        .slice(0, 10));

      // Топ-10 користувачів з найбільшим співвідношенням суми сплачених відсотків до суми виданих кредитів
      const userInterestToBodyRatio = this.loans()
        .filter(loan => loan.actual_return_date !== null)
        .reduce((acc, loan) => {
          if (!acc[loan.user]) {
            acc[loan.user] = { totalInterest: 0, totalBody: 0 };
          }
          acc[loan.user].totalInterest += loan.percent;
          acc[loan.user].totalBody += loan.body;
          return acc;
        }, {} as { [key: string]: { totalInterest: number, totalBody: number } });

      this.topUsersByInterestToBodyRatio.set(Object.entries(userInterestToBodyRatio)
        .map(([user, { totalInterest, totalBody }]) => ({
          user,
          ratio: totalBody > 0 ? totalInterest / totalBody : 0
        }))
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 10));
    }
  }
}
