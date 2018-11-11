const getElementTop = (element: HTMLElement | null): number => {
  if (element === null) return 0;
  let actualTop = element.offsetTop;
  let current = element.offsetParent;
  while (current !== null) {
    actualTop += (current as HTMLElement).offsetTop;
    current = (current as HTMLElement).offsetParent;
  }
  return actualTop;
};

const scrollToTop = () => {
  let currentY = document.documentElement.scrollTop || document.body.scrollTop;
  const needScrollTop = 0 - currentY;
  setTimeout(() => {
    currentY += Math.ceil(needScrollTop / 10);
    window.scrollTo(0, currentY);
    if (needScrollTop > 10 || needScrollTop < -10) {
      scrollToTop();
    } else {
      window.scrollTo(0, 0);
    }
  }, 1);
};

export { getElementTop, scrollToTop };
