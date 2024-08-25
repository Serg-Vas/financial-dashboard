import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface LoanData {
  id: number;
  user: string;
  issuance_date: string;
  return_date: string;
  actual_return_date: string | null;
  body: number;
  percent: number;
}

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './general-table.component.html',
  styleUrls: ['./general-table.component.scss']
})
export class GeneralTableComponent implements OnInit {
  loans$ = new BehaviorSubject<LoanData[]>([]);
  filteredLoans$ = new BehaviorSubject<LoanData[]>([]);
  
  issuanceDateFrom$ = new BehaviorSubject<string | null>(null);
  issuanceDateTo$ = new BehaviorSubject<string | null>(null);
  returnDateFrom$ = new BehaviorSubject<string | null>(null);
  returnDateTo$ = new BehaviorSubject<string | null>(null);
  showOverdueLoans$ = new BehaviorSubject<boolean>(false);

  issuanceDateFrom: string | null = null;
  issuanceDateTo: string | null = null;
  returnDateFrom: string | null = null;
  returnDateTo: string | null = null;
  showOverdueLoans: boolean = false;

  pageSize: number = 10; // Кількість кредитів на сторінку
  currentPage: number = 1; // Поточна сторінка

  private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<LoanData[]>(this.apiUrl).subscribe(data => {
      this.loans$.next(data);
      this.filterLoans(); // Фільтруємо дані одразу після завантаження
    });

    this.issuanceDateFrom$.subscribe(() => this.filterLoans());
    this.issuanceDateTo$.subscribe(() => this.filterLoans());
    this.returnDateFrom$.subscribe(() => this.filterLoans());
    this.returnDateTo$.subscribe(() => this.filterLoans());
    this.showOverdueLoans$.subscribe(() => this.filterLoans());
  }

  filterLoans(): void {
    this.filteredLoans$.next(
      this.loans$.getValue().filter(loan => {
        const issuanceDate = new Date(loan.issuance_date);
        const actualReturnDate = loan.actual_return_date ? new Date(loan.actual_return_date) : null;
        const returnDate = new Date(loan.return_date);
        const today = new Date();

        let isValid = true;

        if (this.issuanceDateFrom) {
          isValid = isValid && issuanceDate >= new Date(this.issuanceDateFrom);
        }

        if (this.issuanceDateTo) {
          isValid = isValid && issuanceDate <= new Date(this.issuanceDateTo);
        }

        if (this.returnDateFrom) {
          isValid = isValid && returnDate >= new Date(this.returnDateFrom);
        }

        if (this.returnDateTo) {
          isValid = isValid && returnDate <= new Date(this.returnDateTo);
        }

        if (this.showOverdueLoans) {
          isValid = isValid && ((actualReturnDate && actualReturnDate > returnDate) || (!actualReturnDate && returnDate < today));
        }

        return isValid;
      })
    );

    this.applyPagination(); // Застосування пагінації
  }

  applyPagination(): void {
    const filteredLoans = this.filteredLoans$.getValue();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedLoans = filteredLoans.slice(startIndex, endIndex);
    this.filteredLoans$.next(paginatedLoans);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination(); // Оновлення відображення кредитів на новій сторінці
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 1; // Повертаємося на першу сторінку
    this.applyPagination(); // Оновлення відображення кредитів з новим розміром сторінки
  }

  clearFilters(): void {
    this.issuanceDateFrom = null;
    this.issuanceDateTo = null;
    this.returnDateFrom = null;
    this.returnDateTo = null;
    this.showOverdueLoans = false;

    this.issuanceDateFrom$.next(null);
    this.issuanceDateTo$.next(null);
    this.returnDateFrom$.next(null);
    this.returnDateTo$.next(null);
    this.showOverdueLoans$.next(false);

    this.filterLoans(); // Застосування фільтрів після скидання
  }

  // Методи для обробки змін у формі
  onIssuanceDateFromChange(): void {
    this.issuanceDateFrom$.next(this.issuanceDateFrom);
  }

  onIssuanceDateToChange(): void {
    this.issuanceDateTo$.next(this.issuanceDateTo);
  }

  onReturnDateFromChange(): void {
    this.returnDateFrom$.next(this.returnDateFrom);
  }

  onReturnDateToChange(): void {
    this.returnDateTo$.next(this.returnDateTo);
  }

  onShowOverdueLoansChange(): void {
    this.showOverdueLoans$.next(this.showOverdueLoans);
  }
}
