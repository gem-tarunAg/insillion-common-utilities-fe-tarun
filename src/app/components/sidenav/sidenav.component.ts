import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ElementRef, HostListener } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SidenavMenuItem } from '../../models/sidenav.interface';
import { SidenavService } from '../../services/sidenav.service';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
})
export class SidenavComponent {
  readonly sidenavService = inject(SidenavService);
  readonly apiService = inject(ApiService);
  private routingService = inject(RoutingService);
  private elementRef = inject(ElementRef);
  private hideTooltipTimeout: any;

  // Logo opacity for smooth transitions
  private readonly _logoOpacity = signal<number>(1);
  readonly logoOpacity = computed(() => this._logoOpacity());

  // Tooltip state
  readonly tooltip = signal<{ visible: boolean; text: string; top: number }>({
    visible: false,
    text: '',
    top: 0,
  });

  // Computed properties for template
  readonly logoSrc = computed(() =>
    this.sidenavService.isCollapsed()
      ? 'assets/images/logo.svg'
      : 'assets/images/extended-logo.svg'
  );

  readonly toggleIconSrc = computed(() =>
    this.sidenavService.isCollapsed()
      ? 'assets/icons/caret-right.svg'
      : 'assets/icons/caret-left.svg'
  );

  readonly indicatorPosition = computed(() =>
    this.sidenavService.getActiveMenuIndicatorPosition()
  );

  // Menu item click handler
  onMenuItemClick(item: SidenavMenuItem): void {
    console.log(`🖱️ Menu item clicked: ${item.label} (${item.route})`);
    // this.routingService.navigateTo(item.route);
    window.location.href = item.route
  }

  // Toggle menu handler with smooth logo transition
  onToggleMenu(): void {
    console.log('🎛️ Toggling sidenav');

    // Fade out logo
    this._logoOpacity.set(0);

    // Toggle sidebar and fade logo back in
    setTimeout(() => {
      this.sidenavService.toggleSidebar();
      this._logoOpacity.set(1);
    }, 150);
  }

  // Get appropriate icon for menu item based on active state
  getMenuItemIcon(item: SidenavMenuItem): string {
    return this.sidenavService.isActiveRoute(item.route)
      ? item.iconActive
      : item.icon;
  }

  // Tooltip handlers
  onMenuItemMouseEnter(event: MouseEvent, item: SidenavMenuItem): void {
    if (this.sidenavService.isCollapsed()) {
      this.clearHideTooltipTimeout();

      const menuItemElement = event.currentTarget as HTMLElement;
      const sidenavRect = this.elementRef.nativeElement.getBoundingClientRect();
      const menuItemRect = menuItemElement.getBoundingClientRect();

      const top =
        menuItemRect.top -
        sidenavRect.top +
        menuItemElement.offsetHeight / 2;

      this.tooltip.set({
        visible: true,
        text: item.label,
        top: top,
      });
    }
  }

  onMenuItemMouseLeave(): void {
    this.hideTooltipTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 100);
  }

  onSidenavMouseLeave(): void {
    this.hideTooltip();
  }

  private hideTooltip(): void {
    this.tooltip.set({
      ...this.tooltip(),
      visible: false,
    });
  }

  private clearHideTooltipTimeout(): void {
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (
      !this.sidenavService.isCollapsed() &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.sidenavService.toggleSidebar();
    }
  }
}