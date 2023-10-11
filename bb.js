let a = `111	68
115	70
111	73
138	86
100	59
137	67
128	83
136	81
118	68
133	82
110	72
105	65
139	59
111	61
124	81
138	89
135	89
136	89
115	98
136	80
102	65
102	83
132	85
138	78
106	83
129	65
122	60
121	88
120	63
110	78
133	107
101	69
98	78
121	87
111	83
117	94
130	98
101	79
100	71
106	67
132	110
114	90
103	76
129	98
117	87
115	86
131	97
109	74
110	82
118	86
117	80
127	88
129	92
130	96
110	80
134	93
135	99
133	105
125	83
112	73
132	89
127	92
119	89
121	91
117	89
123	82
121	80
124	83
123	85
122	83
134	99
123	78
136	104
122	93
141	110
114	85
128	99
127	93
137	110
122	81
142	116
137	110
135	98
119	82
142	99
142	101
112	80
141	96
131	95
115	84
95	53
114	73
119	84
99	73
135	80
118	87
143	89
96	78
145	112
113	85
138	118
102	80
101	66
128	94
141	124
115	95
106	85
118	86
130	100
97	63
`

a = a.split("\n")
const res = []
for (const i of a) {
  res.push(i.split("\t").map(el => parseFloat(el)))
}

// console.log(res);

const res2 = []
let temp, i, j;
for (i of res) {
  res2.push(i)

  // temp = []
  // for (j of i) {
  //   temp.push(getRandomNumberBetween(j-5,j+5))
  // }
  res2.push(i)
  res2.push(i)

  // temp = []
  // for (j of i) {
  //   temp.push(getRandomNumberBetween(j-5,j+5))
  // }
  // res2.push(temp)
}

// console.log(res2);
let res3 = ""
for (const i of res2) {
  for (const j of i) {
    res3 += j
    res3 += "\t"
  }
  res3 += "\n"
}
console.log(res3)




function getRandomNumberBetween(a, b) {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomFraction = Math.random();

  // Scale the randomFraction to be within the range [a, b)
  const randomNumber = a + randomFraction * (b - a);

  // Use Math.floor to round down to the nearest integer if you want an integer result
  // If you want a floating-point result with decimal places, you can omit Math.floor
  // return Math.floor(randomNumber); // Remove Math.floor for a floating-point result
  return parseFloat(randomNumber.toFixed(3))
}


