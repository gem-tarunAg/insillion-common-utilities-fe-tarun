import { Injectable, computed, signal } from '@angular/core';
import sidenavJSON from '../config/sidenav.configuration.json';
import {
  SidenavConfig,
  SidenavDynamicData,
  MenuItemConfig,
} from '../models/sidenav.config.interface';
import {
  Item,
  ButtonItem,
  ImageItem,
  TextItem,
  hasChildren,
  isMenuItemPlaceholder,
} from '../../../shared/models/shared.config.interface';
import { RoutingService } from '../../../core/services/routing.service';

@Injectable({
  providedIn: 'root'
})
export class SidenavConfigService {
  private readonly baseConfig = sidenavJSON as SidenavConfig;

  // State signals
  private readonly _collapsed = signal(false);
  private readonly _logoOpacity = signal(1);

  // Pre-computed data for performance
  private readonly expandedItems: Item[];
  private readonly lookupMaps: {
    idToBindKey: Record<string, string>;
    idToItem: Record<string, Item>;
    bindKeyToRoute: Record<string, string>;
  };

  // Computed configuration
  readonly sidenavConfig = computed(() => {
    const collapsed = this._collapsed();
    const currentRoute = this.routingService.currentRoute();
    const dynamicData = this.buildDynamicData(collapsed, currentRoute);

    return {
      ...this.baseConfig,
      containerClasses: collapsed
        ? [...this.baseConfig.containerClasses, 'collapsed']
        : this.baseConfig.containerClasses,
      items: this.expandedItems.map((item) =>
        this.patchDynamicItem(item, dynamicData)
      ),
    };
  });

  // Public state getters
  readonly collapsed = computed(() => this._collapsed());
  readonly logoOpacity = computed(() => this._logoOpacity());
  readonly currentRoute = computed(() => this.routingService.currentRoute());

  constructor(private routingService: RoutingService) {
    this.expandedItems = this.expandMenuItems(this.baseConfig.items);
    this.lookupMaps = this.buildLookupMaps(this.expandedItems);
  }

  // ===== STATE MANAGEMENT =====

  setCollapsed(value: boolean): void {
    this._collapsed.set(value);
  }

  setLogoOpacity(value: number): void {
    this._logoOpacity.set(value);
  }

  toggleCollapsed(): void {
    this._collapsed.update((current) => !current);
  }

  // ===== NAVIGATION & ROUTING =====

  navigateByItemId(itemId: string): boolean {
    const bindKey = this.lookupMaps.idToBindKey[itemId];
    if (!bindKey) return false;

    const route = this.lookupMaps.bindKeyToRoute[bindKey];
    if (!route) return false;

    console.log(`➡️ Navigating to route: ${route}`);
    window.location.hash = route;
    return true;
  }

  /** 🔑 Updated active route detection */
  isActiveRoute(route: string): boolean {
    return this.routingService.isActiveRoute(route);
  }

  // ===== PUBLIC GETTERS FOR COMPONENT USE =====

  getCurrentRoute(): string {
    return this.routingService.currentRoute();
  }

  getMenuItemsConfig(): { [key: string]: MenuItemConfig } {
    return this.baseConfig.menuItemsConfig;
  }

  // ===== UTILITY METHODS =====

  getBindKeyFromId(id: string): string | undefined {
    return this.lookupMaps.idToBindKey[id];
  }

  getItemFromId(id: string): Item | undefined {
    return this.lookupMaps.idToItem[id];
  }

  // Get menu indicator position
  getMenuIndicatorPosition(): number {
    // Find the active menu item order
    const activeItem = Object.entries(this.baseConfig.menuItemsConfig).find(
      ([, config]) => this.routingService.isActiveRoute(config.route)
    );

    if (!activeItem) {
      console.log('❌ No active item found');
      return -1;
    }

    const activeOrder = activeItem[1].order;

    // Calculate position based on order (accounting for 0-based indexing)
    // Each menu item has height of ~3.5rem (1rem padding + content + 0.5rem margin)
    const position = (activeOrder - 1) * 3.5;
    
    return position;
  }

  // ===== PRIVATE METHODS =====

  private expandMenuItems(items: Item[]): Item[] {
    return items.flatMap((item) => {
      if (isMenuItemPlaceholder(item)) {
        return this.generateMenuItemsFromTemplate();
      }

      if (hasChildren(item)) {
        return [
          {
            ...item,
            children: this.expandMenuItems(item.children),
          } as Item,
        ];
      }

      return [item];
    });
  }

  private generateMenuItemsFromTemplate(): ButtonItem[] {
    return Object.entries(this.baseConfig.menuItemsConfig)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([bindKey, config]) =>
        this.createMenuItemFromTemplate(bindKey, config)
      );
  }

  private createMenuItemFromTemplate(
    bindKey: string,
    config: MenuItemConfig
  ): ButtonItem {
    const template = this.baseConfig.menuItemTemplate;
    const itemId = `${bindKey}-item`;

    const children = template.children.map((childTemplate, index) => {
      const childId = `${bindKey}-${index === 0 ? 'icon' : 'label'}`;

      if (childTemplate.type === 'image') {
        return {
          ...childTemplate,
          id: childId,
          altText: config.label,
          bindKey: `${this.toCamelCase(bindKey)}Icon`,
          imageSrc: '',
        } as ImageItem;
      }

      if (childTemplate.type === 'text') {
        return {
          ...childTemplate,
          id: childId,
          bindKey: `${this.toCamelCase(bindKey)}Label`,
          content: '',
        } as TextItem;
      }

      return { ...childTemplate, id: childId } as Item;
    });

    return {
      ...template,
      id: itemId,
      bindKey: bindKey,
      children: children,
    } as ButtonItem;
  }

  private buildLookupMaps(items: Item[]) {
    const maps = {
      idToBindKey: {} as Record<string, string>,
      idToItem: {} as Record<string, Item>,
      bindKeyToRoute: {} as Record<string, string>,
    };

    // Build route lookup from config
    Object.entries(this.baseConfig.menuItemsConfig).forEach(
      ([bindKey, config]) => {
        maps.bindKeyToRoute[bindKey] = config.route;
      }
    );

    // Build item lookups
    const processItem = (item: Item): void => {
      if (item.id) {
        maps.idToItem[item.id] = item;
      }

      if (item.type === 'button' && item.bindKey) {
        maps.idToBindKey[item.id] = item.bindKey;
      }

      if (hasChildren(item)) {
        item.children.forEach(processItem);
      }
    };

    items.forEach(processItem);
    return maps;
  }

  private buildDynamicData(
    collapsed: boolean,
    currentRoute?: string
  ): SidenavDynamicData {
    const indicatorPosition = this.getMenuIndicatorPosition();

    // Initialize with base properties first
    const dynamicData: SidenavDynamicData = {
      logoSrc: collapsed
        ? 'assets/images/logo.svg'
        : 'assets/images/extended-logo.svg',
      toggleIcon: collapsed
        ? 'assets/icons/caret-right.svg'
        : 'assets/icons/caret-left.svg',
      menuIndicator:
        indicatorPosition >= 0 ? `${indicatorPosition}rem` : '-100px',
      // Initialize all required menu item properties
      dashboardIcon: '',
      reportsIcon: '',
      groupProductsIcon: '',
      totalCountIcon: '',
      dashboardLabel: '',
      reportsLabel: '',
      groupProductsLabel: '',
      totalCountLabel: '',
    };

    // Generate dynamic data for menu items
    Object.entries(this.baseConfig.menuItemsConfig).forEach(
      ([bindKey, config]) => {
        const isActive = this.routingService.isActiveRoute(config.route);
        const camelKey = this.toCamelCase(bindKey);

        (dynamicData as any)[`${camelKey}Icon`] = this.getIconPath(
          config.iconBase,
          isActive
        );
        (dynamicData as any)[`${camelKey}Label`] = config.label;
      }
    );

    return dynamicData;
  }

  getDynamicData(): SidenavDynamicData {
    return this.buildDynamicData(this._collapsed());
  }

  private patchDynamicItem(item: Item, dynamicData: SidenavDynamicData): Item {
    let patchedItem = { ...item };

    if (patchedItem.bindKey) {
      const dynamicValue = (dynamicData as any)[patchedItem.bindKey];

      switch (patchedItem.type) {
        case 'text':
          if (dynamicValue) {
            patchedItem = { ...patchedItem, content: dynamicValue } as TextItem;
          }
          break;

        case 'image':
          if (dynamicValue) {
            patchedItem = {
              ...patchedItem,
              imageSrc: dynamicValue,
            } as ImageItem;
          }
          break;

        case 'container':
          // Handle menu indicator - add active class if position is valid
          if (
            patchedItem.bindKey === 'menuIndicator' &&
            dynamicValue &&
            dynamicValue !== '-100px'
          ) {
            patchedItem = {
              ...patchedItem,
              classes: [...(patchedItem.classes || []), 'active'],
            };
          }
          break;

        case 'button':
          if (
            patchedItem.bindKey &&
            this.lookupMaps.bindKeyToRoute[patchedItem.bindKey]
          ) {
            const route = this.lookupMaps.bindKeyToRoute[patchedItem.bindKey];
            if (this.routingService.isActiveRoute(route)) {
              patchedItem = {
                ...patchedItem,
                classes: [...(patchedItem.classes || []), 'active'],
              };
            }
          }
          break;
      }
    }

    if (hasChildren(patchedItem)) {
      patchedItem = {
        ...patchedItem,
        children: patchedItem.children.map((child) =>
          this.patchDynamicItem(child, dynamicData)
        ),
      } as Item;
    }

    return patchedItem;
  }

  private getIconPath(iconBase: string, active: boolean = false): string {
    const suffix = active ? '-blue' : '';
    return `assets/icons/${iconBase}${suffix}.svg`;
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}