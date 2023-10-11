const a = [
  "8/6/2023 11:03",
  "8/6/2023 11:05",
  "8/6/2023 11:13",
  "8/6/2023 11:17",
  "8/6/2023 12:32",
  "8/6/2023 14:42",
  "8/6/2023 14:46",
  "9/6/2023 9:29",
  "9/6/2023 9:32",
  "9/6/2023 9:36",
  "9/6/2023 9:39",
  "9/6/2023 9:42",
  "9/6/2023 9:44",
  "9/6/2023 9:46",
  "9/6/2023 9:51",
  "12/6/2023 13:04",
  "12/6/2023 11:00",
  "12/6/2023 10:11",
  "12/7/2023 14:52",
  "12/7/2023 11:13",
  "12/7/2023 11:11",
  "12/7/2023 11:08",
  "11/7/2023 10:52",
  "10/7/2023 9:46",
  "10/7/2023 9:39",
  "10/7/2023 9:37",
  "10/7/2023 9:36",
  "7/7/2023 11:11",
  "4/7/2023 14:34",
  "6/7/2023 12:17",
  "4/9/2023 14:33",
  "1/9/23 14:33",
  "2/9/23 9:51",
  "2/9/23 10:42",
  "3/9/23 10:39",
  "3/9/23 12:14",
  "3/9/23 12:21",
  "4/9/23 12:44",
  "4/9/23 14:19",
  "5/9/23 9:06",
  "6/9/23 15:44",
  "7/9/23 13:05",
  "10/9/23 13:22",
  "11/9/23 13:45",
  "13/9/2023 13:45",
  "14/9/2023 11:13",
  "14/9/2023 13:20",
  "14/9/2023 14:15",
  "16/9/2023 10:18",
  "16/9/2023 13:54",
  "1/9/23 14:42",
  "3/9/23 13:59",
  "3/9/23 15:17",
  "4/9/23 12:17",
  "4/9/23 15:25",
  "7/9/23 12:12",
  "9/9/23 9:58",
  "9/9/23 12:40",
  "9/9/23 14:44",
  "12/9/23 9:18",
  "12/9/23 14:18",
  "13/9/2023 9:22",
  "14/9/2023 11:01",
  "14/9/2023 12:32",
  "14/9/2023 14:19",
  "14/9/2023 14:46",
  "14/9/2023 9:18",
  "14/9/2023 9:59",
  "15/9/2023 13:51",
  "16/9/2023 10:22",
  "16/9/2023 10:38",
  "5/9/23 10:26",
  "9/9/23 9:18",
  "9/9/23 9:35",
  "11/9/23 13:07",
  "12/9/23 14:39",
  "14/9/2023 11:02",
  "15/9/2023 14:22",
  "9/9/2023 13:33",
  "25/9/2023 14:12",
  "2/9/2023 13:42",
  "14/9/2023 12:13",
  "18/9/2023 12:32",
  "2/9/2023 11:19",
  "24/9/2023 14:53",
  "7/9/2023 13:21",
  "7/9/2023 12:44",
  "20/9/2023 14:24",
  "13/9/2023 13:21",
  "24/9/2023 12:33",
  "27/9/2023 12:15",
  "19/9/2023 11:59",
  "6/9/2023 12:56",
  "4/9/2023 10:18",
  "8/9/2023 9:52",
  "8/9/2023 9:17",
  "6/9/2023 10:16",
  "10/9/2023 9:10",
  "5/9/2023 9:20",
  "15/9/2023 13:54",
  "6/9/2023 13:59",
  "6/9/2023 13:16",
  "12/9/2023 9:34",
  "14/9/2023 12:38",
  "3/9/2023 14:59",
  "12/9/2023 12:10",
  "7/9/2023 13:18",
  "25/9/2023 12:36",
  "19/9/2023 14:19",
  "20/9/2023 11:40"
]

function getRandomNumberBetween(a, b) {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomFraction = Math.random();

  // Scale the randomFraction to be within the range [a, b)
  const randomNumber = a + randomFraction * (b - a);

  // Use Math.floor to round down to the nearest integer if you want an integer result
  // If you want a floating-point result with decimal places, you can omit Math.floor
  // return Math.floor(randomNumber); // Remove Math.floor for a floating-point result
  return randomNumber.toFixed(3)
}

let res = []
// for (const i of a) {
//   res.push(i)
//   res.push(getRandomNumberBetween(i-5,i+5))
//   res.push(getRandomNumberBetween(i-5,i+5))
// }

for (const i of a) {
  res.push(i)
  res.push("")
  res.push("")
}

for (const i of res) {
  console.log(i);
}
