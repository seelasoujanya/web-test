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

  newEmailData = {
    name: '',
    email: '',
    status: null,
  };

  isEditing: boolean = false;

  emailId: number | undefined;

  isUpdate: boolean = false;

  headings: string[] = ['S.NO', 'EMAIL ID', 'NAME', 'EMAIL TYPE', 'ACTIONS'];

  currentSort: 'asc' | 'desc' = 'asc';

  selectedHeading: string | undefined;

  constructor(
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {}

  public toggleEditing() {
    this.isEditing = !this.isEditing;
  }

  public saveWorkflowChanges() {
    const modalData = {
      title: 'Confirm Changes',
      description: `Are you sure you want to Save changes  for Workflow?`,
      btn1Name: 'CONFIRM',
      btn2Name: 'CANCEL',
    };
    this.openConfirmModal(modalData, 'general');
    this.isEditing = false;
  }

  public cancelChanges() {
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
          this.updateWorkflowEvent.emit(this.workflowCopy);
        } else {
          const emailData = {
            emailId: this.emailId,
            action: 'DELETE',
          };
          this.workflowEmailEvent.emit(emailData);
        }
      } else {
        this.cancelChanges();
      }
    });
  }

  addEmail() {
    this.bsModalRef.hide();
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
    this.reset();
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
      !this.newEmailData.email ||
      !this.newEmailData.name ||
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
