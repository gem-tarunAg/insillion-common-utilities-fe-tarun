import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  DynamicState,
  Item,
  ItemClickEvent,
} from '../../models/shared.config.interface';


@Component({
  selector: 'app-render-item',
  imports: [CommonModule],
  templateUrl: './render-item.component.html',
  styleUrl: './render-item.component.scss',
})
export class RenderItemComponent {
  @Input() items: Item[] = [];
  @Input() dynamicState: DynamicState = {};
  @Input() itemStyles: { [itemId: string]: { [key: string]: any } } = {};
  @Input() dynamicClasses: { [itemId: string]: string } = {};
  @Output() itemClick = new EventEmitter<ItemClickEvent>();

  getClasses(classes: string[] = []): string {
    return classes.join(' ');
  }

  onItemClick(action: string, itemId?: string | number): void {
    if (!action) return;
    this.itemClick.emit({ action, itemId });
  }

  shouldShowModal(showCondition: string): boolean {
    return Boolean(this.dynamicState[showCondition]);
  }

  // Generic method to get styles for specific items
  getItemStyles(itemId: string): { [key: string]: any } {
    return this.itemStyles[itemId] || {};
  }

  // Generic method to get dynamic classes for items
  getDynamicClasses(item: Item): string {
    return this.dynamicClasses[item.id] || '';
  }
}
