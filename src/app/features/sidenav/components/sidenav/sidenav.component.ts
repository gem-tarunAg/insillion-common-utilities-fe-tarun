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
  private readonly sidenavConfigService: SidenavConfigService = inject(SidenavConfigService);

  get sidenavConfig() {
    return this.sidenavConfigService.sidenavConfig;
  }

  get containerClasses(): string {
    return this.sidenavConfig()?.containerClasses?.join(' ') ?? '';
  }

  // Dynamic state for template compatibility
  get dynamicState(): SidenavDynamicState {
    return {
      collapsed: this.sidenavConfigService.collapsed(),
      logoOpacity: this.sidenavConfigService.logoOpacity(),
      activeRoute: this.sidenavConfigService.currentRoute(),
    };
  }

  // Get item-specific styles for the render component
  get itemStyles(): { [itemId: string]: { [key: string]: any } } {
    const styles: { [itemId: string]: { [key: string]: any } } = {};
    
    // Handle logo opacity
    if (this.dynamicState.logoOpacity !== undefined) {
      styles['logo-image'] = { opacity: this.dynamicState.logoOpacity };
    }
    
    // Handle menu indicator positioning - use service method
    const position = this.sidenavConfigService.getMenuIndicatorPosition();
    if (position >= 0) {
      styles['sidenav-active-indicator'] = { 
        top: position + 'rem',
        opacity: 1,
        visibility: 'visible'
      };
    } else {
      // Hide indicator when no active route
      styles['sidenav-active-indicator'] = { 
        top: '-100px',
        opacity: 0,
        visibility: 'hidden'
      };
    }
    
    return styles;
  }

  // Get dynamic classes for items
  get dynamicClasses(): { [itemId: string]: string } {
    const classes: { [itemId: string]: string } = {};
    
    // Add collapsed class to sidebar container if needed
    if (this.dynamicState.collapsed) {
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
    console.log('🎛️ Toggling menu');
    this.sidenavConfigService.setLogoOpacity(0);

    setTimeout(() => {
      this.sidenavConfigService.toggleCollapsed();
      this.sidenavConfigService.setLogoOpacity(1);
    }, 150);
  }

  onMenuItemClick(itemId: string): void {
    if (!itemId) return;
    
    console.log('🖱️ Menu item clicked:', itemId);
    const success = this.sidenavConfigService.navigateByItemId(itemId);
    
    if (!success) {
      console.warn(`⚠️ Failed to navigate for item: ${itemId}`);
    }
  }
}