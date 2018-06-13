declare module 'typed.js' {
  export default class Typed {
    public strings: string[];
    public reset: () => void;
    public destroy: () => void;

    constructor(el: HTMLElement, b: object);
  }
}
