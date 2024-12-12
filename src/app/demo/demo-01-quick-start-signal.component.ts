import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  skip,
  startWith,
  switchMap,
} from 'rxjs';
import { GitHubService } from './github.service';

@Component({
  selector: 'app-demo-01-quick-start',
  standalone: true,
  imports: [
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
    <h2>GitHub Repository Search (Signal Version)</h2>
    <mat-form-field>
      <mat-label>關鍵字</mat-label>
      <input
        matInput
        [value]="keyword()"
        (input)="onKeywordChange($any($event.target).value)"
        [disabled]="loading()"
      />
    </mat-form-field>
    <div
      class="progress-bar-container"
      [style.visibility]="loading() ? 'visible' : 'hidden'"
    >
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>
    <div class="table-container">
      <table
        mat-table
        [dataSource]="result()?.items ?? []"
        matSort
        [matSortActive]="sortBy()"
        [matSortDirection]="sortOrder()"
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
            [disabled]="loading()"
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
        [disabled]="currentPage() === firstPage() || loading()"
        (click)="currentPage.set(firstPage())"
      >
        第一頁
      </button>

      @if (currentPage() !== 1) {
        <button
          mat-raised-button
          [disabled]="!previousPage() || loading()"
          (click)="currentPage.set(previousPage())"
        >
          {{ previousPage() }}
        </button>
      }

      <span class="page-number">{{ currentPage() }}</span>

      @if (currentPage() !== lastPage()) {
        <button
          mat-raised-button
          [disabled]="!nextPage() || loading()"
          (click)="currentPage.set(nextPage())"
        >
          {{ nextPage() }}
        </button>
      }

      <button
        mat-raised-button
        [disabled]="currentPage() === lastPage() || loading()"
        (click)="currentPage.set(lastPage())"
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
export default class Demo01QuickStartSignalComponent {
  private gitHubService = inject(GitHubService);

  protected keyword = signal('ng');
  protected currentPage = signal(1);
  protected itemsPerPage = signal(10);
  protected sortBy = signal('stars');
  protected sortOrder = signal<'asc' | 'desc'>('desc');

  private searchCondition = computed(() => ({
    q: this.keyword(),
    page: this.currentPage().toString(),
    per_page: this.itemsPerPage().toString(),
    sort: this.sortBy(),
    order: this.sortOrder(),
  }));
  private searchCondition$ = toObservable(this.searchCondition).pipe(
    debounceTime(700),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  private result$ = this.searchCondition$.pipe(
    switchMap((condition) => this.gitHubService.searchRepos(condition)),
    startWith({ items: [], incomplete_results: false, total_count: 0 }),
    shareReplay(1),
  );
  protected result = toSignal(this.result$);

  // protected loading = signal(false);

  // _loadingEffect = effect(() => {
  //   const _ = this.searchCondition();
  //   this.loading.set(true);
  // }, { allowSignalWrites: true });

  // _loadedEffect = effect(() => {
  //   const _ = this.result();
  //   this.loading.set(false);
  // }, { allowSignalWrites: true });

  private loading$ = this.searchCondition$.pipe(
    switchMap(() =>
      this.result$.pipe(
        skip(1),
        map(() => false),
        startWith(true),
      ),
    ),
  );
  protected loading = toSignal(this.loading$, { initialValue: false });

  protected previousPage = computed(() => {
    return this.currentPage() > 1 ? this.currentPage() - 1 : 1;
  });

  protected nextPage = computed(() => {
    const totalPages = Math.ceil(
      (this.result()?.total_count ?? 0) / this.itemsPerPage(),
    );
    return this.currentPage() < totalPages
      ? this.currentPage() + 1
      : totalPages;
  });

  protected lastPage = computed(() => {
    return Math.ceil((this.result()?.total_count ?? 0) / this.itemsPerPage());
  });

  protected firstPage = signal(1).asReadonly();

  protected onKeywordChange(value: string) {
    this.keyword.set(value);

    // reset to default
    this.currentPage.set(1);
    this.sortBy.set('stars');
    this.sortOrder.set('desc');
  }

  protected sortData(event: any) {
    this.sortBy.set(event.active);
    this.sortOrder.set(event.direction);
    this.currentPage.set(1);
  }
}
