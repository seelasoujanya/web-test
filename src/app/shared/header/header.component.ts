import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { AccountInfoComponent } from './account-info/account-info.component';
import { AboutComponent } from './about/about.component';
import { ApiService } from 'src/app/services/api.service';
import { DialogComponent } from 'src/app/dialog/dialog/dialog.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // RouterOutlet,
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

  modalRef: BsModalRef | undefined;

  constructor(
    private modalService: BsModalService,
    private apiService: ApiService,
    private router: Router
  ) {}

  public selectMenu(event: Event, menuType: string) {
    if (this.selectedMenu === menuType) {
      this.selectedMenu = '';
    } else {
      this.selectedMenu = menuType;
    }
  }

  public showAbout(exampleTemplate: TemplateRef<any>): void {
    this.modalRef = this.modalService.show(AboutComponent);
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
    // await this.apiService.logOut().toPromise();
    this.router.navigateByUrl('/login');
  }

  public account_info(): void {
    this.modalRef = this.modalService.show(AccountInfoComponent);
  }
}
