import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../shared/services/wallet.service';
import { WalletData } from '../../shared/models/models';

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

  private mockWallet: WalletData = {
    totalBalance: 4694,
    available: 1195,
    inEscrow: 3499,
    transactions: [
      { id: 1, description: 'MacBook Pro 16" M3 Max', date: '2026-03-21', amount: -3499, type: 'escrow', status: 'held' },
      { id: 2, description: 'Added funds', date: '2026-03-20', amount: 5000, type: 'deposit', status: 'completed' },
      { id: 3, description: 'Sony A7 IV Camera - Payment Released', date: '2026-03-18', amount: 2298, type: 'release', status: 'completed' },
      { id: 4, description: 'Herman Miller Aeron Chair - Payment Released', date: '2026-03-15', amount: 895, type: 'release', status: 'completed' },
    ]
  };

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.loadWallet();
  }

  loadWallet(): void {
    this.loading = true;
    // Uncomment when backend is ready:
    // this.walletService.getWallet().subscribe({ next: w => { this.wallet = w; this.loading = false; } });

    setTimeout(() => {
      this.wallet = this.mockWallet;
      this.loading = false;
    }, 600);
  }

  onAddFunds(): void {
    if (!this.addAmount || !this.wallet) return;
    // Uncomment when backend is ready:
    // this.walletService.addFunds(this.addAmount).subscribe({ next: w => { this.wallet = w; this.showAddFunds = false; } });

    this.wallet.totalBalance += this.addAmount;
    this.wallet.available += this.addAmount;
    this.wallet.transactions.unshift({
      id: Date.now(),
      description: 'Added funds',
      date: new Date().toISOString().split('T')[0],
      amount: this.addAmount,
      type: 'deposit',
      status: 'completed'
    });
    this.showAddFunds = false;
    this.addAmount = null;
  }
}
