import { Component, inject, ViewEncapsulation } from '@angular/core';
import { SidenavConfigService } from '../../services/sidenav.config.service';
import { SidenavDynamicState } from '../../models/sidenav.config.interface';
import { CommonModule } from '@angular/common';
import { RenderItemComponent } from '../../../../shared/components/render-item/render-item.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule, RenderItemComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SidenavComponent {
  private readonly sidenavConfigServie: SidenavConfigService = inject(SidenavConfigService);

  get sidenavConfig() {
    return this.sidenavConfigServie.sidenavConfig;
  }

  get containerClasses(): string {
    return this.sidenavConfig()?.containerClasses?.join(' ') ?? '';
  }

  // Dynamic state for template compatibility
  get dynamicState(): SidenavDynamicState {
    return {
      collapsed: this.sidenavConfigServie.collapsed(),
      logoOpacity: this.sidenavConfigServie.logoOpacity(),
      activeRoute: '', // Not needed for current implementation
    };
  }

  // Get item-specific styles for the render component
  get itemStyles(): { [itemId: string]: { [key: string]: any } } {
    const styles: { [itemId: string]: { [key: string]: any } } = {};
    
    // Handle logo opacity
    if (this.dynamicState.logoOpacity !== undefined) {
      styles['logo-image'] = { opacity: this.dynamicState.logoOpacity };
    }
    
    // Handle menu indicator positioning
    const position = this.getMenuIndicatorPosition();
    if (position !== null) {
      styles['sidenav-active-indicator'] = { top: position + 'rem' };
    }
    
    return styles;
  }

  // Get dynamic classes for items
  get dynamicClasses(): { [itemId: string]: string } {
    const classes: { [itemId: string]: string } = {};
    
    // Add collapsed class to sidebar container if needed
    if (this.dynamicState.collapsed) {
      // This would be handled by containerClasses, but keeping for consistency
      classes['sidebar'] = 'collapsed';
    }
    
    return classes;
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

  onToggleMenu(): void {
    this.sidenavConfigServie.setLogoOpacity(0);

    setTimeout(() => {
      this.sidenavConfigServie.toggleCollapsed();
      this.sidenavConfigServie.setLogoOpacity(1);
    }, 150);
  }

  onMenuItemClick(itemId: string): void {
    if (!itemId) return;
    console.log('🖱️ Menu item clicked:', itemId);
    const success = this.sidenavConfigServie.navigateByItemId(itemId);
    if (!success) {
      console.warn(`⚠️ Failed to navigate for item: ${itemId}`);
    }
  }

  private getMenuIndicatorPosition(): number | null {
    const currentRoute = this.sidenavConfigServie.getCurrentRoute();
    
    // Find the active menu item order from the config
    const menuItemsConfig = this.sidenavConfigServie.getMenuItemsConfig();
    const activeItem = Object.entries(menuItemsConfig).find(
      ([_, config]) => config.route === currentRoute
    );

    if (!activeItem) return null;

    const activeOrder = activeItem[1].order;
    // Calculate position based on order (accounting for 0-based indexing)
    // Each menu item has height of ~3.5rem
    return (activeOrder - 1) * 3.5;
  }

}
