a = 40
function getSystole() {
  let a = age / 10;
  a = Math.round(a)
  if (systole != "" && typeof systole === 'number') return R(systole - 5);
  if (a == 0) return R(90);
  if (a == 1) return R(100);
  if (a == 2) return R(110);
  if (a == 3) return R(120);
  return R(130);
}

function getDiastole() {
  let a = age / 10;
  a = Math.round(a)
  if (diastole != "" && typeof diastole === 'number') return R(diastole - 5);
  if (a == 0) return R(50);
  if (a == 1) return R(60);
  if (a == 2) return R(70);
  if (a == 3) return R(80);
  return R(90);
}

