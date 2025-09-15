import { CommonModule } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RenderItemComponent } from '../../../../shared/components/render-item/render-item.component';
import { HeaderDynamicState } from '../../models/header.config.interface';
import { HeaderConfigService } from '../../services/header.config.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RenderItemComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  dynamicState: HeaderDynamicState = { 
    dropdownOpen: false 
  };

  private headerConfigService: HeaderConfigService = inject(HeaderConfigService);

  get headerConfig() {
    return this.headerConfigService.headerConfig; // returns computed signal
  }

  get containerClasses(): string {
    return this.headerConfig()?.containerClasses?.join(' ') ?? '';
  }

  // Get item-specific styles for the render component (if needed in future)
  get itemStyles(): { [itemId: string]: { [key: string]: any } } {
    return {}; // No specific styles needed for header currently
  }

  // Get dynamic classes for items (if needed in future)
  get dynamicClasses(): { [itemId: string]: string } {
    return {}; // No specific dynamic classes needed for header currently
  }

  getClasses(classes: string[] = []): string {
    return classes.join(' ');
  }

  updateState<K extends keyof HeaderDynamicState>(key: K, value: boolean): void {
    this.dynamicState = { ...this.dynamicState, [key]: value };
  }

  // Action handler
  handleClick(action: string, itemId?: string | number): void {
    if (!action) return;

    const method = (this as any)[action];
    if (typeof method === 'function') {
      method.call(this, itemId);
    } else {
      console.warn(`⚠️ No method found for action "${action}"`);
    }
  }

  // Actions
  onSearchClicked(): void {
    console.log('🔍 Search clicked');
    console.log(`➡️ Navigating to route: /dashboard/search`)
    window.location.href = '/dashboard/search';
  }

  onUserInfoClicked(): void {
    console.log('👤 User Info clicked');
    this.updateState('dropdownOpen', !this.dynamicState['dropdownOpen']);
  }

  onLogout(): void {
    this.updateState('dropdownOpen', false);
    console.log('🚪 Logout clicked');
    // Add logout logic here
  }
}
