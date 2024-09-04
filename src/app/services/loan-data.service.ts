import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoanData } from '../models/loan-data.model';

@Injectable()
export class LoanDataService {
    private apiUrl = 'https://raw.githubusercontent.com/LightOfTheSun/front-end-coding-task-db/master/db.json';
    private loans$ = new BehaviorSubject<LoanData[]>([]); // Initialize with an empty array
  
    constructor(private http: HttpClient) {}
  
    loadLoans(): Observable<LoanData[]> {
      if (this.loans$.getValue().length === 0) { // Check if array is empty
        this.http.get<LoanData[]>(this.apiUrl).pipe(
          tap((data) => this.loans$.next(data))
        ).subscribe();
      }
      return this.loans$.asObservable(); // Returns Observable<LoanData[]>
    }
}