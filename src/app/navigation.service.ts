import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root', // This makes the service available application-wide
})
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  getHistory(): string[] {
    return this.history;
  }

  goBack(defaultRoute: string = '/'): void {
    if (this.history.length > 1) {
      this.history.pop(); // Remove current route
      const lastRoute = this.history.pop(); // Get the previous route
      if (lastRoute) {
        this.router.navigateByUrl(lastRoute);
        return;
      }
    }
    // Navigate to default route if no history
    this.router.navigateByUrl(defaultRoute);
  }

  clearHistory(): void {
    this.history = [];
  }
}
