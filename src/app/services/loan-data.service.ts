import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoanData } from '../models/loan-data.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class LoanDataService {
    private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';
    private loans$ = new BehaviorSubject<LoanData[]>([]); // Initialize with an empty array
  
    private destroy$ = new Subject<void>();

    constructor(private http: HttpClient) {}
  
    loadLoans(): Observable<LoanData[]> {
      if (this.loans$.getValue().length === 0) { // Check if array is empty
        this.http.get<LoanData[]>(this.apiUrl).pipe(
          tap((data) => this.loans$.next(data))
        ).pipe(takeUntil(this.destroy$)).subscribe();
      }
      return this.loans$.asObservable(); // Returns Observable<LoanData[]>
    }

    ngOnDestroy(): void {
      console.log('unsubscribe 3 called');
      this.destroy$.next();
      this.destroy$.complete();
    }
}