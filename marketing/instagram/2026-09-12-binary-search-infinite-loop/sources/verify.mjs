function buggy(arr, target, cap = 6) {
  let lo = 0, hi = arr.length - 1, steps = 0;
  const trace = [];
  while (lo <= hi && steps < cap) {
    const mid = lo + Math.floor((hi - lo) / 2);
    trace.push([steps + 1, lo, hi, mid, arr[mid]]);
    if (arr[mid] === target) return { result: mid, trace };
    else if (arr[mid] < target) lo = mid;   // THE BUG
    else hi = mid - 1;
    steps++;
  }
  return { result: "NO RETURN (capped)", trace };
}
function correct(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
const arr = [1, 3], target = 3;
const { result, trace } = buggy(arr, target);
console.log("BUGGY  arr=[1,3] target=3");
for (const [s, lo, hi, mid, v] of trace)
  console.log(`  iter ${s}: lo=${lo} hi=${hi} mid=${mid} arr[mid]=${v}`);
console.log("  result:", result);
console.log("CORRECT result:", correct(arr, target));
