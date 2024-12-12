import { HttpClient } from '@angular/common/http';
import {
  Component,
  effect,
  inject,
  input,
  QueryList,
  signal,
  viewChildren,
  ViewChildren,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { map, startWith, switchMap } from 'rxjs';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-demo-05-todo-item',
  standalone: true,
  template: `
    <div class="todo-item" [class.completed]="todo().completed">
      <h3>{{ todo().title }}</h3>
      <p>{{ todo().completed ? '已完成' : '未完成' }}</p>
    </div>
  `,
  styles: `
    .todo-item {
      padding: 10px;
      margin: 10px 0;
    }

    .completed {
      text-decoration: line-through;
    }
  `,
})
export class TodoItemComponent {
  todo = input.required<Todo>();
}

@Component({
  selector: 'app-demo-05-signal-queries',
  standalone: true,
  imports: [
    TodoItemComponent,
    MatButtonModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  template: `
    <div class="button-container">
      <button
        mat-raised-button
        (click)="page.set(1)"
        [color]="page() === 1 ? 'primary' : ''"
      >
        第一頁
      </button>
      <button
        mat-raised-button
        (click)="page.set(2)"
        [color]="page() === 2 ? 'primary' : ''"
      >
        第二頁
      </button>
      <button
        mat-raised-button
        (click)="page.set(3)"
        [color]="page() === 3 ? 'primary' : ''"
      >
        第三頁
      </button>
    </div>

    <mat-divider></mat-divider>

    <mat-progress-bar
      mode="indeterminate"
      [style.visibility]="loading() ? 'visible' : 'hidden'"
    ></mat-progress-bar>

    @for (todo of todoItems(); track todo.id) {
      <app-demo-05-todo-item [todo]="todo"></app-demo-05-todo-item>
    }
  `,
  styles: `
    button {
      margin: 0 5px;
    }

    .mat-primary {
      --mdc-protected-button-container-color: #0078d4;
      --mdc-protected-button-label-text-color: #ffffff;
    }

    .mat-divider {
      margin: 10px 0;
    }
  `,
})
export default class Demo05SignalQueriesComponent {
  private http = inject(HttpClient);

  @ViewChildren(TodoItemComponent) todoItemsDecorator!: QueryList<
    Array<TodoItemComponent>
  >;
  todoItemsSignalQuery = viewChildren(TodoItemComponent);

  protected page = signal(1);
  private page$ = toObservable(this.page);
  private todoItems$ = this.page$.pipe(
    switchMap((page) =>
      this.http.get<Array<Todo>>(
        `https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=10`,
      ),
    ),
  );
  protected todoItems = toSignal(this.todoItems$);

  private loading$ = this.page$.pipe(
    switchMap(() =>
      this.todoItems$.pipe(
        map(() => false),
        startWith(true),
      ),
    ),
  );
  protected loading = toSignal(this.loading$, { initialValue: false });

  constructor() {
    effect(() => {
      console.log('todoItemsSignalQuery', this.todoItemsSignalQuery());
    });
  }

  ngAfterViewInit() {
    this.todoItemsDecorator.changes.subscribe(() => {
      console.log('todoItemsDecorator', this.todoItemsDecorator.toArray());
    });
  }
}
