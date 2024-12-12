import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  inject,
  Injector,
  signal,
  Signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';

interface TodoItem {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const toLazySignal = <T>(source: Observable<T>) => {
  const injector = inject(Injector);
  let s: Signal<T | undefined>;
  return computed(() => {
    if (!s) {
      s = untracked(() => toSignal(source, { injector }));
    }
    return s();
  });
};

@Component({
  selector: 'app-demo-03-lazy-signal',
  standalone: true,
  imports: [MatButtonModule, MatListModule],
  template: `
    <button mat-raised-button (click)="display.set(!display())">
      {{ display() ? '隱藏' : '顯示' }}
    </button>

    @if (display()) {
      <mat-list>
        <mat-list-item>
          <span matListItemTitle>ID: {{ data()?.id }}</span>
        </mat-list-item>
        <mat-list-item>
          <span matListItemTitle>標題: {{ data()?.title }}</span>
        </mat-list-item>
        <mat-list-item>
          <span matListItemTitle>
            完成狀態: {{ data()?.completed ? '已完成' : '未完成' }}
          </span>
        </mat-list-item>
      </mat-list>
    }
  `,
  styles: ``,
})
export default class Demo03LazySignalComponent {
  private http = inject(HttpClient);
  protected display = signal(false);

  private data$ = this.http.get<TodoItem>(
    'https://jsonplaceholder.typicode.com/todos/1',
  );
  // protected data = toSignal(this.data$);
  protected data = toLazySignal(this.data$);
}
