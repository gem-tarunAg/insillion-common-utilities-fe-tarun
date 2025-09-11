import { Item } from '../../../shared/models/shared.config.interface';

// ---- Menu Item Configuration ----
export interface MenuItemConfig {
  route: string;
  label: string;
  iconBase: string;
  order: number;
}

// Template for menu items
export interface MenuItemTemplate {
  type: 'button';
  classes: string[];
  clickAction: string;
  children: Partial<Item>[];
}

// ---- Sidenav Configuration ----
export interface SidenavConfig {
  containerClasses: string[];
  menuItemsConfig: { [key: string]: MenuItemConfig };
  menuItemTemplate: MenuItemTemplate;
  items: Item[];
}

// ---- Dynamic State for Sidenav ----
export interface SidenavDynamicState {
  collapsed: boolean;
  logoOpacity: number;
  activeRoute: string;
}

// ---- Dynamic Data for binding ----
export interface SidenavDynamicData {
  logoSrc: string;
  toggleIcon: string;
  dashboardIcon: string;
  menuIndicator: string;
  reportsIcon: string;
  groupProductsIcon: string;
  totalCountIcon: string;
  dashboardLabel: string;
  reportsLabel: string;
  groupProductsLabel: string;
  totalCountLabel: string;
}
