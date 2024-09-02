import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { environment } from 'src/environments/environment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const mockBeUrl = 'https://mock-url.com';

  beforeEach(async () => {
    Object.defineProperty(environment, 'BE_URL', {
      value: mockBeUrl,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginUrl with environment BE_URL', () => {
    const expectedUrl =
      `${environment.BE_URL}/oauth2/authorization/okta` ||
      window.location.origin;
    component.ngOnInit();
    expect(component.loginUrl).toBe(expectedUrl);
  });
});
