import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AboutComponent } from './about/about.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/core/services/api.service';
import { TimeFormatService } from 'src/app/time-format.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterLink,
    RouterLinkActive,
    DialogComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [ApiService, BsModalService],
})
export class HeaderComponent {
  selectedMenu: string | undefined;

  isUTC = false;

  modalRef: BsModalRef | undefined;

  constructor(
    private modalService: BsModalService,
    private apiService: ApiService,
    private router: Router,
    private timeFormatService: TimeFormatService
  ) {}

  ngOnInit() {
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }

  toggleTimeFormat() {
    this.timeFormatService.toggleTimeFormat();
  }

  public selectMenu(event: Event, menuType: string) {
    if (this.selectedMenu === menuType) {
      this.selectedMenu = '';
    } else {
      this.selectedMenu = menuType;
    }
  }

  public showAbout(exampleTemplate: TemplateRef<any>): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.modalRef = this.modalService.show(AboutComponent, config);
  }

  public async logout(): Promise<void> {
    var myWindow = window.open(
      environment.logout_URL,
      '',
      'width=100,height=100'
    );

    setTimeout(() => {
      myWindow?.close();
    }, 1000);
    await firstValueFrom(this.apiService.logOut());
    this.router.navigateByUrl('/login');
  }

  public account_info(): void {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
      class: 'modal-lg',
    };
    this.modalRef = this.modalService.show(AccountInfoComponent, config);
  }
}
