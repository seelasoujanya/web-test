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
        if (this.eventType) {
          switch (this.eventType) {
            case 'f':
              this.pageStart = 1;
              break;
            case 'l':
              this.pageStart = this.totalPages - limit;
              break;
            case 'n':
              if (this.pageStart + limit < this.currentPage)
                this.pageStart = this.pageStart + 1;
              break;
            case 'p':
              if (this.pageStart > this.currentPage)
                this.pageStart = this.pageStart - 1;
              break;
            case 'i':
              this.pageStart = this.currentPage;
              if (this.currentPage + limit > this.totalPages)
                this.pageStart = this.totalPages - limit;
              break;
            default:
            // code block
          }
        }
        this.pages = Array(this.pageItemsLimit)
          .fill(0)
          .map((x, i) => i + this.pageStart);
      } else {
        this.pages = Array(Math.min(this.pageItemsLimit, this.totalPages))
          .fill(0)
          .map((x, i) => i + 1);
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
