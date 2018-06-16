declare module 'wordpress' {
  export interface Tag {
    id: number;
    name: string;
    slug: string;
    count: number;
  }
}
