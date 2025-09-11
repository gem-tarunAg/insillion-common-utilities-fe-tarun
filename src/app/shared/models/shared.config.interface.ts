// ---- Item Types ----
export type ItemType = 'button' | 'container' | 'image' | 'text' | 'modal' | 'menuItem';

// Base item
export interface ItemBase {
  id: string;
  type: ItemType;
  classes: string[];
  clickAction?: string;
  bindKey?: string; // key to bind dynamic data
}

// Simple items
export interface TextItem extends ItemBase {
  type: 'text';
  content: string;
}

export interface ImageItem extends ItemBase {
  type: 'image';
  imageSrc: string;
  altText: string;
}

// Composite items (mainly containers for other items)
export interface ContainerItem extends ItemBase {
  type: 'container';
  children: Item[];
}

export interface ButtonItem extends ItemBase {
  type: 'button';
  children: Item[];
}

// Modal item - also a composite item but with special behavior
export interface ModalItem extends ItemBase {
  type: 'modal';
  showCondition: string; // condition to show/hide modal
  children: Item[];
  triggerItemId?: string; // optional: specific item that triggers this modal
}

//  Menu Item Type - placeholder for menu items to be expanded at runtime
export interface MenuItemPlaceholder extends ItemBase {
  type: 'menuItem';
}

// Union type for all items
export type Item = TextItem | ImageItem | ContainerItem | ButtonItem | ModalItem | MenuItemPlaceholder;

// ---- Dynamic State ----
export interface DynamicState {
  [key: string]: any;
}

// Type guard utilities for better type safety
export const isCompositeItem = (item: Item): item is ContainerItem | ButtonItem | ModalItem => {
  return item.type === 'container' || item.type === 'button' || item.type === 'modal';
};

export const isMenuItemPlaceholder = (item: Item): item is MenuItemPlaceholder => {
  return item.type === 'menuItem';
};

export const isTextItem = (item: Item): item is TextItem => {
  return item.type === 'text';
};

export const isImageItem = (item: Item): item is ImageItem => {
  return item.type === 'image';
};

export const isModalItem = (item: Item): item is ModalItem => {
  return item.type === 'modal';
};

// Helper to check if item has children
export const hasChildren = (item: Item): item is ContainerItem | ButtonItem | ModalItem => {
  return isCompositeItem(item) && 'children' in item;
};

// ---- Event Types ----
export interface ItemClickEvent {
  action: string;
  itemId?: string | number;
}