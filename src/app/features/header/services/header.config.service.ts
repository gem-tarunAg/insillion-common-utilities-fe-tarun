import { Injectable, computed, signal } from '@angular/core';
import headerJSON from '../config/header.configuration.json';
import { HeaderConfig } from '../models/header.config.interface';
import {
  Item,
  hasChildren,
} from '../../../shared/models/shared.config.interface';
import { UserDataService } from '../../../core/services/user.data.service';
import { RoutingService } from '../../../core/services/routing.service';

@Injectable({ providedIn: 'root' })
export class HeaderConfigService {
  // Base config is immutable
  private readonly baseConfig = headerJSON as HeaderConfig;

  headerConfig = computed(() => {
    const userData = this.userDataService.userData();
    const currentRoute = this.routingService.currentRoute();

    // Recursively patch all items (including modals) in a single pass
    const patchedItems =
      this.baseConfig.items?.map((item) =>
        this.patchDynamicItem(item, userData, currentRoute)
      ) ?? [];

    return {
      ...this.baseConfig,
      items: patchedItems,
    };
  });

  constructor(
    private userDataService: UserDataService,
    private routingService: RoutingService
  ) {}

  /**
   * Check if the search route is active
   */
  private isSearchActive(currentRoute: string): boolean {
    return this.routingService.isActiveRoute('/dashboard/search');
  }

  /**
   * Recursively patch dynamic fields in items and their children
   */
  private patchDynamicItem(
    item: Item,
    userData: { userName: string; userAvatar: string },
    currentRoute: string
  ): Item {
    let patchedItem = { ...item };

    // Handle specific dynamic bindings based on bindKey
    if (patchedItem.bindKey) {
      switch (patchedItem.type) {
        case 'text':
          if (item.bindKey === 'userName') {
            patchedItem = { ...patchedItem, content: userData.userName };
          }
          break;

        case 'image':
          if (item.bindKey === 'userAvatar') {
            patchedItem = { ...patchedItem, imageSrc: userData.userAvatar };
          }
          break;
      }
    }

    // Add active class to search icon when on search route
    if (
      patchedItem.id === 'search-section' &&
      this.isSearchActive(currentRoute)
    ) {
      patchedItem = {
        ...patchedItem,
        classes: [...patchedItem.classes, 'active'],
      };
    }

    // Recursively patch children for all composite items (container, button, modal)
    if (hasChildren(patchedItem)) {
      patchedItem = {
        ...patchedItem,
        children: patchedItem.children.map((child) =>
          this.patchDynamicItem(child, userData, currentRoute)
        ),
      };
    }

    return patchedItem;
  }
}
