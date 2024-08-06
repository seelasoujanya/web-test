import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
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

  @ViewChild('pageInput') pageInput!: ElementRef;

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
              this.pageInput.nativeElement.value = '';
              break;
            case 'l':
              this.pageStart = this.totalPages - limit;
              this.pageInput.nativeElement.value = '';
              break;
            case 'n':
              this.pageInput.nativeElement.value = '';
              if (this.pageStart + limit < this.currentPage)
                this.pageStart = this.pageStart + 1;
              break;
            case 'p':
              this.pageInput.nativeElement.value = '';
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
      console.log(pageNumber);
      this.eventType = eventType;
      this.paginationEvent.emit(pageNumber);
      this.spinnerService.show();
    }
  }

  gotoInputPage(): void {
    try {
      const pageIn = parseInt(this.pageInput.nativeElement.value);
      if (pageIn && pageIn <= this.totalPages && pageIn > 0) {
        this.gotoPage(pageIn, 'i');
      } else this.pageInput.nativeElement.value = '';
    } catch (e) {}
  }
}
