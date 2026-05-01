import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { Sidebar } from './sidebar/sidebar';
import { SkeletonBlog } from './skeleton-blog/skeleton-blog';
import { environment } from '../../../environments/environment';
import { Breadcrumb } from '../../shared/components/widgets/breadcrumb/breadcrumb';
import { NoData } from '../../shared/components/widgets/no-data/no-data';
import { Pagination } from '../../shared/components/widgets/pagination/pagination';
import { IBlog, IBlogModel } from '../../shared/interface/blog.interface';
import { IBreadcrumb } from '../../shared/interface/breadcrumb.interface';
import { IOption } from '../../shared/interface/theme-option.interface';
import { BlogService } from '../../shared/services/blog.service';
import { GetBlogsAction } from '../../shared/store/action/blog.action';
import { BlogState } from '../../shared/store/state/blog.state';
import { ThemeOptionState } from '../../shared/store/state/theme-option.state';

@Component({
  selector: 'app-blog',
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    Sidebar,
    Breadcrumb,
    NoData,
    SkeletonBlog,
    Pagination,
  ],
  templateUrl: './blog.html',
  styleUrl: './blog.scss',
})
export class Blog {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  blogService = inject(BlogService);
  private router = inject(Router);

  blog$: Observable<IBlogModel> = inject(Store).select(BlogState.blog) as Observable<IBlogModel>;
  themeOption$: Observable<IOption> = inject(Store).select(
    ThemeOptionState.themeOptions,
  ) as Observable<IOption>;

  public breadcrumb: IBreadcrumb = {
    title: 'Blogs',
    items: [{ label: 'Blogs', active: true }],
  };

  public filter = {
    page: 1,
    paginate: 12,
    status: 1,
    category: '',
    tag: '',
  };

  public skeletonItems = Array.from({ length: 9 }, (_, index) => index);
  public totalItems: number = 0;
  public blogsArray: IBlog[];
  public paginateBlog: IBlog[];

  public style: string = 'grid_view';        // ✅ default
  public sidebar: string = 'no_sidebar';     // ✅ default
  public StorageURL = environment.storageURL;

  constructor() {

    // ✅ Handle query params (optional, but not required)
    this.route.queryParams.subscribe(params => {

      this.filter.page = params['page'] ? +params['page'] : 1;
      this.filter.category = params['category'] ?? '';
      this.filter.tag = params['tag'] ?? '';

      // ✅ Defaults if not provided
      this.style = params['style'] ?? 'grid_view';
      this.sidebar = params['sidebar'] ?? 'no_sidebar';

      // ✅ Breadcrumb update
      this.breadcrumb.title = this.filter.category
        ? `Blogs: ${this.filter.category.replaceAll('-', ' ')}`
        : this.filter.tag
        ? `Blogs: ${this.filter.tag.replaceAll('-', ' ')}`
        : 'Blogs';

      // ✅ Load blogs
      this.store.dispatch(new GetBlogsAction(this.filter));
    });

    this.blog$.subscribe(blog => {
      this.totalItems = blog?.total;

      this.blogsArray = blog?.data || [];
      this.paginateBlog = this.blogsArray.slice(
        (this.filter.page - 1) * this.filter.paginate,
        (this.filter.page - 1) * this.filter.paginate + this.filter.paginate
      );
    });
  }

  // ✅ Pagination WITHOUT changing URL
  setPaginate(page: number) {
    this.filter.page = page;
    this.store.dispatch(new GetBlogsAction(this.filter));

    // Update local pagination only
    this.paginateBlog = this.blogsArray.slice(
      (this.filter.page - 1) * this.filter.paginate,
      (this.filter.page - 1) * this.filter.paginate + this.filter.paginate
    );
  }
}