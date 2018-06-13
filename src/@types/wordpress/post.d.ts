declare module 'wordpress' {
    export interface Post {
    id: number;
    title: Content;
    categories: number[];
    tags: number[];
    date: string;
    date_gmt: string;
    modified: string;
    modified_gmt: string;
    slug: string;
    excerpt: Content;
    content: Content;
    comment_status: string;
  }
}