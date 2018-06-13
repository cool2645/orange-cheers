declare module 'wordpress' {
  export interface AvatarURLs {
    24: string;
    48: string;
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
    content: Content;

    replyFocus: boolean;
  }
}
