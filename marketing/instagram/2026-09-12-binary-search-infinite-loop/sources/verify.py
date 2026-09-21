def buggy(arr, target, cap=6):
    lo, hi = 0, len(arr) - 1
    trace = []
    steps = 0
    while lo <= hi and steps < cap:
        mid = lo + (hi - lo) // 2
        trace.append((steps + 1, lo, hi, mid, arr[mid]))
        if arr[mid] == target:
            return mid, trace
        elif arr[mid] < target:
            lo = mid          # THE BUG: should be mid + 1
        else:
            hi = mid - 1
        steps += 1
    return "NO RETURN (capped)", trace

def correct(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

arr, target = [1, 3], 3
result, trace = buggy(arr, target)
print("BUGGY  arr=[1,3] target=3")
for s, lo, hi, mid, v in trace:
    print(f"  iter {s}: lo={lo} hi={hi} mid={mid} arr[mid]={v}")
print("  result:", result)
print("CORRECT result:", correct(arr, target))
