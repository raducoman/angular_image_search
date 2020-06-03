import {Component, HostListener, OnInit} from '@angular/core';
import {debounce, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {FlickrService, Photo} from "@app/home/flickr.service";
import {FormControl} from "@angular/forms";
import {timer} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  isLoading = false;
  imageList: Photo[] = [];
  searchText = new FormControl();

  pageYOffset: number = 0;
  screenHeight: number = 0;
  photoReferenceHeight: number = 0;

  @HostListener('window:scroll')
  setScrollHeight() {
    this.pageYOffset = window.pageYOffset;
  }

  @HostListener('window:resize')
  setScreenSize() {
    this.screenHeight = window.innerHeight;
    this.photoReferenceHeight = window.innerWidth / 6 + 16;
  }

  constructor(private flickrService: FlickrService) {
  }

  ngOnInit() {
    this.setScreenSize();
    // on search text change this is triggered
    this.searchText.valueChanges.pipe(
      debounce(() => timer(1000)),
      distinctUntilChanged(),
      switchMap((input: string) => {
        return this.searchFlickr(input);
      })
    ).subscribe();
    this.searchFlickr('');
  }

  /*
  * input = text to be search for
  * concatenate = is used for infinite scroll, to concatenate results
  * */
  searchFlickr(input: string, concatenate: boolean = false): Promise<void> {
    if (!concatenate) {
      this.isLoading = true;
    }
    return this.flickrService.search(input).toPromise()
      .then(response => {
        if (!concatenate) {
          this.imageList = response;
          this.isLoading = false;
        } else {
          this.imageList = this.imageList.concat(response);
        }
      })
  }

  /*
  * index = the index of the photo
  */
  photoIsInView(index: number): boolean {
    // the calculations needs more refinements and get read of hardcoded numbers
    const bufferHeight = 600;
    const elementPosition = 100 + (index * this.photoReferenceHeight / 3);
    const bottomLimit = this.pageYOffset - this.photoReferenceHeight - bufferHeight;
    const topLimit = this.pageYOffset + this.screenHeight + bufferHeight;
    return bottomLimit < elementPosition && elementPosition < topLimit;
  }

  onScroll() {
    this.searchFlickr(this.searchText.value, true);
  }
}
