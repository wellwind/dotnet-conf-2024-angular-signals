import { Component, computed, effect, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  selector: 'app-demo-02-untracked',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatDivider],
  template: `
    @for (user of users(); track user.id) {
      <button
        mat-raised-button
        [color]="selectedUserId() === user.id ? 'primary' : ''"
        (click)="selectedUserId.set(user.id)"
      >
        {{ user.name }}
      </button>
    }

    <mat-divider></mat-divider>

    <p>User Id: {{ selectedUserId() }}</p>
    <div>
      <mat-form-field>
        <mat-label>User Name</mat-label>
        <input
          matInput
          [value]="selectedUserName()"
          (input)="updateUserName($event)"
        />
      </mat-form-field>
    </div>
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
export default class Demo02UntrackedComponent {
  protected selectedUserId = signal(1);

  protected users = signal([
    { id: 1, name: 'John', age: 20 },
    { id: 2, name: 'Jane', age: 21 },
    { id: 3, name: 'Doe', age: 22 },
  ]);

  protected selectedUserName = computed(() => {
    return this.users().find((user) => user.id === this.selectedUserId())?.name;
  });

  protected updateUserName(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.users.update((users) =>
      users.map((user) =>
        user.id === this.selectedUserId()
          ? { ...user, name: inputElement.value }
          : user,
      ),
    );
  }

  private _ = effect(() => {
    // 只有在 selectedUserId 改變時才紀錄
    const userId = this.selectedUserId();
    const userName = untracked(() => this.selectedUserName());

    console.log(
      `userId: ${userId}; userName: ${userName}`,
    );
  });
}
