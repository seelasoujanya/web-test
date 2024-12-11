import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EMAIL_STATUS, WORKFLOW_STATUS } from 'src/app/core/utils/constants';
import { ConfirmModalComponent } from 'src/app/shared/components/confirm-modal/confirm-modal.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ApiService } from 'src/app/core/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-workflow-general',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    TooltipModule,
  ],
  templateUrl: './workflow-general.component.html',
  styleUrl: './workflow-general.component.scss',
  providers: [BsModalService],
})
export class WorkflowGeneralComponent implements OnInit {
  workflowStatus = WORKFLOW_STATUS;

  emailStatus = EMAIL_STATUS;

  AssetIngestionWaitTime: string = '';
  DataIngestionWaitTime: string = '';

  AssetIngestionWaitTimeError: string | undefined = '';
  DataIngestionWaitTimeError: string | undefined = '';
  copyUrl: string | undefined = '';
  copyUrlError: string | undefined = '';

  @Input()
  workflow: any;

  @Input()
  emails: any[] = [];

  @Input()
  workflowCopy: any;

  @Output()
  updateWorkflowEvent = new EventEmitter<any>();

  @Output()
  workflowEmailEvent = new EventEmitter<any>();

  @Output()
  public getSortParam = new EventEmitter<any>();

  headingEnum = {
    'EMAIL ID': 'email',
    NAME: 'name',
    'EMAIL TYPE': 'status',
    ACTIONS: '',
  };

  isEditing: boolean = false;

  emailId: number | undefined;

  isUpdate: boolean = false;

  headings: string[] = ['S.NO', 'EMAIL ID', 'NAME', 'EMAIL TYPE', 'ACTIONS'];

  currentSort: 'asc' | 'desc' = 'asc';

  selectedHeading: string | undefined;
  alias: any;

  newEmailData = {
    name: '',
    email: '',
    status: null,
    workflowId: null,
  };

  constructor(
    private modalService: BsModalService,
    private bsModalRef: BsModalRef,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const workflowId = this.route.snapshot.params['id'];
    this.initialConfigurations();
  }

  filterSpecialChars(event: KeyboardEvent) {
    const allowedChars = /[0-9h m]/;
    if (
      !allowedChars.test(event.key) &&
      event.key !== 'Backspace' &&
      event.key !== 'Tab'
    ) {
      event.preventDefault();
    }
  }

  initialConfigurations() {
    const workflowId = this.route.snapshot.params['id'];
    this.apiService.getWorkflowById(workflowId).subscribe((result: any) => {
      this.workflow = result;
      this.workflowCopy = JSON.parse(JSON.stringify(result));
      this.AssetIngestionWaitTime = this.workflowCopy
        ? this.formatMinutes(this.workflowCopy.assetIngestionTime)
        : '';
      this.DataIngestionWaitTime = this.workflowCopy
        ? this.formatMinutes(this.workflowCopy.dataIngestionTime)
        : '';
      this.copyUrl =
        this.workflowCopy.alias == null || this.workflowCopy.alias == ''
          ? ''
          : `${environment.BE_URL}/api/workflow/${this.workflowCopy.alias}/instance`;
      this.copyUrlError = '';
    });
  }

  isErrorMsg(): boolean {
    if (
      this.AssetIngestionWaitTimeError != '' ||
      this.DataIngestionWaitTimeError != '' ||
      this.copyUrlError != ''
    ) {
      return true;
    }
    return false;
  }

  validateWaitTime(value: string): boolean {
    const regex = /^(?:(\d+h)? ?(\d+m)?)$/;
    return regex.test(value.trim());
  }

  validateFields() {
    this.AssetIngestionWaitTimeError = '';
    this.DataIngestionWaitTimeError = '';

    if (
      this.AssetIngestionWaitTime &&
      !this.validateWaitTime(this.AssetIngestionWaitTime)
    ) {
      this.AssetIngestionWaitTimeError =
        'Please enter a valid time (eg: 1h 30m, 3m, 5h).';
    }
    if (
      this.DataIngestionWaitTime &&
      !this.validateWaitTime(this.DataIngestionWaitTime)
    ) {
      this.DataIngestionWaitTimeError =
        'Please enter a valid time (eg: 1h 30m, 3m, 5h).';
    }
  }

  addText() {
    if (this.workflowCopy.alias) {
      this.apiService
        .getWorkflowByAlias(this.workflowCopy.alias)
        .subscribe(data => {
          this.alias = data;
          if (
            this.alias != null &&
            !(this.alias.alias == this.workflow.alias)
          ) {
            this.copyUrlError =
              'The alias already exists. Please enter a different one';
            this.copyUrl = '';
          } else {
            this.copyUrlError = '';
            this.copyUrl = `${environment.BE_URL}/api/workflow/alias/${this.workflowCopy.alias}/instance`;
          }
        });
    } else {
      this.copyUrl = '';
    }
  }

  showCustom() {
    this.toastr.show('Copied!', '', {
      toastClass: 'custom-toast',
      positionClass: 'toast-bottom-center',
    });
  }

  copyText(url: any) {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showCustom();
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }

  public toggleEditing() {
    this.isEditing = !this.isEditing;
    if (this.isEditing == false) {
      this.AssetIngestionWaitTimeError = '';
      this.DataIngestionWaitTimeError = '';
      this.initialConfigurations();
      this.workflowCopy = JSON.parse(JSON.stringify(this.workflow));
    }
  }

  public saveWorkflowChanges() {
    const modalData = {
      title: 'Confirm Changes',
      description: `Are you sure you want to Save changes for General Settings?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    if (
      this.AssetIngestionWaitTimeError == '' &&
      this.DataIngestionWaitTimeError == ''
    ) {
      this.openConfirmModal(modalData, 'general');
    } else {
      this.isEditing = true;
    }
  }

  public cancelChanges() {
    this.initialConfigurations();
    this.AssetIngestionWaitTimeError = '';
    this.DataIngestionWaitTimeError = '';
    this.isEditing = false;
    this.workflowCopy = JSON.parse(JSON.stringify(this.workflow));
  }

  public checkThrottleLimit(input: any) {
    const throttleLimit = this.workflowCopy.throttleLimit;
    if (throttleLimit && throttleLimit > 100) {
      this.workflowCopy.throttleLimit = 100;
    }
  }

  public deleteEmail(id: any, email: string) {
    this.emailId = id;
    const modalData = {
      title: 'Delete Email',
      description: `Are you sure you want to delete Email:${email}?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData, 'email');
  }

  openConfirmModal(modalData: any, modalType: string) {
    this.bsModalRef = this.modalService.show(ConfirmModalComponent);
    this.bsModalRef.content.title = modalData.title;
    this.bsModalRef.content.description = modalData.description;
    this.bsModalRef.content.applyButton = modalData.btn1Name;
    this.bsModalRef.content.cancelButton = modalData.btn2Name;
    this.bsModalRef.content.updateChanges.subscribe((result: boolean) => {
      if (result) {
        if (modalType === 'general') {
          this.workflowCopy.assetIngestionTime = this.convertToMinutes(
            this.AssetIngestionWaitTime
          );
          this.workflowCopy.dataIngestionTime = this.convertToMinutes(
            this.DataIngestionWaitTime
          );
          this.updateWorkflowEvent.emit(this.workflowCopy);

          this.AssetIngestionWaitTime = this.workflowCopy
            ? this.formatMinutes(this.workflowCopy.assetIngestionTime)
            : '';
          this.DataIngestionWaitTime = this.workflowCopy
            ? this.formatMinutes(this.workflowCopy.dataIngestionTime)
            : '';

          this.isEditing = false;
        } else {
          const emailData = {
            emailId: this.emailId,
            action: 'DELETE',
          };
          this.workflowEmailEvent.emit(emailData);
        }
      }
    });
  }

  convertToMinutes(value: any): string {
    let totalMinutes = 0;
    const hoursMatch = value.match(/(\d+)h/);
    const minutesMatch = value.match(/(\d+)m/);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1], 10);
    }
    return `${totalMinutes}m`;
  }

  formatMinutes(totalMinutes: string) {
    totalMinutes =
      totalMinutes === null || totalMinutes === '' ? '0' : totalMinutes;
    const minutesValue = parseInt(totalMinutes, 10);

    const hours = Math.floor(minutesValue / 60);
    const minutes = minutesValue % 60;

    if (hours == 0 && minutes != 0) {
      return `${minutes}m`;
    } else if (hours != 0 && minutes == 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  addNewEmail(emailTemplate: TemplateRef<any>) {
    this.reset();
    this.openAddEmailDialog(emailTemplate);
  }

  addEmail() {
    this.bsModalRef.hide();
    this.newEmailData.workflowId = this.workflowCopy.id;
    let data;
    if (this.isUpdate) {
      data = {
        action: 'UPDATE',
        data: this.newEmailData,
        emailId: this.emailId,
      };
    } else {
      data = {
        action: 'CREATE',
        data: this.newEmailData,
      };
    }
    this.workflowEmailEvent.emit(data);
    // this.reset();
  }

  openAddEmailDialog(emailTemplate: TemplateRef<any>) {
    const config = {
      backdrop: true,
      ignoreBackdropClick: true,
      keyboard: false,
    };
    this.bsModalRef = this.modalService.show(emailTemplate, config);
  }

  public closeModal(): void {
    this.bsModalRef.hide();
  }

  public editEmail(email: any, emailTemplate: TemplateRef<any>) {
    this.isUpdate = true;
    this.emailId = email.id;
    this.newEmailData = JSON.parse(JSON.stringify(email));
    this.openAddEmailDialog(emailTemplate);
  }

  public cancelChangesForEmail() {
    this.closeModal();
    this.reset();
  }

  public reset() {
    this.isUpdate = false;
    this.emailId = undefined;
    this.newEmailData = {
      name: '',
      email: '',
      status: null,
      workflowId: null,
    };
  }

  get getBsModalRef(): BsModalRef {
    return this.bsModalRef;
  }

  isFieldsEmpty(): boolean {
    if (!this.newEmailData) {
      return true;
    }
    if (
      !this.newEmailData.email?.trim() ||
      !this.newEmailData.name?.trim() ||
      !this.newEmailData.status
    ) {
      return true;
    }
    return false;
  }

  sortColumn(heading: string) {
    this.selectedHeading = heading;
    this.currentSort = this.currentSort === 'asc' ? 'desc' : 'asc';
    this.getSortParam.emit({
      sortBy: this.headingEnum[heading as keyof typeof this.headingEnum],
      order: this.currentSort,
    });
    this.sortData();
  }

  sortData() {
    if (!this.selectedHeading) return;

    this.emails.sort((a, b) => {
      const valueA = (
        a[
          this.headingEnum[
            this.selectedHeading as keyof typeof this.headingEnum
          ]
        ] ?? ''
      ).toLowerCase();
      const valueB = (
        b[
          this.headingEnum[
            this.selectedHeading as keyof typeof this.headingEnum
          ]
        ] ?? ''
      ).toLowerCase();

      if (this.currentSort === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }
}
