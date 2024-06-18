import { Component, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

// CORE
import { SpinnerService } from 'src/app/services/spinner.service';
import { ApiService } from 'src/app/services/api.service';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  standalone: true,
  selector: 'bmg-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [ApiService],
  imports: [CommonModule],
})
export class AccountInfoComponent implements OnInit {
  user: any;
  selectedTabIndex = 0;
  tabContentHeight = window.innerHeight - 220;
  userDataLoaded: boolean = false;
  userAuthorities: string[] = [];

  private destroyed$ = new Subject<void>();

  constructor(
    private spinnerService: SpinnerService,

    private apiService: ApiService,

    private bsModalRef: BsModalRef
  ) {}

  public ngOnInit(): void {
    this.spinnerService.show();
    this.getAccountInfo();
  }

  getAccountInfo() {
    this.apiService
      .getUserDetails()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: data => {
          this.user = data;
          this.userDataLoaded = true;
          console.log(this.user);
          if (this.user.authorities) {
            this.user.authorities.forEach((role: any) => {
              if (role.hasOwnProperty('authority')) {
                this.userAuthorities.push(role.authority);
              }
            });
          }
          console.log(this.userAuthorities);
          this.spinnerService.hide();
        },
        error: () => {
          this.userDataLoaded = true;
          this.spinnerService.hide();
        },
      });
  }

  public closeModal(isSuccess: boolean): void {
    this.bsModalRef.hide();
  }
}
