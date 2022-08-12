const getRandomNumber = (low: number, high: number) => Math.floor(Math.random()*(high - low)) + low;

export const generateRandomeColor = (): string => {
  const LOW = 125;
  const HIGH = 255;
  return `rgb(${getRandomNumber(LOW, HIGH)},${getRandomNumber(LOW, HIGH)},${getRandomNumber(LOW, HIGH)})`
}

const JAWS_CHANGE = 100;

export let getJawsColor = (color) => {
  const colors = color.substring(4, color.length - 1).split(",").map(s => Number(s) - JAWS_CHANGE);
  return `rgb(${colors.join(",")})`;
}

export const revertJawsColor = (color: string): string => {
  const colors = color.substring(4, color.length - 1).split(",").map(s => Number(s) + JAWS_CHANGE);
  return `rgb(${colors.join(",")})`;
}