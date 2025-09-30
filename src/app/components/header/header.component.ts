import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { RoutingService } from '../../services/routing.service';
import { UserDataService } from '../../services/user.data.service';
import { HeaderMenuItem, HeaderState } from '../../models/header.interface';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly headerService = inject(HeaderService);
  readonly apiService = inject(ApiService);
  readonly userDataService = inject(UserDataService);
  private routingService = inject(RoutingService);

  state: HeaderState = {
    dropdownOpen: false,
  };

  onSearchClick(): void {
    console.log('🔍 Search clicked');
    // this.routingService.navigateTo('/dashboard/search');
     window.location.href = "https://d2fciuteqrodiu.cloudfront.net/login/#/dashboard/search"
  }

  onUserInfoClick(): void {
    console.log('👤 User info clicked');
    this.state.dropdownOpen = !this.state.dropdownOpen;
  }

  // Generic method to handle all dropdown item clicks
  onMenuItemClick(item: HeaderMenuItem): void {
    this.state.dropdownOpen = false;

    if (item.id === 'logout') {
      console.log('🚪 Logout clicked');
      this.headerService.logout();
    } else {
      console.log(`Dropdown item clicked: ${item.label}`);
    }
  }
}
