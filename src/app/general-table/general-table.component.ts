import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-table.component.html',
  styleUrls: ['./general-table.component.scss'],
  providers: [LoanDataService]
})
export class GeneralTableComponent implements OnInit {
  loans = signal<LoanData[]>([]);
  filteredLoans = signal<LoanData[]>([]);
  issuanceDateFrom = signal<string | null>(null);
  issuanceDateTo = signal<string | null>(null);
  returnDateFrom = signal<string | null>(null);
  returnDateTo = signal<string | null>(null);
  showOverdueLoans = signal<boolean>(false);
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  private destroy$ = new Subject<void>();

  constructor(private loanDataService: LoanDataService) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loanDataService.loadLoans()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.loans.set(data);
        this.filterLoans();
      });
  }

  filterLoans(): void {
    let filtered = this.loans();

    // Apply filters
    if (this.issuanceDateFrom()) {
      filtered = filtered.filter(loan => new Date(loan.issuance_date) >= new Date(this.issuanceDateFrom()!));
    }
    if (this.issuanceDateTo()) {
      filtered = filtered.filter(loan => new Date(loan.issuance_date) <= new Date(this.issuanceDateTo()!));
    }
    if (this.returnDateFrom()) {
      filtered = filtered.filter(loan => new Date(loan.return_date) >= new Date(this.returnDateFrom()!));
    }
    if (this.returnDateTo()) {
      filtered = filtered.filter(loan => new Date(loan.return_date) <= new Date(this.returnDateTo()!));
    }
    if (this.showOverdueLoans()) {
      filtered = filtered.filter(loan => !loan.actual_return_date && new Date(loan.return_date) < new Date());
    }
    console.log('filter function called');

    this.applyPagination(filtered);
  }

  clearFilters(): void {
    this.issuanceDateFrom.set(null);
    this.issuanceDateTo.set(null);
    this.returnDateFrom.set(null);
    this.returnDateTo.set(null);
    this.showOverdueLoans.set(false);
    this.filterLoans();
  }
  
  applyPagination(filteredLoans: LoanData[]): void {
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedLoans = filteredLoans.slice(startIndex, startIndex + pageSize);
    this.filteredLoans.set(paginatedLoans);
  }
  
  onPageChange(page: number): void {
    console.log('Changing page to:', page);
    this.currentPage.set(page);
    this.filterLoans();
  }
  
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    console.log('Changing page size to:', target.value);
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1);
    this.filterLoans();
  }

  ngOnDestroy(): void {
    console.log('unsubscribe 1 called');
    this.destroy$.next();
    this.destroy$.complete();
  }
}