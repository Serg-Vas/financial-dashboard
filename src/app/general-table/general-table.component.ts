import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FilterService } from '../services/filtration.service'

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-table.component.html',
  styleUrls: ['./general-table.component.scss'],
  providers: [LoanDataService, FilterService]
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

  constructor(private loanDataService: LoanDataService, private FilterService: FilterService) {}

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
    const filters = {
      issuanceDateFrom: this.issuanceDateFrom(),
      issuanceDateTo: this.issuanceDateTo(),
      returnDateFrom: this.returnDateFrom(),
      returnDateTo: this.returnDateTo(),
      showOverdueLoans: this.showOverdueLoans()
    };

    const filtered = this.FilterService.filterLoans(this.loans(), filters);
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