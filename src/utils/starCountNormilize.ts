export const starCountNormilize = (stars: number): string => {
  if (stars < 1000) {
    return stars.toString();
  } else if (stars < 1000000) {
    const thousands = Math.floor(stars / 1000);
    const remainder = stars % 1000;
    const fraction = Math.round(remainder / 100);
    return `${thousands},${fraction}К`;
  } else {
    const millions = Math.floor(stars / 1000000);
    const remainder = stars % 1000000;
    const fraction = Math.round(remainder / 100000);
    return `${millions},${fraction}М`;
  }
};
