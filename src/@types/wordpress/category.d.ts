declare module 'wordpress' {
  export interface Category {
    id: number;
    name: string;
    slug: string;
    count: number;
  }
}
