import {Injectable} from "@angular/core";
import {HttpClient} from '@angular/common/http';
import {environment} from "@env/environment";
import {map} from 'rxjs/operators';

export interface FlickrPhoto {
  farm: string;
  id: string;
  secret: string;
  server: string;
  title: string;
}

export interface FlickrOutput {
  photos: {
    photo: FlickrPhoto[];
  };
}

export interface Photo {
  url: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class FlickrService {
  prevKeyword: string;
  currPage = 1;

  constructor(private http: HttpClient) {
  }

  search(keyword: string) {
    if (this.prevKeyword === keyword) {
      this.currPage++;
    } else {
      this.currPage = 1;
    }
    this.prevKeyword = keyword;

    let url = 'https://www.flickr.com/services/rest/?';
    let params = `api_key=${environment.flickr_key}&format=json&nojsoncallback=1&per_page=12&page=${this.currPage}`;
    if (keyword) {
      params += `&text=${keyword}`;
      url += 'method=flickr.photos.search&';
    } else {
      url += 'method=flickr.photos.getRecent&';
    }

    return this.http.get(url + params).pipe(map((response: FlickrOutput) => {
      const photos: Photo[] = [];
      response.photos.photo.forEach((flickrPhoto: FlickrPhoto) => {
        const photoObj = {
          url: `https://farm${flickrPhoto.farm}.staticflickr.com/${flickrPhoto.server}/${flickrPhoto.id}_${flickrPhoto.secret}`,
          title: flickrPhoto.title
        };
        photos.push(photoObj);
      });
      return photos;
    }));
  }
}
