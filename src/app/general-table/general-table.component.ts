import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanData } from '../models/loan-data.model';
import { LoanDataService } from '../services/loan-data.service';

@Component({
  selector: 'app-general-table',
  standalone: true,
  imports: [CommonModule, FormsModule], // Include FormsModule here
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

  constructor(private loanDataService: LoanDataService) {}

  ngOnInit(): void {
    this.loadLoans();
  }

  loadLoans(): void {
    this.loanDataService.loadLoans().subscribe(data => {
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
    console.log('1');

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
    this.currentPage.set(page);
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.pageSize.set(Number(target.value));
    this.currentPage.set(1); // Reset to the first page when page size changes
  }
}