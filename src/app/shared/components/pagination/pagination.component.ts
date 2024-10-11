import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SpinnerService } from 'src/app/core/services/spinner.service';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  public pages: number[] = [];
  public currentPage = 1;
  public pageStart = 1;
  public eventType: any;
  public totalPages: any;
  public pageItemsLimit = 5;

  @Input()
  public set page(page: any) {
    this.spinnerService.hide();
    if (page) {
      this.totalPages = page.totalPages;
      this.currentPage = page.number + 1;

      const limit = this.pageItemsLimit - 1;

      if (this.totalPages > this.pageItemsLimit) {
        const halfLimit = Math.floor(this.pageItemsLimit / 2);

        if (this.currentPage <= halfLimit + 1) {
          this.pageStart = 1;
        } else if (this.currentPage >= this.totalPages - halfLimit) {
          this.pageStart = this.totalPages - limit;
        } else {
          this.pageStart = this.currentPage - halfLimit;
        }

        this.pages = Array.from(
          { length: this.pageItemsLimit },
          (_, i) => i + this.pageStart
        );
      } else {
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }
    }
  }

  @Output()
  public paginationEvent = new EventEmitter<number>();

  constructor(private spinnerService: SpinnerService) {}

  gotoPage(pageNumber: number, eventType?: string): void {
    if (
      pageNumber &&
      pageNumber !== this.currentPage &&
      pageNumber <= this.totalPages &&
      pageNumber > 0
    ) {
      this.eventType = eventType;
      this.paginationEvent.emit(pageNumber);
      this.spinnerService.show();
    }
  }
}
