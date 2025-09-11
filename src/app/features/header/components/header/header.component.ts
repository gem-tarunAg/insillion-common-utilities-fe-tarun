import {
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { HeaderConfigService } from '../../services/header-config.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class HeaderComponent {
  private headerConfigService = inject(HeaderConfigService);
  title = this.headerConfigService.getTitle();
}
