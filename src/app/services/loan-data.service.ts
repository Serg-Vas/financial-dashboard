import { Injectable, inject, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoanData } from '../models/loan-data.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class LoanDataService {
    private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';
    private loans$ = new BehaviorSubject<LoanData[]>([]);
  
    private destroyRef = inject(DestroyRef);

    constructor(private http: HttpClient) {}
  
    loadLoans(): Observable<LoanData[]> {
      if (this.loans$.getValue().length === 0) {
        this.http.get<LoanData[]>(this.apiUrl).pipe(
          tap((data) => this.loans$.next(data)),
          takeUntilDestroyed(this.destroyRef)
        ).subscribe();
      }
      return this.loans$.asObservable();
    }
}