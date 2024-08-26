import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

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

  //Для збереження поточного стану
  issuanceDateFrom: string | null = null;
  issuanceDateTo: string | null = null;
  returnDateFrom: string | null = null;
  returnDateTo: string | null = null;
  showOverdueLoans: boolean = false;

  pageSize$ = new BehaviorSubject<number>(10); // Кількість кредитів на сторінку
  currentPage$ = new BehaviorSubject<number>(1); // Поточна сторінка

  //Оброблювані дані
  private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';

  constructor(private http: HttpClient) {}

  //Завантаження даних та фільтрація при завантаженні сторінки
  ngOnInit(): void {
    this.http.get<LoanData[]>(this.apiUrl).subscribe(data => {
      this.loans$.next(data);
      this.filterLoans();
    });

    // Список Observable для фільтрації і пагінації
    this.pageSize$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.currentPage$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.issuanceDateFrom$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.issuanceDateTo$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.returnDateFrom$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.returnDateTo$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();

    this.showOverdueLoans$.pipe(
      switchMap(() => this.filterLoans())
    ).subscribe();
  }

  //Фільтрація
  filterLoans(): BehaviorSubject<LoanData[]> {
    const filteredLoans = this.loans$.getValue().filter(loan => {
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
    });

    this.applyPagination(filteredLoans);
    return this.filteredLoans$;
  }

  //Очищення фільтрів
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

    this.filterLoans();
  }

  //Пагінація, розбиваючи дані на сторінки відповідно до кількості кредитів для сторінки та номера сторінки
  applyPagination(filteredLoans: LoanData[]): void {
    const pageSize = this.pageSize$.getValue();
    const currentPage = this.currentPage$.getValue();
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedLoans = filteredLoans.slice(startIndex, startIndex + pageSize);
    this.filteredLoans$.next(paginatedLoans);
  }

  //Оновлюємо поточну сторінку при зміні номера сторінки
  onPageChange(page: number): void {
    this.currentPage$.next(page);
  }

  //Скидаємо поточну сторінку до першої після зміни кількості кредитів для сторінки
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const size = parseInt(target.value, 10);
    this.pageSize$.next(size);
    this.currentPage$.next(1);
  }


  // Методи для обробки змін
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
