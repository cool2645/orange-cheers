declare module 'wordpress' {
  export interface AvatarURLs {
    96: string;
  }

  export interface Comment {
    id: number;
    parent: number;
    children: Comment[];
    author_name: string;
    author_avatar_urls: AvatarURLs;
    author_url: string;
    date: string;
    date_gmt: string;
    content: IContent;

    replyFocus: boolean;
  }
}
