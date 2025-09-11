import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderConfigService {
  getTitle() { return 'My Shared Header'; }

  constructor() { }
}
