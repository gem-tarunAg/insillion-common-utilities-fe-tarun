import { Injectable, computed, inject, signal } from '@angular/core';
import { RoutingService } from './routing.service';
import menuConfig from '../config/sidenav-menu.config.json';
import { SidenavConfig } from '../models/sidenav.interface';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private readonly routingService = inject(RoutingService);
  private readonly config: SidenavConfig = menuConfig;

  // State signals
  private readonly _isCollapsed = signal<boolean>(true);

  // Public readonly signals
  readonly isCollapsed = computed(() => this._isCollapsed());

  // Get filtered menu items based on user role (simulate for now)
  readonly menuItems = computed(() => {
    const userRole = this.getCurrentUserRole();
    return this.config.menuItems
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .sort((a, b) => a.order - b.order);
  });

  constructor() {}

  // State management methods
  toggleSidebar(): void {
    this._isCollapsed.update((current) => !current);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this._isCollapsed.set(collapsed);
  }

  // Navigation methods
  isActiveRoute(route: string): boolean {
    return this.routingService.isActiveRoute(route);
  }

  // Helper methods
  private getCurrentUserRole(): string {
    return 'admin';
  }

  getActiveMenuIndicatorPosition(): number {
    const activeItem = this.menuItems().find((item) =>
      this.isActiveRoute(item.route)
    );
    if (!activeItem) return -1;
    const itemIndex = this.menuItems().findIndex(
      (item) => item.id === activeItem.id
    );
    return itemIndex * 3.5;
  }
}
