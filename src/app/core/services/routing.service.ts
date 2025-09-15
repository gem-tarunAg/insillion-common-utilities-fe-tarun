import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private readonly _currentRoute = signal(this.normalize(window.location.hash));

  readonly currentRoute = this._currentRoute.asReadonly();

  constructor() {
    window.addEventListener('hashchange', () => {
      this.updateCurrentRoute();
    });
  }

  private updateCurrentRoute(): void {
    this._currentRoute.set(this.normalize(window.location.hash));
  }
  
  /**
   * Check if a given route is active.
   */
  public isActiveRoute(route: string): boolean {
    const normalizedCurrentRoute = this.normalize(this.currentRoute());
    const normalizedRoute = this.normalize(route); // Check for an exact match first
    if (normalizedCurrentRoute === normalizedRoute) {
      return true;
    } // Then check for a sub-route match
    return normalizedCurrentRoute.startsWith(normalizedRoute + '/');
  }

  /**
   * Normalizes a URL by removing the '#', leading slash, and any trailing slashes.
   */
  private normalize(url: string): string {
    // Correctly handles URLs like #/dashboard, #dashboard, and dashboard/
    // so that the result is 'dashboard'
    return url.replace(/^#?\/?/, '').replace(/\/+$/, '');
  }
}
