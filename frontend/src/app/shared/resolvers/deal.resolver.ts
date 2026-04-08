// resolvers/deal.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DealService, Deal } from '../services/deal.service';

@Injectable({ providedIn: 'root' })
export class DealResolver implements Resolve<Deal> {
  constructor(private dealService: DealService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Deal> {
    const id = +route.paramMap.get('id')!;
    return this.dealService.getDealById(id);
  }
}