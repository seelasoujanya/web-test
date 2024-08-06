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

@Component({
  selector: 'app-workflow-general',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule, ReactiveFormsModule],
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

  newEmailData = {
    name: '',
    email: '',
    status: null,
  };

  isEditing: boolean = false;

  emailId: number | undefined;

  isUpdate: boolean = false;

  headings: string[] = ['S.NO', 'EMAIL ID', 'NAME', 'EMAIL TYPE', 'ACTIONS'];

  constructor(
    private modalService: BsModalService,
    private bsModalRef: BsModalRef
  ) {}

  ngOnInit(): void {}

  public editWorkflow() {
    this.isEditing = true;
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
      description: `Are you sure you want to delete Email:${email} ?`,
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
}
