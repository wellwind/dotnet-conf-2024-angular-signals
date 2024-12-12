import {
  Component,
  computed,
  inject,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
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
  lastValueFrom,
  shareReplay,
} from 'rxjs';
import { GitHubService } from './github.service';

@Component({
  selector: 'app-demo-01-quick-start-new',
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
    <h2>GitHub Repository Search (Signal Version with Angular 19 New API)</h2>
    <mat-form-field>
      <mat-label>關鍵字</mat-label>
      <input
        matInput
        [value]="keyword()"
        (input)="onKeywordChange($any($event.target).value)"
        [disabled]="loading"
      />
    </mat-form-field>
    <div
      class="progress-bar-container"
      [style.visibility]="loading ? 'visible' : 'hidden'"
    >
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    </div>
    <div class="table-container">
      <table
        mat-table
        [dataSource]="result.value()?.items ?? []"
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
            [disabled]="loading"
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
        [disabled]="currentPage() === firstPage() || loading"
        (click)="currentPage.set(firstPage())"
      >
        第一頁
      </button>

      @if (currentPage() !== 1) {
        <button
          mat-raised-button
          [disabled]="!previousPage() || loading"
          (click)="currentPage.set(previousPage())"
        >
          {{ previousPage() }}
        </button>
      }

      <span class="page-number">{{ currentPage() }}</span>

      @if (currentPage() !== lastPage()) {
        <button
          mat-raised-button
          [disabled]="!nextPage() || loading"
          (click)="currentPage.set(nextPage())"
        >
          {{ nextPage() }}
        </button>
      }

      <button
        mat-raised-button
        [disabled]="currentPage() === lastPage() || loading"
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

  protected itemsPerPage = signal(10);

  protected keyword = signal('ng');

  protected pageNumber = linkedSignal({
    source: () => this.keyword(),
    computation: (source, prev) => {
      if (prev?.source !== source) {
        return 1;
      }
      return prev.value ?? 1;
    },
  });

  updatePage(num: number) {
    this.pageNumber.set(num);
  }

  protected sortBy = linkedSignal<string, string>({
    source: () => this.keyword(),
    computation: (source, prev) => {
      if (prev?.source !== source) {
        return 'stars';
      }
      return prev.value ?? 'stars';
    },
  });

  protected sortOrder = linkedSignal<string, 'asc' | 'desc'>({
    source: () => this.keyword(),
    computation: (source, prev) => {
      if (prev?.source !== source) {
        return 'desc';
      }
      return prev.value ?? 'desc';
    },
  });

  protected keywordAndSort = computed(() => ({
    keyword: this.keyword(),
    sort: this.sortBy(),
  }));

  protected currentPage = linkedSignal<
    { keyword: string; sort: string },
    number
  >({
    source: () => this.keywordAndSort(),
    computation: (source, prev) => {
      if (
        prev?.source.keyword !== source.keyword ||
        prev?.source.sort !== source.sort
      ) {
        return 1;
      }
      return prev.value ?? 1;
    },
  });

  private searchCondition = computed(() => ({
    q: this.keyword(),
    page: this.currentPage().toString(),
    per_page: this.itemsPerPage().toString(),
    sort: this.sortBy(),
    order: this.sortOrder(),
  }));

  private searchConditionWithDebounce$ = toObservable(
    this.searchCondition,
  ).pipe(
    debounceTime(700),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
    shareReplay(1),
  );

  private searchConditionWithDebounce = toSignal(
    this.searchConditionWithDebounce$,
    { initialValue: this.searchCondition() },
  );

  protected result = resource({
    request: () => this.searchConditionWithDebounce(),
    loader: (condition) =>
      lastValueFrom(this.gitHubService.searchRepos(condition.request)),
  });

  get loading() {
    return this.result.isLoading();
  }

  protected previousPage = computed(() => {
    return this.currentPage() > 1 ? this.currentPage() - 1 : 1;
  });

  protected nextPage = computed(() => {
    const totalPages = Math.ceil(
      (this.result.value()?.total_count ?? 0) / this.itemsPerPage(),
    );
    return this.currentPage() < totalPages
      ? this.currentPage() + 1
      : totalPages;
  });

  protected lastPage = computed(() => {
    return Math.ceil(
      (this.result.value()?.total_count ?? 0) / this.itemsPerPage(),
    );
  });

  protected firstPage = signal(1).asReadonly();

  protected onKeywordChange(value: string) {
    this.keyword.set(value);

    // reset to default
    // 因為 linkedSignal，不再需要手動更新回預設值
    // this.currentPage.set(1);
    // this.sortBy.set('stars');
    // this.sortOrder.set('desc');
  }

  protected sortData(event: any) {
    this.sortBy.set(event.active);
    this.sortOrder.set(event.direction);
    this.currentPage.set(1);
  }
}
