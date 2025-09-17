import { Injectable, computed, inject } from '@angular/core';
import { RoutingService } from './routing.service';
import headerMenuConfig from '../config/header-menu.config.json';
import { HeaderMenuConfig } from '../models/header.interface';

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  private readonly routingService = inject(RoutingService);
  private readonly config: HeaderMenuConfig = headerMenuConfig;

  // Public computed properties
  readonly currentRoute = computed(() => this.routingService.currentRoute());

  // Public readonly signals for menu items
  readonly headerMenuItems = computed(() => {
    return this.config.menuItems.sort((a, b) => a.order - b.order);
  });

  constructor() {}

  isSearchActive(): boolean {
    return this.routingService.isActiveRoute('/dashboard/search');
  }

  logout(): void {
    console.log('🚪 Logging out user');
    this.routingService.navigateTo('/login');
  }
}
