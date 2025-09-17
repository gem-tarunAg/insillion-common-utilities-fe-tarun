export interface SidenavMenuItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  iconActive: string;
  order: number;
  roles?: string[];
}

export interface SidenavConfig {
  menuItems: SidenavMenuItem[];
}

export interface SidenavState {
  isCollapsed: boolean;
  activeRoute: string;
  logoOpacity: number;
}
