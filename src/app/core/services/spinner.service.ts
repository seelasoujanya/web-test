import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { IDialogConfig } from '../models/dialogconfig.model';

import { SpinnerOverlayComponent } from 'src/app/shared/components/spinner-overlay/spinner-overlay.component';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private readonly positionStrategy = this.overlay
    .position()
    .global()
    .centerHorizontally()
    .centerVertically();

  private overlayRef!: OverlayRef;

  constructor(
    private overlay: Overlay,
    private readonly injector: Injector
  ) {}

  public show(message = '') {
    // Returns an OverlayRef (which is a PortalHost)
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create();
    }
    // Create ComponentPortal that can be attached to a PortalHost
    if (!this.overlayRef.hasAttached()) {
      this.overlayRef.attach(new ComponentPortal(SpinnerOverlayComponent)); // Attach ComponentPortal to PortalHost
    }
  }

  public zoomImage<R = any, T = any>(config: IDialogConfig): void {
    const configs = new OverlayConfig({
      positionStrategy: this.positionStrategy,
      hasBackdrop: true,
      disposeOnNavigation: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      panelClass: ['modal'], // styles for cdk-overlay
      width: 'auto',
      height: '100vh',
      maxWidth: '98vh',
      maxHeight: '100%',
    });

    if (this.overlayRef) {
      this.overlayRef.detach();
    }

    this.overlayRef = this.overlay.create(configs);
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef.detach();
    });

    this.createInjector(config, this.injector);
  }

  private createInjector(config: IDialogConfig, inj: Injector): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(IDialogConfig, config);
    return new PortalInjector(inj, injectorTokens);
  }

  public hide() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }
}
