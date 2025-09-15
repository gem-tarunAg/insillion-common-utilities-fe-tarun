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

@Injectable({
  providedIn: 'root'
})
export class SidenavConfigService {
  private readonly baseConfig = sidenavJSON as SidenavConfig;

  // State signals
  private readonly _collapsed = signal(false);
  private readonly _logoOpacity = signal(1);
  private readonly _currentRoute = signal(this.getCurrentLocation());

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
    const currentRoute = this._currentRoute();
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

  constructor() {
    this.expandedItems = this.expandMenuItems(this.baseConfig.items);
    this.lookupMaps = this.buildLookupMaps(this.expandedItems);
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
      this.updateCurrentRoute();
    });

    // Listen for pushstate/replacestate (programmatic navigation)
    this.interceptHistoryMethods();
  }

  // ===== LOCATION MANAGEMENT =====

  /**
   * Get current location pathname
   */
  private getCurrentLocation(): string {
    return window.location.pathname;
  }

  /**
   * Update the current route signal
   */
  private updateCurrentRoute(): void {
    this._currentRoute.set(this.getCurrentLocation());
  }

  /**
   * Intercept history methods to detect programmatic navigation
   */
  private interceptHistoryMethods(): void {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.updateCurrentRoute();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.updateCurrentRoute();
    };
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
    window.location.href = route;
    return true;
  }

  /** 🔑 Updated active route detection */
  isActiveRoute(route: string, currentRoute?: string): boolean {
    const routeToCheck = this.normalize(currentRoute || this._currentRoute());
    const baseRoute = this.normalize(route);

    return (
      routeToCheck === baseRoute || routeToCheck.startsWith(baseRoute + '/')
    );
  }

  private normalize(url: string): string {
    return url.replace(/\/+$/, ''); // remove trailing slashes
  }

  // ===== PUBLIC GETTERS FOR COMPONENT USE =====

  getCurrentRoute(): string {
    return this._currentRoute();
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
    const routeToUse = currentRoute || this._currentRoute();
    const indicatorPosition = this.calculateMenuIndicatorPosition(routeToUse);

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
        const isActive = this.isActiveRoute(config.route, routeToUse);
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

  // Add this method to calculate menu indicator position
  private calculateMenuIndicatorPosition(currentRoute?: string): number {
    const routeToUse = currentRoute || this._currentRoute();

    // Find the active menu item order
    const activeItem = Object.entries(this.baseConfig.menuItemsConfig).find(
      ([, config]) => this.isActiveRoute(config.route, routeToUse)
    );

    if (!activeItem) return -1;

    const activeOrder = activeItem[1].order;

    // Calculate position based on order (accounting for 0-based indexing)
    // Each menu item has height of ~3.5rem (1rem padding + content + 0.5rem margin)
    return (activeOrder - 1) * 3.5;
  }

  getDynamicData(): SidenavDynamicData {
    return this.buildDynamicData(this._collapsed(), this._currentRoute());
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
          // Handle menu indicator - just add active class, positioning via getItemStyles
          if (
            patchedItem.bindKey === 'menuIndicator' &&
            dynamicValue &&
            dynamicValue !== '-100px'
          ) {
            patchedItem = {
              ...patchedItem,
              classes: [...patchedItem.classes, 'active'],
            };
          }
          break;

        case 'button':
          if (
            patchedItem.bindKey &&
            this.lookupMaps.bindKeyToRoute[patchedItem.bindKey]
          ) {
            const route = this.lookupMaps.bindKeyToRoute[patchedItem.bindKey];
            if (this.isActiveRoute(route)) {
              patchedItem = {
                ...patchedItem,
                classes: [...patchedItem.classes, 'active'],
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