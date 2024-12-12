import { HttpClient } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import {
  outputFromObservable,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { switchMap } from 'rxjs';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-demo-04-todo-item',
  standalone: true,
  imports: [MatListModule],
  template: `
    @if (todoItem(); as item) {
      <mat-list>
        <mat-list-item>
          <span matListItemTitle>ID: {{ item.id }}</span>
        </mat-list-item>
        <mat-list-item>
          <span matListItemTitle>標題: {{ item.title }}</span>
        </mat-list-item>
        <mat-list-item>
          <span matListItemTitle>
            完成狀態: {{ item.completed ? '已完成' : '未完成' }}
          </span>
        </mat-list-item>
      </mat-list>
    }
  `,
})
export class TodoItemComponent {
  private http = inject(HttpClient);

  public todoId = input.required<number>();
  protected todoItem$ = toObservable(this.todoId).pipe(
    switchMap((id) =>
      this.http.get<Todo>(`https://jsonplaceholder.typicode.com/todos/${id}`),
    ),
  );
  protected todoItem = toSignal(this.todoItem$);
  public todoLoaded = outputFromObservable(this.todoItem$);
}

@Component({
  selector: 'app-demo-04-output-from-observable',
  standalone: true,
  imports: [TodoItemComponent, MatButtonModule, MatDividerModule],
  template: `
    <button
      mat-raised-button
      (click)="todoId.set(1)"
      [color]="todoId() === 1 ? 'primary' : ''"
    >
      Todo 1
    </button>
    <button
      mat-raised-button
      (click)="todoId.set(2)"
      [color]="todoId() === 2 ? 'primary' : ''"
    >
      Todo 2
    </button>
    <button
      mat-raised-button
      (click)="todoId.set(3)"
      [color]="todoId() === 3 ? 'primary' : ''"
    >
      Todo 3
    </button>

    <mat-divider></mat-divider>

    <app-demo-04-todo-item [todoId]="todoId()" (todoLoaded)="todoLoaded($event)"></app-demo-04-todo-item>
  `,
  styles: `
    button {
      margin: 0 5px;
    }

    .mat-divider {
      margin: 10px 0;
    }

    .mat-primary {
      --mdc-protected-button-container-color: #0078d4;
      --mdc-protected-button-label-text-color: #ffffff;
    }
  `,
})
export default class Demo04OutputFromObservableComponent {
  protected todoId = signal(1);

  protected todoLoaded(todo: Todo) {
    console.log(todo);
  }
}
