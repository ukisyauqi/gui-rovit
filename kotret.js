// function solution(S) {
//   // console.log(S)
//   let V = parseInt(S, 2);
//   let c = 0
//   while(V !== 0) {
//     if (V % 2 === 0) V /= 2
//     else V -= 1
//     c++
//   }
//   return c
// }

// console.log(solution("111111"))
// console.log(solution("10101"))
// console.log(solution("1000"))
// console.log(solution("100"))
// console.log(solution("10"))
// console.log(solution("1"))

function solution(S){
  S = parseInt(S).toString()
  return S.length + countCharacter(S) -1;
}

function countCharacter(str) {
  return str.split("1").length - 1
}

console.log(solution("1010101010"))