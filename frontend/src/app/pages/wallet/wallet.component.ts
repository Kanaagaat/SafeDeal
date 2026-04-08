import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

interface WalletData {
  balance: number;
  escrow_balance: number;
  trust_score: number;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  wallet: WalletData | null = null;
  loading = true;
  showAddFunds = false;
  addAmount: number | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();
    if (user) {
      this.wallet = {
        balance: user.balance || 0,
        escrow_balance: user.escrow_balance || 0,
        trust_score: user.trust_score || 0
      };
      this.loading = false;
    } else {
      // Try to get from API if not in currentUser
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.wallet = {
            balance: user.balance || 0,
            escrow_balance: user.escrow_balance || 0,
            trust_score: user.trust_score || 0
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading wallet:', error);
          this.loading = false;
        }
      });
    }
    
    // Subscribe to balance updates
    this.authService.getBalance().subscribe({
      next: (data) => {
        if (this.wallet) {
          this.wallet.balance = data.balance || 0;
          this.wallet.escrow_balance = data.escrow_balance || 0;
        }
      },
      error: (error) => console.error('Error syncing balance:', error)
    });
  }

  onAddFunds(): void {
    if (!this.addAmount || !this.wallet) return;
    
    this.authService.updateBalance(this.addAmount).subscribe({
      next: (res) => {
        if (this.wallet) {
          this.wallet.balance = res.balance || 0;
          this.wallet.escrow_balance = res.escrow_balance || 0;
        }
        this.showAddFunds = false;
        this.addAmount = null;
      },
      error: (error) => {
        console.error('Error adding funds:', error);
      }
    });
  }
}
