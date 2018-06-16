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

export { getElementTop };
