import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

import { ApiService } from './api.service';
import { HttpClientModule, HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { IPage } from '../models/page.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
    });
    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user details', () => {
    const mockUserDetails = {
      id: 1,
      name: 'Test',
      email: 'test.@example.com',
    };
    service.getUserDetails().subscribe(userDetails => {
      expect(userDetails).toEqual(mockUserDetails);
    });
    const req = httpTestingController.expectOne(`${environment.BE_URL}/api/me`);
    expect(req.request.method).toBe('GET');

    req.flush(mockUserDetails);
  });

  it('should log out the user', () => {
    const mockResponse = { success: true };

    service.logOut().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(`${environment.BE_URL}/logout`);
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should return true if user details are present', () => {
    const mockUserDetails = { id: 1, name: 'John Doe' };

    spyOn(service, 'getUserDetails').and.returnValue(of(mockUserDetails));

    service.isAuthenticated().subscribe(isAuthenticated => {
      expect(isAuthenticated).toBeTrue();
    });
  });

  it('should return false if user details are not present', () => {
    spyOn(service, 'getUserDetails').and.returnValue(of(null));

    service.isAuthenticated().subscribe(isAuthenticated => {
      expect(isAuthenticated).toBeFalse();
    });
  });

  it('should return false if getUserDetails throws an error', () => {
    spyOn(service, 'getUserDetails').and.returnValue(
      throwError(() => new Error('error'))
    );
    service.isAuthenticated().subscribe(isAuthenticated => {
      expect(isAuthenticated).toBeFalse();
    });
  });

  it('should return instances by status', () => {
    const mockResponse: IPage<any> = {
      content: [
        { id: 1, status: 'ACTIVE' },
        { id: 2, status: 'INACTIVE' },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 0,
    };

    const queryParams = { status: 'ACTIVE', page: 0, size: 10 };
    service.getInstancesByStatus(queryParams).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(request => {
      return (
        request.method === 'GET' &&
        request.url === `${service['apiUrl']}/workflowinstance` &&
        request.params.get('status') === 'ACTIVE' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10'
      );
    });

    req.flush(mockResponse);
  });

  it('should handle error response', () => {
    service.getInstancesByStatus({}).subscribe({
      next: () => fail('expected an error, not instances'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error).toBe('Server Error');
      },
    });

    const req = httpTestingController.expectOne(request => {
      return (
        request.method === 'GET' &&
        request.url === `${service['apiUrl']}/workflowinstance`
      );
    });

    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  // it('should return workflows', () => {
  //   const mockResponse: IPage<any> = {
  //     content: [
  //       { id: 1, name: 'Workflow 1' },
  //       { id: 2, name: 'Workflow 2' },
  //     ],
  //     totalElements: 2,
  //     totalPages: 1,
  //     size: 10,
  //     number: 0,
  //     numberOfElements: 0,
  //   };

  //   const queryParams = { status: 'ACTIVE', page: 0, size: 10 };

  //   service.getWorkflows(queryParams).subscribe(data => {
  //     expect(data).toEqual(mockResponse);
  //   });

  //   const req = httpTestingController.expectOne(request => {
  //     return (
  //       request.method === 'GET' &&
  //       request.url === `${service['apiUrl']}/workflow` &&
  //       request.params.get('status') === 'ACTIVE' &&
  //       request.params.get('page') === '0' &&
  //       request.params.get('size') === '10'
  //     );
  //   });

  //   req.flush(mockResponse);
  // });

  it('should return workflow instances with identifier', () => {
    const mockResponse: IPage<any> = {
      content: [
        { id: 1, name: 'Instance 1' },
        { id: 2, name: 'Instance 2' },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 0,
    };

    const queryParams = { status: 'ACTIVE', page: 0, size: 10 };
    const id = 123;
    const identifier = 'abc';

    service
      .getWorkflowInstances(queryParams, id, identifier)
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    const req = httpTestingController.expectOne(request => {
      return (
        request.method === 'GET' &&
        request.url === `${service['apiUrl']}/workflow/${id}/instances` &&
        request.params.get('status') === 'ACTIVE' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('identifier') === identifier
      );
    });

    req.flush(mockResponse);
  });

  it('should return workflow instances without identifier', () => {
    const mockResponse: IPage<any> = {
      content: [
        { id: 1, name: 'Instance 1' },
        { id: 2, name: 'Instance 2' },
      ],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 0,
    };

    const queryParams = { status: 'ACTIVE', page: 0, size: 10 };
    const id = 123;

    service.getWorkflowInstances(queryParams, id, null).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(request => {
      return (
        request.method === 'GET' &&
        request.url === `${service['apiUrl']}/workflow/${id}/instances` &&
        request.params.get('status') === 'ACTIVE' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        !request.params.has('identifier')
      );
    });

    req.flush(mockResponse);
  });

  it('should handle error response', () => {
    const queryParams = { status: 'ACTIVE', page: 0, size: 10 };
    const id = 123;
    const identifier = 'abc';

    service.getWorkflowInstances(queryParams, id, identifier).subscribe({
      next: () => fail('expected an error, not workflow instances'),
      error: error => {
        expect(error.status).toBe(500);
        expect(error.error).toBe('Server Error');
      },
    });

    const req = httpTestingController.expectOne(request => {
      return (
        request.method === 'GET' &&
        request.url === `${service['apiUrl']}/workflow/${id}/instances` &&
        request.params.get('status') === 'ACTIVE' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10' &&
        request.params.get('identifier') === identifier
      );
    });

    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should return workflow instance details', () => {
    const mockResponse = { id: 1, name: 'Instance 1', status: 'ACTIVE' };

    const id = 1;

    service.getWorkflowInstanceDetails(id).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflowinstance/${id}`
    );
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should update the workflow successfully', () => {
    const workflowId = 1;
    const mockWorkflow = {
      name: 'Updated Workflow',
      description: 'Updated Description',
    };
    const mockResponse = { success: true };

    service.updateWorkflow(workflowId, mockWorkflow).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflow/${workflowId}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockWorkflow);

    req.flush(mockResponse);
  });

  it('should handle error response when updating workflow', () => {
    const workflowId = 1;
    const mockWorkflow = {
      name: 'Updated Workflow',
      description: 'Updated Description',
    };

    service.updateWorkflow(workflowId, mockWorkflow).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflow/${workflowId}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockWorkflow);

    req.flush('Error updating workflow', {
      status: 500,
      statusText: 'Server Error',
    });
  });

  it('should get artifacts successfully', () => {
    const id = 123;
    const mockResponse = { content: ['artifact1', 'artifact2'] };

    service.getArtifacts(id).subscribe(artifacts => {
      expect(artifacts).toEqual(mockResponse.content);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflowinstance/${id}/artifacts`
    );
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should get logs for an instance successfully', () => {
    const id = 123;
    const mockLogs = 'Log entry 1\nLog entry 2\nLog entry 3';

    service.getLogsForInstance(id).subscribe(logs => {
      expect(logs).toBe(mockLogs);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflowinstance/${id}/logs`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');

    req.flush(mockLogs);
  });

  it('should download artifact as a blob successfully', () => {
    const artifactId = 123;
    const mockBlob = new Blob(['mock data'], {
      type: 'application/octet-stream',
    });

    service.downloadArtifact(artifactId).subscribe(blob => {
      expect(blob).toBeInstanceOf(Blob);
      blob.text().then(text => {
        expect(text).toBe('mock data');
      });
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/artifact/${artifactId}`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');

    req.flush(mockBlob);
  });

  // it('should update workflow instance status', () => {
  //   const instanceId = 123;
  //   const status = 'ACTIVE';
  //   const mockResponse = { success: true };

  //   service
  //     .updateWorkflowInstanceStatus(instanceId, status)
  //     .subscribe(response => {
  //       expect(response).toEqual(mockResponse);
  //     });

  //   const req = httpTestingController.expectOne(
  //     req =>
  //       req.method === 'PUT' &&
  //       req.url === `${service['apiUrl']}/workflowinstance/${instanceId}` &&
  //       req.params.get('status') === status
  //   );

  //   expect(req.request.method).toBe('PUT');
  //   expect(req.request.url).toBe(
  //     `${service['apiUrl']}/workflowinstance/${instanceId}`
  //   );
  //   expect(req.request.params.get('status')).toBe(status);
  //   expect(req.request.body).toBeNull();

  //   req.flush(mockResponse);
  // });

  it('should retrieve a workflow by ID', () => {
    const workflowId = 123;
    const mockWorkflow = { id: workflowId, name: 'Test Workflow' };

    service.getWorkflowById(workflowId).subscribe(data => {
      expect(data).toEqual(mockWorkflow);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/workflow/${workflowId}`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockWorkflow);
  });

  it('should retrieve emails by workflow ID', () => {
    const workflowId = 123;
    const mockEmails = [
      { id: 1, email: 'test1@example.com' },
      { id: 2, email: 'test2@example.com' },
    ];

    service.getEmailsByWorkflowId(workflowId).subscribe(data => {
      expect(data).toEqual(mockEmails);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/email/workflow/${workflowId}`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockEmails);
  });

  it('should delete an email by ID and return success message', () => {
    const emailId = 456;
    const mockResponse = 'Email deleted successfully';

    service.deleteEmailById(emailId).subscribe(response => {
      expect(response).toBe(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/email/${emailId}`
    );

    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should add an email and return success response', () => {
    const emailId = 123;
    const bodyParams = { subject: 'Test Subject', body: 'Test Body' };
    const mockResponse = { success: true };

    service.addEmail(emailId, bodyParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/email/${emailId}`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(bodyParams);
    req.flush(mockResponse);
  });

  it('should add a template and return success response', () => {
    const bodyParams = { name: 'Template Name', content: 'Template Content' };
    const mockResponse = { success: true };

    service.addTemplate(bodyParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/template`
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(bodyParams);
    req.flush(mockResponse);
  });

  it('should update an email and return success response', () => {
    const emailId = 123;
    const bodyParams = { subject: 'Updated Subject', body: 'Updated Body' };
    const mockResponse = { success: true };

    service.updateEmail(emailId, bodyParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/email/${emailId}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(bodyParams);
    req.flush(mockResponse);
  });

  it('should get workflow steps and return success response', () => {
    const workflowId = 1;
    const queryParams = { page: 0, size: 10 };
    const mockResponse: IPage<any> = {
      content: [{ step: 'Step 1' }, { step: 'Step 2' }],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 0,
    };

    service
      .getWorkflowSteps(workflowId.toString(), queryParams)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const params = new HttpParams({ fromObject: queryParams });
    const req = httpTestingController.expectOne(req => {
      return (
        req.url === `${service['apiUrl']}/workflow/${workflowId}/steps` &&
        req.params.toString() === params.toString()
      );
    });
    expect(req.request.method).toBe('GET');
    expect(req.request.params.toString()).toBe(
      new HttpParams({ fromObject: queryParams }).toString()
    );
    req.flush(mockResponse);
  });

  // it('should get templates by step id and return success response', () => {
  //   const stepId = 1;
  //   const queryParams = { page: 0, size: 10 };
  //   const mockResponse: IPage<any> = {
  //     content: [{ template: 'Template 1' }, { template: 'Template 2' }],
  //     totalElements: 2,
  //     totalPages: 1,
  //     size: 10,
  //     number: 0,
  //     numberOfElements: 2,
  //   };

  //   service.getTemplatesByTemplateId(stepId, queryParams).subscribe(response => {
  //     expect(response).toEqual(mockResponse);
  //   });

  //   const params = new HttpParams({ fromObject: queryParams });
  //   const req = httpTestingController.expectOne(
  //     req =>
  //       req.url === `${service['apiUrl']}/template/${stepId}/history` &&
  //       req.params.toString() === params.toString()
  //   );
  //   expect(req.request.method).toBe('GET');
  //   req.flush(mockResponse);
  // });

  it('should get templates by template id and return success response', () => {
    const templateId = 1;
    const queryParams = { page: 0, size: 10 };
    const mockResponse: IPage<any> = {
      content: [{ version: 'v1.0' }, { version: 'v1.1' }],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 2,
    };

    service
      .getTemplatesByTemplateId(templateId, queryParams)
      .subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

    const params = new HttpParams({ fromObject: queryParams });
    const req = httpTestingController.expectOne(
      req =>
        req.url === `${service['apiUrl']}/template/${templateId}/versions` &&
        req.params.toString() === params.toString()
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get all templates and return success response', () => {
    const queryParams = { page: 0, size: 10 };
    const mockResponse: IPage<any> = {
      content: [{ template: 'Template A' }, { template: 'Template B' }],
      totalElements: 2,
      totalPages: 1,
      size: 10,
      number: 0,
      numberOfElements: 2,
    };

    service.getAllTemplates(queryParams).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const params = new HttpParams({ fromObject: queryParams });
    const req = httpTestingController.expectOne(
      req =>
        req.url === `${service['apiUrl']}/template` &&
        req.params.toString() === params.toString()
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a template and return success response', () => {
    const templateId = 1;
    const template = { name: 'Updated Template', content: 'Updated Content' };
    const mockResponse = { success: true };

    service.updateTemplate(templateId, template).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne(
      `${service['apiUrl']}/template/${templateId}`
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(template);
    req.flush(mockResponse);
  });
});
