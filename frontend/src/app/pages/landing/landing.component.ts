import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingPageComponent implements AfterViewInit {
  @ViewChildren('reveal') revealBlocks!: QueryList<ElementRef<HTMLElement>>;

  readonly year = new Date().getFullYear();
  faqOpen = -1;

  readonly steps = [
    { n: 1, title: 'Deal created', body: 'Seller defines the item, price, and buyer on the platform.' },
    { n: 2, title: 'Buyer funds escrow', body: 'Buyer pays from their wallet; funds move into secure escrow.' },
    { n: 3, title: 'Shipped', body: 'Seller ships the goods once payment is secured in escrow.' },
    { n: 4, title: 'Delivered', body: 'Buyer confirms receipt; seller confirms completion from their side.' },
    { n: 5, title: 'Released', body: 'Escrow releases funds to the seller when conditions are met.' },
    { n: 6, title: 'Optional rating', body: 'Buyer may rate the seller to strengthen trust for future deals.' }
  ];

  readonly faqs = [
    {
      q: 'What is SafeDeal?',
      a: 'SafeDeal is a trusted escrow intermediary that holds funds until both parties meet the agreed conditions, reducing fraud for online transactions.'
    },
    {
      q: 'Who holds the money?',
      a: 'Funds sit in escrow on the platform while the deal progresses. They are only released when delivery milestones and confirmations are satisfied.'
    },
    {
      q: 'What happens in a dispute?',
      a: 'Either party can open a dispute for eligible statuses. Funds remain frozen until the situation is reviewed and resolved.'
    },
    {
      q: 'Is SafeDeal a bank?',
      a: 'No. SafeDeal provides escrow-style workflow for deals on the platform. It is not a chartered bank or deposit institution.'
    },
    {
      q: 'How do I add funds?',
      a: 'Use the Wallet page to add funds to your balance. A future Stripe PaymentIntent integration will replace the current development flow.'
    }
  ];

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    setTimeout(() => {
      this.revealBlocks?.forEach((ref) => observer.observe(ref.nativeElement));
    });
  }

  toggleFaq(i: number): void {
    this.faqOpen = this.faqOpen === i ? -1 : i;
  }
}
