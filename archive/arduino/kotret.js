function movingAverage(numbers, windowSize) {
  if (numbers.length < windowSize || windowSize <= 0) {
      throw new Error("Invalid window size or array length");
  }

  const result = [];

  for (let i = 0; i <= numbers.length - windowSize; i++) {
      const window = numbers.slice(i, i + windowSize);
      const average = window.reduce((sum, num) => sum + num, 0) / windowSize;
      result.push(average);
  }

  return result;
}

// Example usage:
const data = [1, 2, 3, NaN, 5, 6, 7, 8, 9, 10];
const windowSize = 3;
const result = movingAverage(data, windowSize);

console.log(result); // Output: [2, 3, 4, 5, 6, 7, 8, 9]
