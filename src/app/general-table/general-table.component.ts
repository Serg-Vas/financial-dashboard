import { Component, OnInit, signal, inject, DestroyRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterService } from '../services/filtration.service';
import { PaginationService } from '../services/pagination.service';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general-table.component.html',
  styleUrls: ['./general-table.component.scss'],
  providers: [LoanDataService, FilterService, PaginationService]
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

  loading = false;

  private destroyRef = inject(DestroyRef);
  private paginationService = inject(PaginationService);
  
  constructor(private loanDataService: LoanDataService, private FilterService: FilterService) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loading = true;
    this.loanDataService.loadLoans().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.loans.set(data);
      this.filterLoans();
      this.loading = false;
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
    const paginatedLoans = this.paginationService.applyPagination(filteredLoans, this.currentPage(), this.pageSize());
    this.filteredLoans.set(paginatedLoans);
  }
  
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.filterLoans();
  }
  
  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1);
    this.filterLoans();
  }
}