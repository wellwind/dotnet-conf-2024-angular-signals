import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import {
  MatCellDef,
  MatHeaderCellDef,
  MatHeaderRowDef,
  MatRowDef,
  MatTableModule,
} from '@angular/material/table';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { GitHubService } from './github.service';

@Component({
  selector: 'app-demo-01-quick-start',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSortModule,
  ],
  template: `
    <h2>GitHub Repository Search (RxJS Version)</h2>
    <mat-form-field>
      <mat-label>關鍵字</mat-label>
      <input
        matInput
        [value]="keyword$ | async"
        (input)="onKeywordChange($any($event.target).value)"
        [disabled]="loading$ | async"
      />
    </mat-form-field>
    <div
      class="progress-bar-container"
      [style.visibility]="(loading$ | async) ? 'visible' : 'hidden'"
    >
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>
    <div class="table-container">
      <table
        mat-table
        [dataSource]="(result$ | async)?.items ?? []"
        matSort
        [matSortActive]="(sortBy$ | async) ?? 'stars'"
        [matSortDirection]="(sortOrder$ | async) ?? 'desc'"
        (matSortChange)="sortData($event)"
      >
        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>名稱</th>
          <td mat-cell *matCellDef="let repo">{{ repo.name }}</td>
        </ng-container>

        <!-- Description Column -->
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>描述</th>
          <td mat-cell *matCellDef="let repo">{{ repo.description }}</td>
        </ng-container>

        <!-- Stars Column -->
        <ng-container matColumnDef="stars">
          <th
            mat-header-cell
            *matHeaderCellDef
            mat-sort-header
            [disabled]="loading$ | async"
          >
            ⭐️
          </th>
          <td mat-cell *matCellDef="let repo">{{ repo.stargazers_count }}</td>
        </ng-container>

        <tr
          mat-header-row
          *matHeaderRowDef="['name', 'description', 'stars']"
        ></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: ['name', 'description', 'stars']"
        ></tr>
      </table>
    </div>

    <div class="pagination-container">
      <button
        mat-raised-button
        [disabled]="
          (currentPage$ | async) === (firstPage$ | async) || (loading$ | async)
        "
        (click)="setCurrentPage(1)"
      >
        第一頁
      </button>

      @if ((currentPage$ | async) !== 1) {
        @let previousPage = (previousPage$ | async) ?? 0;
        <button
          mat-raised-button
          [disabled]="!(previousPage$ | async) || (loading$ | async)"
          (click)="setCurrentPage(previousPage)"
        >
          {{ previousPage }}
        </button>
      }

      <span class="page-number">{{ currentPage$ | async }}</span>

      @if ((currentPage$ | async) !== (lastPage$ | async)) {
        @let nextPage = (nextPage$ | async) ?? 0;
        <button
          mat-raised-button
          [disabled]="!(nextPage$ | async) || (loading$ | async)"
          (click)="setCurrentPage(nextPage)"
        >
          {{ nextPage }}
        </button>
      }

      @let lastPage = (lastPage$ | async) ?? 0;
      <button
        mat-raised-button
        [disabled]="
          (currentPage$ | async) === (lastPage$ | async) || (loading$ | async)
        "
        (click)="setCurrentPage(lastPage)"
      >
        最後一頁
      </button>
    </div>
  `,
  styles: `
    .pagination-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 10px;
    }

    .page-number {
      margin: 0 10px;
    }

    [mat-raised-button] {
      margin: 0 5px;
    }

    .table-container {
      position: relative;
    }
  `,
})
export default class Demo01QuickStartRxJSComponent {
  private gitHubService = inject(GitHubService);

  protected loading$ = new BehaviorSubject<boolean>(false);
  protected keyword$ = new BehaviorSubject<string>('ng');
  protected currentPage$ = new BehaviorSubject<number>(1);
  protected itemsPerPage$ = new BehaviorSubject<number>(10);
  protected sortBy$ = new BehaviorSubject<string>('stars');
  protected sortOrder$ = new BehaviorSubject<'asc' | 'desc'>('desc');

  private searchCondition$ = combineLatest({
    keyword: this.keyword$,
    currentPage: this.currentPage$,
    itemsPerPage: this.itemsPerPage$,
    sortBy: this.sortBy$,
    sortOrder: this.sortOrder$,
  }).pipe(
    debounceTime(700),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    map(({ keyword, currentPage, itemsPerPage, sortBy, sortOrder }) => ({
      q: keyword,
      page: currentPage.toString(),
      per_page: itemsPerPage.toString(),
      sort: sortBy,
      order: sortOrder,
    })),
  );

  protected result$ = this.searchCondition$.pipe(
    tap(() => this.loading$.next(true)),
    switchMap((condition) => this.gitHubService.searchRepos(condition)),
    tap(() => this.loading$.next(false)),
    shareReplay(1),
  );

  protected previousPage$ = combineLatest({
    currentPage: this.currentPage$,
    result: this.result$,
  }).pipe(map(({ currentPage }) => (currentPage > 1 ? currentPage - 1 : 1)));

  protected nextPage$ = combineLatest({
    currentPage: this.currentPage$,
    result: this.result$,
    itemsPerPage: this.itemsPerPage$,
  }).pipe(
    map(({ currentPage, result, itemsPerPage }) => {
      const totalPages = Math.ceil((result?.total_count ?? 0) / itemsPerPage);
      return currentPage < totalPages ? currentPage + 1 : totalPages;
    }),
  );

  protected lastPage$ = combineLatest({
    result: this.result$,
    itemsPerPage: this.itemsPerPage$,
  }).pipe(
    map(({ result, itemsPerPage }) =>
      Math.ceil((result?.total_count ?? 0) / itemsPerPage),
    ),
  );

  protected firstPage$ = of(1);

  protected onKeywordChange(value: string) {
    this.keyword$.next(value);
    this.currentPage$.next(1);
    this.sortBy$.next('stars');
    this.sortOrder$.next('desc');
  }

  protected sortData(event: any) {
    this.sortBy$.next(event.active);
    this.sortOrder$.next(event.direction);
    this.currentPage$.next(1);
  }

  protected setCurrentPage(page: number) {
    this.currentPage$.next(page);
  }
}
