import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { ElementRef } from '@angular/core';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.pages).toEqual([]);
    expect(component.currentPage).toBe(1);
    expect(component.pageStart).toBe(1);
    expect(component.pageItemsLimit).toBe(5);
  });

  it('should set pages correctly when totalPages is less than pageItemsLimit', () => {
    component.page = { totalPages: 3, number: 0 };
    fixture.detectChanges();
    expect(component.pages).toEqual([1, 2, 3]);
  });

  it('should set pages correctly when totalPages is greater than pageItemsLimit', () => {
    component.page = { totalPages: 10, number: 0 };
    fixture.detectChanges();
    expect(component.pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('should emit paginationEvent on gotoPage', () => {
    spyOn(component.paginationEvent, 'emit');
    component.totalPages = 10;
    component.gotoPage(2);
    expect(component.paginationEvent.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit paginationEvent if pageNumber is invalid', () => {
    spyOn(component.paginationEvent, 'emit');
    component.totalPages = 10;
    component.gotoPage(11);
    expect(component.paginationEvent.emit).not.toHaveBeenCalled();
  });

  it('should handle "f" event type correctly', () => {
    component.page = { totalPages: 10, number: 0 };
    component.eventType = 'f';
    fixture.detectChanges();

    expect(component.pageStart).toBe(1);
  });

  it('should handle "l" event type correctly', () => {
    component.page = { totalPages: 10, number: 0 };
    component.eventType = 'l';
    fixture.detectChanges();
    expect(component.pageStart).toBe(1);
  });

  it('should handle "i" event type correctly', () => {
    component.page = { totalPages: 10, number: 1 };
    component.eventType = 'i';
    fixture.detectChanges();
    expect(component.pageStart).toBe(1);
  });

  it('should handle page number equal to totalPages in gotoPage', () => {
    spyOn(component.paginationEvent, 'emit');
    component.totalPages = 10;
    component.gotoPage(10);
    expect(component.paginationEvent.emit).toHaveBeenCalledWith(10);
  });
});
