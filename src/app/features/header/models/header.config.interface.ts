import { Item } from '../../../shared/models/shared.config.interface';

export interface HeaderConfig {
  containerClasses: string[];
  items: Item[];
}

// ---- Dynamic State ----
export interface HeaderDynamicState {
  dropdownOpen: boolean;
}
