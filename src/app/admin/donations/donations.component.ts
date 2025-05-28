import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss']
})
export class DonationsComponent implements OnInit {
  goals: any[] = [];
  apiUrl = 'https://kkp-api.ruslan.page/api';

  isAddModalOpen = false;
  newGoal = {
    name: '',
    description: '',
    need_amount: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    const token = localStorage.getItem('access_token') || '';
    this.http.get<any>(`${this.apiUrl}/donations`, {
      headers: { 'x-token': token }
    }).subscribe({
      next: res => {
        this.goals = res.result.map((g: any) => ({
          ...g,
          created_at: new Date(g.created_at * 1000).toLocaleString('uk-UA', {
            dateStyle: 'short',
            timeStyle: 'short'
          }),
          ended_at: g.ended_at
            ? new Date(g.ended_at * 1000).toLocaleString('uk-UA', {
                dateStyle: 'short',
                timeStyle: 'short'
              })
            : null
        }));
      },
      error: err => console.error('Не вдалося отримати цілі:', err)
    });
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  cancelAdd(): void {
    this.isAddModalOpen = false;
  }

  createGoal(): void {
    const token = localStorage.getItem('access_token') || '';
    this.http.post(`${this.apiUrl}/admin/donations`, this.newGoal, {
      headers: {
        'x-token': token,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: () => {
        this.isAddModalOpen = false;
        this.newGoal = { name: '', description: '', need_amount: 0 };
        this.loadGoals();
      },
      error: err => console.error('Помилка створення цілі:', err)
    });
  }

  selectedGoalDonations: any[] = [];
selectedGoalName: string = '';
isDonationsModalOpen = false;

viewDonations(goal: any): void {
  const token = localStorage.getItem('access_token') || '';
  this.http.get<any>(`${this.apiUrl}/donations/${goal.id}/donations`, {
    headers: { 'x-token': token }
  }).subscribe({
    next: res => {
      this.selectedGoalName = goal.name;
      this.selectedGoalDonations = res.result.map((d: any) => ({
        ...d,
        date: new Date(d.date * 1000).toLocaleString('uk-UA', {
          dateStyle: 'short',
          timeStyle: 'short'
        })
      }));
      this.isDonationsModalOpen = true;
    },
    error: err => console.error('Не вдалося отримати донати:', err)
  });
}

closeDonationsModal(): void {
  this.isDonationsModalOpen = false;
  this.selectedGoalDonations = [];
}
}
