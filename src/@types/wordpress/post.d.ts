declare module 'wordpress' {
    export interface Post {
    id: number;
    title: IContent;
    categories: number[];
    tags: number[];
    date: string;
    date_gmt: string;
    modified: string;
    modified_gmt: string;
    slug: string;
    excerpt: IContent;
    content: IContent;
    comment_status: string;
    offset?: number;
    commentCount?: number;
  }
}