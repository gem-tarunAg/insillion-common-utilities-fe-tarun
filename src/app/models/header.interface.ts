export interface HeaderMenuItem {
  id: string;
  label: string;
  icon: string;
  order: number;
  roles?: string[];
}

export interface HeaderMenuConfig {
  menuItems: HeaderMenuItem[];
}

export interface HeaderState {
  dropdownOpen: boolean;
}
