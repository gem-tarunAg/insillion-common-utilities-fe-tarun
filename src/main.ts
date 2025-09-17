import 'zone.js';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { HeaderComponent } from './app/components/header/header.component'
import { SidenavComponent } from './app/components/sidenav/sidenav.component'

(async () => {
  const appRef = await createApplication();
  const headerElement = createCustomElement(HeaderComponent, {
    injector: appRef.injector,
  });

  // Define the custom element with a unique tag name.
  if (!customElements.get('ins-header')) {
    customElements.define('ins-header', headerElement);
  }

  const sidenavElement = createCustomElement(SidenavComponent, {
    injector: appRef.injector,
  });

  if (!customElements.get('ins-sidenav')) {
    customElements.define('ins-sidenav', sidenavElement);
  }
})();
