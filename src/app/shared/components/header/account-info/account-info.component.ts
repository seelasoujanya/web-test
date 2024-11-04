import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule, NgFor } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/core/services/api.service';
import { SpinnerService } from 'src/app/core/services/spinner.service';
import { FormsModule } from '@angular/forms';
import { TimeFormatService } from 'src/app/time-format.service';

@Component({
  standalone: true,
  selector: 'bmg-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
  providers: [ApiService],
  imports: [CommonModule, NgFor, FormsModule],
})
export class AccountInfoComponent implements OnInit {
  user: any;
  selectedTabIndex = 0;
  tabContentHeight = window.innerHeight - 220;
  userDataLoaded: boolean = false;
  userAuthorities: string[] = [];
  isUTC = false;

  private destroyed$ = new Subject<void>();

  constructor(
    private spinnerService: SpinnerService,
    private timeFormatService: TimeFormatService,

    private apiService: ApiService,

    private bsModalRef: BsModalRef
  ) {}

  public ngOnInit(): void {
    this.spinnerService.show();
    this.getAccountInfo();
    this.timeFormatService.isUTC$.subscribe(value => {
      this.isUTC = value;
    });
  }
  toggleTimeFormat() {
    this.timeFormatService.toggleTimeFormat();
  }

  getAccountInfo() {
    this.apiService
      .getUserDetails()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: data => {
          this.user = data;
          this.userDataLoaded = true;
          if (this.user.authorities) {
            this.user.authorities.forEach((role: any) => {
              this.userAuthorities.push(role);
            });
          }
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
