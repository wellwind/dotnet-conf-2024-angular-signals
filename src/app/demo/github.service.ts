import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GitHubRepoSearchResult, SearchParams } from './github.interface';

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private baseUrl = 'https://api.github.com/search/repositories';
  private http = inject(HttpClient);

  searchRepos(searchParams: SearchParams): Observable<GitHubRepoSearchResult> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('q', searchParams.q);
    url.searchParams.append('page', searchParams.page);
    url.searchParams.append('per_page', searchParams.per_page);
    url.searchParams.append('sort', searchParams.sort);
    url.searchParams.append('order', searchParams.order);

    // put your token here
    const token = '';

    return this.http.get<GitHubRepoSearchResult>(url.toString(), {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
  }
}
