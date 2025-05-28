import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-volunteer-request',
  imports: [CommonModule, FormsModule],
  templateUrl: './volunteer-request.component.html',
  styleUrl: './volunteer-request.component.scss'
})
export class VolunteerRequestComponent {
  requests: any[] = [];
  selectedRequest: any = null;
  commentText: string = '';
  isModalOpen: boolean = false;

  ngOnInit(): void {
    this.loadRequests();
  }

  getHelpDescription(help: number): string {
  const map = [
    { value: 1 << 0, label: 'Притулок для тварин' },
    { value: 1 << 1, label: 'Доставка в клініку' },
    { value: 1 << 2, label: 'Виїзд на місце' },
    { value: 1 << 3, label: 'Медична допомога' },
    { value: 1 << 4, label: 'Інформаційна підтримка' },
  ];

    return map
      .filter(option => (help & option.value) !== 0)
      .map(option => option.label)
      .join(', ');
  }

  loadRequests(): void {
    const token = localStorage.getItem('access_token') || '';
    fetch(`https://kkp-api.ruslan.page/api/admin/volunteer-requests?page=1&page_size=50&status=1`, {
      headers: { 'x-token': token }
    })
      .then(res => res.json())
      .then(data => {
        this.requests = data.result || [];
      });
  }

  openRequest(request: any): void {
    this.selectedRequest = request;
    this.isModalOpen = true;
    this.commentText = '';
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  approveRequest(): void {
    this.sendDecision(true);
  }

  rejectRequest(): void {
    this.sendDecision(false);
  }

  private sendDecision(approve: boolean): void {
    const token = localStorage.getItem('access_token') || '';
    const endpoint = approve ? 'approve' : 'reject';

    fetch(`https://kkp-api.ruslan.page/api/admin/volunteer-requests/${this.selectedRequest.id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token': token
      },
      body: JSON.stringify({ text: this.commentText })
    })
      .then(res => res.ok ? this.loadRequests() : Promise.reject(res))
      .then(() => this.closeModal());
  }
}
