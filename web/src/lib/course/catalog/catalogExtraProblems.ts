export interface CatalogExtraProblem {
  id: number;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  pattern: string;
  description: string;
  examples: string;
  constraints: string;
  hints: string[];
  thesis: string;
  solution: {
    python: string;
    typescript: string;
  };
  sandbox: {
    id: string;
    fn: { python: string; javascript: string };
    class?: { python: string; javascript: string };
    check?: "return" | "mutate" | "prefix" | "sequence" | "roundtrip";
    shape?: "value" | "list" | "tree" | "graph";
    compare?: "exact" | "set" | "sorted-lists";
    starter: { python: string; javascript: string };
    cases: Array<{
      construct?: unknown[];
      ops?: Array<[string, unknown[], unknown]>;
      args?: unknown[];
      expect?: unknown;
    }>;
  };
}

export const CATALOG_EXTRA_PROBLEMS: Record<string, CatalogExtraProblem> = {
  "add-two-numbers": {
    id: 2,
    slug: "add-two-numbers",
    title: "Add Two Numbers",
    difficulty: "Medium",
    topics: ["Linked Lists", "Math"],
    pattern: "Carry-propagating simultaneous traverse",
    description: `You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.`,
    examples: `Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.

Input: l1 = [0], l2 = [0]
Output: [0]

Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]`,
    constraints: `The number of nodes in each linked list is in the range [1, 100].
0 ≤ Node.val ≤ 9
It is guaranteed that the list represents a number that does not have leading zeros.`,
    hints: [
      "Simulate grade-school addition column by column from the least significant digit (head) to the most significant.",
      "Keep track of the carry (carry = sum // 10, digit = sum % 10) at each iteration until both lists and the carry are exhausted.",
    ],
    thesis: "Maintain a carry variable while traversing both lists simultaneously. Use a dummy head to simplify list construction.",
    solution: {
      python: `def add_two_numbers(l1, l2):
    dummy = ListNode(0)
    curr = dummy
    carry = 0
    while l1 or l2 or carry:
        val1 = l1.val if l1 else 0
        val2 = l2.val if l2 else 0
        total = val1 + val2 + carry
        carry = total // 10
        curr.next = ListNode(total % 10)
        curr = curr.next
        if l1: l1 = l1.next
        if l2: l2 = l2.next
    return dummy.next`,
      typescript: `function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let curr = dummy;
  let carry = 0;
  while (l1 !== null || l2 !== null || carry !== 0) {
    const val1 = l1 ? l1.val : 0;
    const val2 = l2 ? l2.val : 0;
    const total = val1 + val2 + carry;
    carry = Math.floor(total / 10);
    curr.next = new ListNode(total % 10);
    curr = curr.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }
  return dummy.next;
}`,
    },
    sandbox: {
      id: "add-two-numbers",
      fn: { python: "add_two_numbers", javascript: "addTwoNumbers" },
      shape: "list",
      starter: {
        python: `def add_two_numbers(l1, l2):
    # Return head of the summed linked list
    return None
`,
        javascript: `function addTwoNumbers(l1, l2) {
  // Return head of the summed linked list
  return null;
}
`,
      },
      cases: [
        { args: [[2, 4, 3], [5, 6, 4]], expect: [7, 0, 8] },
        { args: [[0], [0]], expect: [0] },
        { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expect: [8, 9, 9, 9, 0, 0, 0, 1] },
      ],
    },
  },

  "median-of-two-sorted-arrays": {
    id: 4,
    slug: "median-of-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topics: ["Arrays", "Binary Search", "Divide and Conquer"],
    pattern: "Binary search on partition boundary",
    description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be \`O(log (m+n))\`.`,
    examples: `Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.`,
    constraints: `nums1.length == m, nums2.length == n
0 ≤ m ≤ 1000, 0 ≤ n ≤ 1000, 1 ≤ m + n ≤ 2000
-10⁶ ≤ nums1[i], nums2[i] ≤ 10⁶`,
    hints: [
      "Instead of merging arrays in O(m+n), binary search for the split point in the smaller array.",
      "The left half of both arrays combined must have (m + n + 1) // 2 elements, and every element in the left half must be <= every element in the right half.",
    ],
    thesis: "Binary search on the partition cut in the shorter array nums1 so that max(left1, left2) <= min(right1, right2).",
    solution: {
      python: `def find_median_sorted_arrays(nums1, nums2):
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    m, n = len(nums1), len(nums2)
    low, high = 0, m
    while low <= high:
        i = (low + high) // 2
        j = (m + n + 1) // 2 - i
        max_left1 = float('-inf') if i == 0 else nums1[i - 1]
        min_right1 = float('inf') if i == m else nums1[i]
        max_left2 = float('-inf') if j == 0 else nums2[j - 1]
        min_right2 = float('inf') if j == n else nums2[j]
        if max_left1 <= min_right2 and max_left2 <= min_right1:
            if (m + n) % 2 == 1:
                return float(max(max_left1, max_left2))
            return (max(max_left1, max_left2) + min(min_right1, min_right2)) / 2.0
        elif max_left1 > min_right2:
            high = i - 1
        else:
            low = i + 1
    return 0.0`,
      typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  if (nums1.length > nums2.length) {
    return findMedianSortedArrays(nums2, nums1);
  }
  const m = nums1.length;
  const n = nums2.length;
  let low = 0;
  let high = m;
  while (low <= high) {
    const i = Math.floor((low + high) / 2);
    const j = Math.floor((m + n + 1) / 2) - i;
    const maxLeft1 = i === 0 ? -Infinity : nums1[i - 1];
    const minRight1 = i === m ? Infinity : nums1[i];
    const maxLeft2 = j === 0 ? -Infinity : nums2[j - 1];
    const minRight2 = j === n ? Infinity : nums2[j];
    if (maxLeft1 <= minRight2 && maxLeft2 <= minRight1) {
      if ((m + n) % 2 === 1) {
        return Math.max(maxLeft1, maxLeft2);
      }
      return (Math.max(maxLeft1, maxLeft2) + Math.min(minRight1, minRight2)) / 2;
    } else if (maxLeft1 > minRight2) {
      high = i - 1;
    } else {
      low = i + 1;
    }
  }
  return 0;
}`,
    },
    sandbox: {
      id: "median-of-two-sorted-arrays",
      fn: { python: "find_median_sorted_arrays", javascript: "findMedianSortedArrays" },
      starter: {
        python: `def find_median_sorted_arrays(nums1, nums2):
    # Return the median as a float
    return 0.0
`,
        javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Return the median as a number
  return 0;
}
`,
      },
      cases: [
        { args: [[1, 3], [2]], expect: 2.0 },
        { args: [[1, 2], [3, 4]], expect: 2.5 },
        { args: [[], [1]], expect: 1.0 },
        { args: [[2], []], expect: 2.0 },
      ],
    },
  },

  "letter-combinations-of-a-phone-number": {
    id: 17,
    slug: "letter-combinations-of-a-phone-number",
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    topics: ["Hash Tables", "Strings", "Recursion & Backtracking"],
    pattern: "Decision-tree backtracking",
    description: `Given a string containing digits from \`2-9\` inclusive, return all possible letter combinations that the number could represent. Return the answer in **any order**.

A mapping of digits to letters (just like on the telephone buttons) is given below. Note that 1 does not map to any letters.
- 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz"`,
    examples: `Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

Input: digits = ""
Output: []

Input: digits = "2"
Output: ["a","b","c"]`,
    constraints: `0 ≤ digits.length ≤ 4
digits[i] is a digit in the range ['2', '9'].`,
    hints: [
      "Use depth-first search backtracking. At each digit, branch over all letters mapped to that digit.",
      "Base case: when the current path length equals the digits length, append to results.",
    ],
    thesis: "Recursive backtracking across digit mapping arrays with string accumulation.",
    solution: {
      python: `def letter_combinations(digits):
    if not digits:
        return []
    phone = {
        "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
        "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"
    }
    res = []
    def backtrack(idx, path):
        if idx == len(digits):
            res.append("".join(path))
            return
        for char in phone[digits[idx]]:
            path.append(char)
            backtrack(idx + 1, path)
            path.pop()
    backtrack(0, [])
    return res`,
      typescript: `function letterCombinations(digits: string): string[] {
  if (!digits) return [];
  const phone: Record<string, string> = {
    "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
    "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
  };
  const res: string[] = [];
  function backtrack(idx: number, path: string[]) {
    if (idx === digits.length) {
      res.push(path.join(""));
      return;
    }
    for (const char of phone[digits[idx]]!) {
      path.push(char);
      backtrack(idx + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return res;
}`,
    },
    sandbox: {
      id: "letter-combinations-of-a-phone-number",
      fn: { python: "letter_combinations", javascript: "letterCombinations" },
      compare: "set",
      starter: {
        python: `def letter_combinations(digits):
    # Return list of letter combinations
    return []
`,
        javascript: `function letterCombinations(digits) {
  // Return list of letter combinations
  return [];
}
`,
      },
      cases: [
        { args: ["23"], expect: ["ad","ae","af","bd","be","bf","cd","ce","cf"] },
        { args: [""], expect: [] },
        { args: ["2"], expect: ["a","b","c"] },
      ],
    },
  },

  "remove-element": {
    id: 27,
    slug: "remove-element",
    title: "Remove Element",
    difficulty: "Easy",
    topics: ["Arrays", "Two Pointers"],
    pattern: "Fast/slow overwrite pointer",
    description: `Given an integer array \`nums\` and an integer \`val\`, remove all occurrences of \`val\` in \`nums\` **in-place**. The order of the elements may be changed. Then return the number of elements in \`nums\` which are not equal to \`val\`.

Consider the number of elements in \`nums\` which are not equal to \`val\` be \`k\`, to get accepted, you need to do the following things:
- Change the array \`nums\` such that the first \`k\` elements of \`nums\` contain the elements which are not equal to \`val\`.
- Return \`k\`.`,
    examples: `Input: nums = [3,2,2,3], val = 3
Output: 2, nums = [2,2,_,_]

Input: nums = [0,1,2,2,3,0,4,2], val = 2
Output: 5, nums = [0,1,4,0,3,_,_,_]`,
    constraints: `0 ≤ nums.length ≤ 100
0 ≤ nums[i] ≤ 50
0 ≤ val ≤ 100`,
    hints: [
      "Keep a write pointer starting at 0. Iterate through the array with a read pointer.",
      "Whenever nums[read] != val, copy nums[read] to nums[write] and increment write.",
    ],
    thesis: "Compact non-matching elements into the prefix using a single write index.",
    solution: {
      python: `def remove_element(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write`,
      typescript: `function removeElement(nums: number[], val: number): number {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write;
}`,
    },
    sandbox: {
      id: "remove-element",
      fn: { python: "remove_element", javascript: "removeElement" },
      check: "prefix",
      starter: {
        python: `def remove_element(nums, val):
    # Remove val in-place, return new length k
    return 0
`,
        javascript: `function removeElement(nums, val) {
  // Remove val in-place, return new length k
  return 0;
}
`,
      },
      cases: [
        { args: [[3, 2, 2, 3], 3], expect: [2, 2] },
        { args: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expect: [0, 1, 3, 0, 4] },
        { args: [[1], 1], expect: [] },
      ],
    },
  },

  "valid-sudoku": {
    id: 36,
    slug: "valid-sudoku",
    title: "Valid Sudoku",
    difficulty: "Medium",
    topics: ["Arrays", "Hash Tables", "Matrix"],
    pattern: "3-way bitmask / hash set verification",
    description: `Determine if a \`9 x 9\` Sudoku board is valid. Only the filled cells need to be validated according to the following rules:
1. Each row must contain the digits \`1-9\` without repetition.
2. Each column must contain the digits \`1-9\` without repetition.
3. Each of the nine \`3 x 3\` sub-boxes of the grid must contain the digits \`1-9\` without repetition.

Note:
- A Sudoku board (partially filled) could be valid but is not necessarily solvable.
- Only the filled cells need to be validated according to the mentioned rules.`,
    examples: `Input: board = 
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
Output: true`,
    constraints: `board.length == 9, board[i].length == 9
board[i][j] is a digit '1'-'9' or '.'.`,
    hints: [
      "Track seen numbers per row (9 sets), per column (9 sets), and per 3x3 box (9 sets with index (r//3)*3 + c//3).",
    ],
    thesis: "Verify uniqueness across rows, cols, and 3x3 blocks in a single O(81) pass using sets or bitmasks.",
    solution: {
      python: `def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == ".":
                continue
            box_idx = (r // 3) * 3 + (c // 3)
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return False
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
    return True`,
      typescript: `function isValidSudoku(board: string[][]): boolean {
  const rows = Array.from({ length: 9 }, () => new Set<string>());
  const cols = Array.from({ length: 9 }, () => new Set<string>());
  const boxes = Array.from({ length: 9 }, () => new Set<string>());
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r]![c]!;
      if (val === ".") continue;
      const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if (rows[r]!.has(val) || cols[c]!.has(val) || boxes[boxIdx]!.has(val)) {
        return false;
      }
      rows[r]!.add(val);
      cols[c]!.add(val);
      boxes[boxIdx]!.add(val);
    }
  }
  return true;
}`,
    },
    sandbox: {
      id: "valid-sudoku",
      fn: { python: "is_valid_sudoku", javascript: "isValidSudoku" },
      starter: {
        python: `def is_valid_sudoku(board):
    # Return True if board is valid, False otherwise
    return True
`,
        javascript: `function isValidSudoku(board) {
  // Return true if board is valid, false otherwise
  return true;
}
`,
      },
      cases: [
        {
          args: [[
            ["5","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".","8",".",".","7","9"],
          ]],
          expect: true,
        },
        {
          args: [[
            ["8","3",".",".","7",".",".",".","."],
            ["6",".",".","1","9","5",".",".","."],
            [".","9","8",".",".",".",".","6","."],
            ["8",".",".",".","6",".",".",".","3"],
            ["4",".",".","8",".","3",".",".","1"],
            ["7",".",".",".","2",".",".",".","6"],
            [".","6",".",".",".",".","2","8","."],
            [".",".",".","4","1","9",".",".","5"],
            [".",".",".",".","8",".",".","7","9"],
          ]],
          expect: false,
        },
      ],
    },
  },

  "combination-sum-ii": {
    id: 40,
    slug: "combination-sum-ii",
    title: "Combination Sum II",
    difficulty: "Medium",
    topics: ["Arrays", "Recursion & Backtracking"],
    pattern: "Backtracking with adjacent duplicate skip",
    description: `Given a collection of candidate numbers (\`candidates\`) and a target number (\`target\`), find all unique combinations in \`candidates\` where the candidate numbers sum to \`target\`.

Each number in \`candidates\` may only be used **once** in the combination.

Note: The solution set must not contain duplicate combinations.`,
    examples: `Input: candidates = [10,1,2,7,6,1,5], target = 8
Output: 
[
[1,1,6],
[1,2,5],
[1,7],
[2,6]
]

Input: candidates = [2,5,2,1,2], target = 5
Output: 
[
[1,2,2],
[5]
]`,
    constraints: `1 ≤ candidates.length ≤ 100
1 ≤ candidates[i] ≤ 50
1 ≤ target ≤ 30`,
    hints: [
      "Sort candidates first. When looping at the current depth, if candidates[i] == candidates[i - 1] and i > start, skip to prevent duplicate combinations.",
    ],
    thesis: "Sort candidates and skip identical elements at the same tree depth to avoid duplicate combination branches.",
    solution: {
      python: `def combination_sum_2(candidates, target):
    candidates.sort()
    res = []
    def backtrack(start, remain, path):
        if remain == 0:
            res.append(list(path))
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remain:
                break
            path.append(candidates[i])
            backtrack(i + 1, remain - candidates[i], path)
            path.pop()
    backtrack(0, target, [])
    return res`,
      typescript: `function combinationSum2(candidates: number[], target: number): number[][] {
  candidates.sort((a, b) => a - b);
  const res: number[][] = [];
  function backtrack(start: number, remain: number, path: number[]) {
    if (remain === 0) {
      res.push([...path]);
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue;
      if (candidates[i]! > remain) break;
      path.push(candidates[i]!);
      backtrack(i + 1, remain - candidates[i]!, path);
      path.pop();
    }
  }
  backtrack(0, target, []);
  return res;
}`,
    },
    sandbox: {
      id: "combination-sum-ii",
      fn: { python: "combination_sum_2", javascript: "combinationSum2" },
      compare: "sorted-lists",
      starter: {
        python: `def combination_sum_2(candidates, target):
    # Return list of combinations summing to target
    return []
`,
        javascript: `function combinationSum2(candidates, target) {
  // Return list of combinations summing to target
  return [];
}
`,
      },
      cases: [
        { args: [[10, 1, 2, 7, 6, 1, 5], 8], expect: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
        { args: [[2, 5, 2, 1, 2], 5], expect: [[1, 2, 2], [5]] },
      ],
    },
  },

  "subsets-ii": {
    id: 90,
    slug: "subsets-ii",
    title: "Subsets II",
    difficulty: "Medium",
    topics: ["Arrays", "Recursion & Backtracking"],
    pattern: "Power set with duplicate pruning",
    description: `Given an integer array \`nums\` that may contain duplicates, return all possible subsets (the power set).

The solution set **must not contain duplicate subsets**. Return the solution in **any order**.`,
    examples: `Input: nums = [1,2,2]
Output: [[],[1],[1,2],[1,2,2],[2],[2,2]]

Input: nums = [0]
Output: [[],[0]]`,
    constraints: `1 ≤ nums.length ≤ 10
-10 ≤ nums[i] ≤ 10`,
    hints: [
      "Sort nums. In each recursive level, skip duplicate values if i > start and nums[i] == nums[i-1].",
    ],
    thesis: "Sort and prune duplicates at the sibling iteration level to produce unique subsets.",
    solution: {
      python: `def subsets_with_dup(nums):
    nums.sort()
    res = []
    def backtrack(start, path):
        res.append(list(path))
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
    backtrack(0, [])
    return res`,
      typescript: `function subsetsWithDup(nums: number[]): number[][] {
  nums.sort((a, b) => a - b);
  const res: number[][] = [];
  function backtrack(start: number, path: number[]) {
    res.push([...path]);
    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) continue;
      path.push(nums[i]!);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return res;
}`,
    },
    sandbox: {
      id: "subsets-ii",
      fn: { python: "subsets_with_dup", javascript: "subsetsWithDup" },
      compare: "sorted-lists",
      starter: {
        python: `def subsets_with_dup(nums):
    # Return all unique subsets
    return []
`,
        javascript: `function subsetsWithDup(nums) {
  // Return all unique subsets
  return [];
}
`,
      },
      cases: [
        { args: [[1, 2, 2]], expect: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
        { args: [[0]], expect: [[], [0]] },
      ],
    },
  },

  "same-tree": {
    id: 100,
    slug: "same-tree",
    title: "Same Tree",
    difficulty: "Easy",
    topics: ["Binary Trees", "Recursion & Backtracking"],
    pattern: "Simultaneous recursive DFS traversal",
    description: `Given the roots of two binary trees \`p\` and \`q\`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.`,
    examples: `Input: p = [1,2,3], q = [1,2,3]
Output: true

Input: p = [1,2], q = [1,null,2]
Output: false

Input: p = [1,2,1], q = [1,1,2]
Output: false`,
    constraints: `The number of nodes in both trees is in the range [0, 100].
-10⁴ ≤ Node.val ≤ 10⁴`,
    hints: [
      "If both nodes are null, return true. If exactly one is null or values differ, return false.",
      "Recursively check isSameTree(p.left, q.left) and isSameTree(p.right, q.right).",
    ],
    thesis: "Simultaneously traverse both trees; both must match value and structural nullness at every step.",
    solution: {
      python: `def is_same_tree(p, q):
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
      typescript: `function isSameTree(p: TreeNode | null, q: TreeNode | null): boolean {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
    },
    sandbox: {
      id: "same-tree",
      fn: { python: "is_same_tree", javascript: "isSameTree" },
      shape: "tree",
      starter: {
        python: `def is_same_tree(p, q):
    # Return True if trees are structurally identical with same values
    return False
`,
        javascript: `function isSameTree(p, q) {
  // Return true if trees are structurally identical with same values
  return false;
}
`,
      },
      cases: [
        { args: [[1, 2, 3], [1, 2, 3]], expect: true },
        { args: [[1, 2], [1, null, 2]], expect: false },
        { args: [[1, 2, 1], [1, 1, 2]], expect: false },
      ],
    },
  },

  "balanced-binary-tree": {
    id: 110,
    slug: "balanced-binary-tree",
    title: "Balanced Binary Tree",
    difficulty: "Easy",
    topics: ["Binary Trees", "Recursion & Backtracking"],
    pattern: "Bottom-up height calculation with early exit",
    description: `Given a binary tree, determine if it is **height-balanced**.

A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.`,
    examples: `Input: root = [3,9,20,null,null,15,7]
Output: true

Input: root = [1,2,2,3,3,null,null,4,4]
Output: false

Input: root = []
Output: true`,
    constraints: `The number of nodes in the tree is in the range [0, 5000].
-10⁴ ≤ Node.val ≤ 10⁴`,
    hints: [
      "A top-down approach recalculates heights repeatedly O(n^2). Compute heights bottom-up in O(n) and return -1 if any subtree is unbalanced.",
    ],
    thesis: "Bottom-up DFS returns subtree height or -1 sentinel upon detecting height disparity > 1.",
    solution: {
      python: `def is_balanced(root):
    def height(node):
        if not node:
            return 0
        left = height(node.left)
        if left == -1:
            return -1
        right = height(node.right)
        if right == -1 or abs(left - right) > 1:
            return -1
        return 1 + max(left, right)
    return height(root) != -1`,
      typescript: `function isBalanced(root: TreeNode | null): boolean {
  function height(node: TreeNode | null): number {
    if (!node) return 0;
    const left = height(node.left);
    if (left === -1) return -1;
    const right = height(node.right);
    if (right === -1 || Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  }
  return height(root) !== -1;
}`,
    },
    sandbox: {
      id: "balanced-binary-tree",
      fn: { python: "is_balanced", javascript: "isBalanced" },
      shape: "tree",
      starter: {
        python: `def is_balanced(root):
    # Return True if tree is height-balanced
    return False
`,
        javascript: `function isBalanced(root) {
  // Return true if tree is height-balanced
  return false;
}
`,
      },
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expect: true },
        { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expect: false },
        { args: [[]], expect: true },
      ],
    },
  },

  "best-time-to-buy-and-sell-stock-ii": {
    id: 122,
    slug: "best-time-to-buy-and-sell-stock-ii",
    title: "Best Time to Buy and Sell Stock II",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming", "Greedy"],
    pattern: "Greedy peak-valley accumulation",
    description: `You are given an integer array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day.

On each day, you may decide to buy and/or sell the stock. You can only hold **at most one** share of the stock at any time. However, you can buy it then immediately sell it on the same day.

Find and return the **maximum profit** you can achieve.`,
    examples: `Input: prices = [7,1,5,3,6,4]
Output: 7
Explanation: Buy on day 2 (price = 1) and sell on day 3 (price = 5), profit = 5-1 = 4.
Then buy on day 4 (price = 3) and sell on day 5 (price = 6), profit = 6-3 = 3.
Total profit is 4 + 3 = 7.

Input: prices = [1,2,3,4,5]
Output: 4
Explanation: Buy on day 1 (price = 1) and sell on day 5 (price = 5), profit = 5-1 = 4.`,
    constraints: `1 ≤ prices.length ≤ 3 · 10⁴
0 ≤ prices[i] ≤ 10⁴`,
    hints: [
      "Any upward price difference prices[i] - prices[i-1] can be captured. Sum all positive consecutive differences.",
    ],
    thesis: "Accumulate all positive day-over-day price deltas greedily in O(n) time.",
    solution: {
      python: `def max_profit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit`,
      typescript: `function maxProfit(prices: number[]): number {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i]! > prices[i - 1]!) {
      profit += prices[i]! - prices[i - 1]!;
    }
  }
  return profit;
}`,
    },
    sandbox: {
      id: "best-time-to-buy-and-sell-stock-ii",
      fn: { python: "max_profit", javascript: "maxProfit" },
      starter: {
        python: `def max_profit(prices):
    # Return maximum achievable profit
    return 0
`,
        javascript: `function maxProfit(prices) {
  // Return maximum achievable profit
  return 0;
}
`,
      },
      cases: [
        { args: [[7, 1, 5, 3, 6, 4]], expect: 7 },
        { args: [[1, 2, 3, 4, 5]], expect: 4 },
        { args: [[7, 6, 4, 3, 1]], expect: 0 },
      ],
    },
  },

  "binary-tree-maximum-path-sum": {
    id: 124,
    slug: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "Hard",
    topics: ["Binary Trees", "Dynamic Programming", "Recursion & Backtracking"],
    pattern: "Post-order tree DP with global maxima",
    description: `A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return the **maximum path sum** of any non-empty path.`,
    examples: `Input: root = [1,2,3]
Output: 6
Explanation: The optimal path is 2 -> 1 -> 3 with path sum 2 + 1 + 3 = 6.

Input: root = [-10,9,20,null,null,15,7]
Output: 42
Explanation: The optimal path is 15 -> 20 -> 7 with path sum 15 + 20 + 7 = 42.`,
    constraints: `The number of nodes in the tree is in the range [1, 3 · 10⁴].
-1000 ≤ Node.val ≤ 1000`,
    hints: [
      "For each node, compute the max gain from its left and right subtrees (ignoring negatives by taking max(0, gain)).",
      "The best path with this node as the apex is node.val + left_gain + right_gain. Return node.val + max(left_gain, right_gain) to parent.",
    ],
    thesis: "At each subtree root, update global maximum with left_gain + right_gain + node.val, returning one-sided max branch up.",
    solution: {
      python: `def max_path_sum(root):
    max_sum = float('-inf')
    def gain(node):
        nonlocal max_sum
        if not node:
            return 0
        left = max(gain(node.left), 0)
        right = max(gain(node.right), 0)
        max_sum = max(max_sum, node.val + left + right)
        return node.val + max(left, right)
    gain(root)
    return max_sum`,
      typescript: `function maxPathSum(root: TreeNode | null): number {
  let maxSum = -Infinity;
  function gain(node: TreeNode | null): number {
    if (!node) return 0;
    const left = Math.max(gain(node.left), 0);
    const right = Math.max(gain(node.right), 0);
    maxSum = Math.max(maxSum, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  gain(root);
  return maxSum;
}`,
    },
    sandbox: {
      id: "binary-tree-maximum-path-sum",
      fn: { python: "max_path_sum", javascript: "maxPathSum" },
      shape: "tree",
      starter: {
        python: `def max_path_sum(root):
    # Return maximum path sum
    return 0
`,
        javascript: `function maxPathSum(root) {
  // Return maximum path sum
  return 0;
}
`,
      },
      cases: [
        { args: [[1, 2, 3]], expect: 6 },
        { args: [[-10, 9, 20, null, null, 15, 7]], expect: 42 },
        { args: [[-3]], expect: -3 },
      ],
    },
  },

  "word-ladder": {
    id: 127,
    slug: "word-ladder",
    title: "Word Ladder",
    difficulty: "Hard",
    topics: ["Hash Tables", "Strings", "Graphs", "BFS"],
    pattern: "Shortest-path BFS in unweighted transformation graph",
    description: `A **transformation sequence** from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s1 -> s2 -> ... -> sk\` such that:
- Every adjacent pair of words differs by exactly one letter.
- Every \`si\` for \`1 <= i <= k\` is in \`wordList\`. (Note that \`beginWord\` does not need to be in \`wordList\`.)
- \`sk == endWord\`

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the **number of words** in the **shortest transformation sequence**, or \`0\` if no such sequence exists.`,
    examples: `Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]
Output: 5
Explanation: One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.

Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]
Output: 0
Explanation: The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.`,
    constraints: `1 ≤ beginWord.length ≤ 10
endWord.length == beginWord.length
1 ≤ wordList.length ≤ 5000
wordList[i].length == beginWord.length
beginWord, endWord, and wordList[i] consist of lowercase English letters.
beginWord != endWord
All the words in wordList are unique.`,
    hints: [
      "Model this as an unweighted graph where an edge exists if two words differ by one character. BFS guarantees the shortest path.",
      "To find neighbors efficiently in O(26 * L), generate all 26 character mutations per position and check set membership.",
    ],
    thesis: "Level-order BFS exploring 1-letter wildcards finding the target word with minimum steps.",
    solution: {
      python: `from collections import deque

def ladder_length(begin_word, end_word, word_list):
    words = set(word_list)
    if end_word not in words:
        return 0
    q = deque([(begin_word, 1)])
    visited = {begin_word}
    while q:
        curr, steps = q.popleft()
        if curr == end_word:
            return steps
        for i in range(len(curr)):
            for c in "abcdefghijklmnopqrstuvwxyz":
                next_word = curr[:i] + c + curr[i+1:]
                if next_word in words and next_word not in visited:
                    visited.add(next_word)
                    q.append((next_word, steps + 1))
    return 0`,
      typescript: `function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  const q: [string, number][] = [[beginWord, 1]];
  const visited = new Set<string>([beginWord]);
  while (q.length > 0) {
    const [curr, steps] = q.shift()!;
    if (curr === endWord) return steps;
    for (let i = 0; i < curr.length; i++) {
      for (let code = 97; code <= 122; code++) {
        const c = String.fromCharCode(code);
        const nextWord = curr.slice(0, i) + c + curr.slice(i + 1);
        if (words.has(nextWord) && !visited.has(nextWord)) {
          visited.add(nextWord);
          q.push([nextWord, steps + 1]);
        }
      }
    }
  }
  return 0;
}`,
    },
    sandbox: {
      id: "word-ladder",
      fn: { python: "ladder_length", javascript: "ladderLength" },
      starter: {
        python: `def ladder_length(begin_word, end_word, word_list):
    # Return shortest sequence length or 0
    return 0
`,
        javascript: `function ladderLength(beginWord, endWord, wordList) {
  // Return shortest sequence length or 0
  return 0;
}
`,
      },
      cases: [
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]], expect: 5 },
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], expect: 0 },
      ],
    },
  },

  "surrounded-regions": {
    id: 130,
    slug: "surrounded-regions",
    title: "Surrounded Regions",
    difficulty: "Medium",
    topics: ["Arrays", "Matrix", "Graphs", "DFS"],
    pattern: "Boundary flood-fill inversion",
    description: `Given an \`m x n\` matrix \`board\` containing \`'X'\` and \`'O'\`, capture all regions that are 4-directionally surrounded by \`'X'\`.

A region is captured by flipping all \`'O'\`s into \`'X'\`s in that surrounded region. Any \`'O'\` connected to the boundary of the board is NOT surrounded and cannot be captured.`,
    examples: `Input: board = [
  ["X","X","X","X"],
  ["X","O","O","X"],
  ["X","X","O","X"],
  ["X","O","X","X"]
]
Output: [
  ["X","X","X","X"],
  ["X","X","X","X"],
  ["X","X","X","X"],
  ["X","O","X","X"]
]`,
    constraints: `m == board.length, n == board[i].length
1 ≤ m, n ≤ 200
board[i][j] is 'X' or 'O'.`,
    hints: [
      "Instead of finding surrounded O's, find all non-surrounded O's: start DFS/BFS from every 'O' on the 4 outer borders.",
      "Mark reachable boundary O's as safe (e.g. 'S'). Then flip all remaining 'O's to 'X', and restore 'S' back to 'O'.",
    ],
    thesis: "Reverse perspective: traverse from border-connected 'O's, mark uncapturable, then flip remaining enclosed 'O's.",
    solution: {
      python: `def solve(board):
    if not board: return
    R, C = len(board), len(board[0])
    def dfs(r, c):
        if r < 0 or r >= R or c < 0 or c >= C or board[r][c] != "O":
            return
        board[r][c] = "S"
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    for r in range(R):
        dfs(r, 0)
        dfs(r, C - 1)
    for c in range(C):
        dfs(0, c)
        dfs(R - 1, c)
    for r in range(R):
        for c in range(C):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "S":
                board[r][c] = "O"`,
      typescript: `function solve(board: string[][]): void {
  if (!board.length) return;
  const R = board.length;
  const C = board[0]!.length;
  function dfs(r: number, c: number) {
    if (r < 0 || r >= R || c < 0 || c >= C || board[r]![c] !== "O") return;
    board[r]![c] = "S";
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }
  for (let r = 0; r < R; r++) {
    dfs(r, 0);
    dfs(r, C - 1);
  }
  for (let c = 0; c < C; c++) {
    dfs(0, c);
    dfs(R - 1, c);
  }
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (board[r]![c] === "O") board[r]![c] = "X";
      else if (board[r]![c] === "S") board[r]![c] = "O";
    }
  }
}`,
    },
    sandbox: {
      id: "surrounded-regions",
      fn: { python: "solve", javascript: "solve" },
      check: "mutate",
      starter: {
        python: `def solve(board):
    # Modify board in-place
    pass
`,
        javascript: `function solve(board) {
  // Modify board in-place
}
`,
      },
      cases: [
        {
          args: [[
            ["X","X","X","X"],
            ["X","O","O","X"],
            ["X","X","O","X"],
            ["X","O","X","X"],
          ]],
          expect: [
            ["X","X","X","X"],
            ["X","X","X","X"],
            ["X","X","X","X"],
            ["X","O","X","X"],
          ],
        },
      ],
    },
  },

  "single-number": {
    id: 136,
    slug: "single-number",
    title: "Single Number",
    difficulty: "Easy",
    topics: ["Arrays", "Bit Manipulation"],
    pattern: "XOR cancellation invariant",
    description: `Given a **non-empty** array of integers \`nums\`, every element appears *twice* except for one. Find that single one.

You must implement a solution with a linear runtime complexity \`O(n)\` and use only **constant extra space** \`O(1)\`.`,
    examples: `Input: nums = [2,2,1]
Output: 1

Input: nums = [4,1,2,1,2]
Output: 4

Input: nums = [1]
Output: 1`,
    constraints: `1 ≤ nums.length ≤ 3 · 10⁴
-3 · 10⁴ ≤ nums[i] ≤ 3 · 10⁴
Each element in the array appears twice except for one element which appears only once.`,
    hints: [
      "XOR properties: a ^ a = 0 and a ^ 0 = a. XOR is associative and commutative.",
      "XOR all numbers together; all duplicates cancel out to 0, leaving only the unique number.",
    ],
    thesis: "XOR cumulative reduction leaves the unique non-paired element in O(n) time and O(1) space.",
    solution: {
      python: `def single_number(nums):
    res = 0
    for x in nums:
        res ^= x
    return res`,
      typescript: `function singleNumber(nums: number[]): number {
  let res = 0;
  for (const x of nums) {
    res ^= x;
  }
  return res;
}`,
    },
    sandbox: {
      id: "single-number",
      fn: { python: "single_number", javascript: "singleNumber" },
      starter: {
        python: `def single_number(nums):
    # Return the single unique number
    return 0
`,
        javascript: `function singleNumber(nums) {
  // Return the single unique number
  return 0;
}
`,
      },
      cases: [
        { args: [[2, 2, 1]], expect: 1 },
        { args: [[4, 1, 2, 1, 2]], expect: 4 },
        { args: [[1]], expect: 1 },
      ],
    },
  },

  "reorder-list": {
    id: 143,
    slug: "reorder-list",
    title: "Reorder List",
    difficulty: "Medium",
    topics: ["Linked Lists", "Two Pointers"],
    pattern: "Split midpoint + reverse half + interleave",
    description: `You are given the head of a singly linked-list:
\`L0 -> L1 -> ... -> Ln-1 -> Ln\`

Reorder the list to be on the following form:
\`L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...\`

You may not modify the values in the list's nodes. Only nodes themselves may be changed.`,
    examples: `Input: head = [1,2,3,4]
Output: [1,4,2,3]

Input: head = [1,2,3,4,5]
Output: [1,5,2,4,3]`,
    constraints: `The number of nodes in the list is in the range [1, 5 · 10⁴].
1 ≤ Node.val ≤ 1000`,
    hints: [
      "1. Find middle with fast/slow pointers. 2. Reverse second half. 3. Interleave first and reversed second halves.",
    ],
    thesis: "Three-phase linked list composition: midpoint partition, in-place half reversal, alternating weave.",
    solution: {
      python: `def reorder_list(head):
    if not head or not head.next:
        return
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    curr = slow.next
    slow.next = None
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    first, second = head, prev
    while second:
        tmp1, tmp2 = first.next, second.next
        first.next = second
        second.next = tmp1
        first = tmp1
        second = tmp2`,
      typescript: `function reorderList(head: ListNode | null): void {
  if (!head || !head.next) return;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next!;
    fast = fast.next.next;
  }
  let prev: ListNode | null = null;
  let curr = slow.next;
  slow.next = null;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  let first: ListNode | null = head;
  let second: ListNode | null = prev;
  while (second) {
    const tmp1 = first!.next;
    const tmp2 = second.next;
    first!.next = second;
    second.next = tmp1;
    first = tmp1;
    second = tmp2;
  }
}`,
    },
    sandbox: {
      id: "reorder-list",
      fn: { python: "reorder_list", javascript: "reorderList" },
      shape: "list",
      check: "mutate",
      starter: {
        python: `def reorder_list(head):
    # Reorder in-place
    pass
`,
        javascript: `function reorderList(head) {
  // Reorder in-place
}
`,
      },
      cases: [
        { args: [[1, 2, 3, 4]], expect: [1, 4, 2, 3] },
        { args: [[1, 2, 3, 4, 5]], expect: [1, 5, 2, 4, 3] },
      ],
    },
  },

  "maximum-product-subarray": {
    id: 152,
    slug: "maximum-product-subarray",
    title: "Maximum Product Subarray",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming"],
    pattern: "Min/max dual-state Kadane's",
    description: `Given an integer array \`nums\`, find a subarray that has the largest product, and return the product.

The test cases are generated so that the answer will fit in a **32-bit** integer.`,
    examples: `Input: nums = [2,3,-2,4]
Output: 6
Explanation: [2,3] has the largest product 6.

Input: nums = [-2,0,-1]
Output: 0
Explanation: The result cannot be 2, because [-2,-1] is not a subarray.`,
    constraints: `1 ≤ nums.length ≤ 2 · 10⁴
-10 ≤ nums[i] ≤ 10
The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.`,
    hints: [
      "Multiplying by a negative number swaps maximum and minimum products. Track both max_prod and min_prod ending at the current element.",
    ],
    thesis: "Maintain running min and max products to account for sign inversions with negative numbers.",
    solution: {
      python: `def max_product(nums):
    res = max(nums)
    curr_min, curr_max = 1, 1
    for n in nums:
        if n == 0:
            curr_min, curr_max = 1, 1
            continue
        tmp = curr_max * n
        curr_max = max(n * curr_max, n * curr_min, n)
        curr_min = min(tmp, n * curr_min, n)
        res = max(res, curr_max)
    return res`,
      typescript: `function maxProduct(nums: number[]): number {
  let res = Math.max(...nums);
  let currMin = 1;
  let currMax = 1;
  for (const n of nums) {
    if (n === 0) {
      currMin = 1;
      currMax = 1;
      continue;
    }
    const tmp = currMax * n;
    currMax = Math.max(n * currMax, n * currMin, n);
    currMin = Math.min(tmp, n * currMin, n);
    res = Math.max(res, currMax);
  }
  return res;
}`,
    },
    sandbox: {
      id: "maximum-product-subarray",
      fn: { python: "max_product", javascript: "maxProduct" },
      starter: {
        python: `def max_product(nums):
    # Return maximum product of contiguous subarray
    return 0
`,
        javascript: `function maxProduct(nums) {
  // Return maximum product of contiguous subarray
  return 0;
}
`,
      },
      cases: [
        { args: [[2, 3, -2, 4]], expect: 6 },
        { args: [[-2, 0, -1]], expect: 0 },
        { args: [[-2, 3, -4]], expect: 24 },
      ],
    },
  },

  "reverse-bits": {
    id: 190,
    slug: "reverse-bits",
    title: "Reverse Bits",
    difficulty: "Easy",
    topics: ["Bit Manipulation"],
    pattern: "32-bit shift register reversal",
    description: `Reverse bits of a given 32 bits unsigned integer.`,
    examples: `Input: n = 00000010100101000001111010011100 (43261596)
Output:    00111001011110000010100101000000 (964176192)

Input: n = 11111111111111111111111111111101 (4294967293)
Output:    10111111111111111111111111111111 (3221225471)`,
    constraints: `The input must be a binary string of length 32 or 32-bit unsigned int.`,
    hints: [
      "Loop 32 times: take (n & 1), shift result left, add the bit, shift n right.",
    ],
    thesis: "Bitwise 32-cycle shift accumulator building reversed binary representation.",
    solution: {
      python: `def reverse_bits(n):
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    return res`,
      typescript: `function reverseBits(n: number): number {
  let res = 0;
  for (let i = 0; i < 32; i++) {
    res = (res * 2) + (n & 1);
    n = Math.floor(n / 2);
  }
  return res;
}`,
    },
    sandbox: {
      id: "reverse-bits",
      fn: { python: "reverse_bits", javascript: "reverseBits" },
      starter: {
        python: `def reverse_bits(n):
    # Return 32-bit integer with reversed bits
    return 0
`,
        javascript: `function reverseBits(n) {
  // Return 32-bit integer with reversed bits
  return 0;
}
`,
      },
      cases: [
        { args: [43261596], expect: 964176192 },
        { args: [4294967293], expect: 3221225471 },
      ],
    },
  },

  "number-of-1-bits": {
    id: 191,
    slug: "number-of-1-bits",
    title: "Number of 1 Bits",
    difficulty: "Easy",
    topics: ["Bit Manipulation"],
    pattern: "Brian Kernighan's bit-clearing trick",
    description: `Given a positive integer \`n\`, write a function that returns the number of set bits it has (also known as the Hamming weight).`,
    examples: `Input: n = 11
Output: 3
Explanation: The input binary string 1011 has a total of three set bits.

Input: n = 128
Output: 1

Input: n = 2147483645
Output: 30`,
    constraints: `1 ≤ n ≤ 2³¹ - 1`,
    hints: [
      "Brian Kernighan's algorithm: n = n & (n - 1) clears the lowest set bit in O(number of 1s).",
    ],
    thesis: "Clearing the lowest set bit with n & (n - 1) loops in exactly Hamming-weight iterations.",
    solution: {
      python: `def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
      typescript: `function hammingWeight(n: number): number {
  let count = 0;
  while (n > 0) {
    n = n & (n - 1);
    count++;
  }
  return count;
}`,
    },
    sandbox: {
      id: "number-of-1-bits",
      fn: { python: "hamming_weight", javascript: "hammingWeight" },
      starter: {
        python: `def hamming_weight(n):
    # Return count of set bits (1s)
    return 0
`,
        javascript: `function hammingWeight(n) {
  // Return count of set bits (1s)
  return 0;
}
`,
      },
      cases: [
        { args: [11], expect: 3 },
        { args: [128], expect: 1 },
        { args: [2147483645], expect: 30 },
      ],
    },
  },

  "house-robber-ii": {
    id: 213,
    slug: "house-robber-ii",
    title: "House Robber II",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming"],
    pattern: "Circular DP split into two linear subproblems",
    description: `You are a professional robber planning to rob houses along a street, each house has a certain amount of money stashed. All houses at this place are **arranged in a circle**. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount of money you can rob tonight **without alerting the police**.`,
    examples: `Input: nums = [2,3,2]
Output: 3
Explanation: You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses.

Input: nums = [1,2,3,1]
Output: 4
Explanation: Rob house 1 (money = 1) and then rob house 3 (money = 3). Total = 4.

Input: nums = [1,2,3]
Output: 3`,
    constraints: `1 ≤ nums.length ≤ 100
0 ≤ nums[i] ≤ 1000`,
    hints: [
      "Since house 0 and house n-1 are adjacent, you cannot rob both. Either consider houses [0..n-2] or houses [1..n-1], then take max.",
    ],
    thesis: "Circular constraint decomposes into two independent House Robber I DP passes: nums[0..n-2] and nums[1..n-1].",
    solution: {
      python: `def rob(nums):
    if len(nums) == 1:
        return nums[0]
    def rob_linear(arr):
        rob1, rob2 = 0, 0
        for n in arr:
            new_rob = max(rob1 + n, rob2)
            rob1 = rob2
            rob2 = new_rob
        return rob2
    return max(rob_linear(nums[:-1]), rob_linear(nums[1:]))`,
      typescript: `function rob(nums: number[]): number {
  if (nums.length === 1) return nums[0]!;
  function robLinear(arr: number[]): number {
    let rob1 = 0;
    let rob2 = 0;
    for (const n of arr) {
      const newRob = Math.max(rob1 + n, rob2);
      rob1 = rob2;
      rob2 = newRob;
    }
    return rob2;
  }
  return Math.max(robLinear(nums.slice(0, -1)), robLinear(nums.slice(1)));
}`,
    },
    sandbox: {
      id: "house-robber-ii",
      fn: { python: "rob", javascript: "rob" },
      starter: {
        python: `def rob(nums):
    # Return max amount robbed in circular neighborhood
    return 0
`,
        javascript: `function rob(nums) {
  // Return max amount robbed in circular neighborhood
  return 0;
}
`,
      },
      cases: [
        { args: [[2, 3, 2]], expect: 3 },
        { args: [[1, 2, 3, 1]], expect: 4 },
        { args: [[1, 2, 3]], expect: 3 },
      ],
    },
  },

  "contains-duplicate": {
    id: 217,
    slug: "contains-duplicate",
    title: "Contains Duplicate",
    difficulty: "Easy",
    topics: ["Arrays", "Hash Tables", "Sorting"],
    pattern: "Hash set membership test",
    description: `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.`,
    examples: `Input: nums = [1,2,3,1]
Output: true

Input: nums = [1,2,3,4]
Output: false

Input: nums = [1,1,1,3,3,4,3,2,4,2]
Output: true`,
    constraints: `1 ≤ nums.length ≤ 10⁵
-10⁹ ≤ nums[i] ≤ 10⁹`,
    hints: [
      "Add elements to a hash set as you traverse. If an element is already in the set, a duplicate exists.",
    ],
    thesis: "Single O(n) pass using a hash set to detect duplicate elements immediately.",
    solution: {
      python: `def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
      typescript: `function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
    },
    sandbox: {
      id: "contains-duplicate",
      fn: { python: "contains_duplicate", javascript: "containsDuplicate" },
      starter: {
        python: `def contains_duplicate(nums):
    # Return True if any value appears twice, else False
    return False
`,
        javascript: `function containsDuplicate(nums) {
  // Return true if any value appears twice, else false
  return false;
}
`,
      },
      cases: [
        { args: [[1, 2, 3, 1]], expect: true },
        { args: [[1, 2, 3, 4]], expect: false },
        { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expect: true },
      ],
    },
  },

  "invert-binary-tree": {
    id: 226,
    slug: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    topics: ["Binary Trees", "Recursion & Backtracking"],
    pattern: "Recursive child pointer swap",
    description: `Given the \`root\` of a binary tree, invert the tree, and return its root.`,
    examples: `Input: root = [4,2,7,1,3,6,9]
Output: [4,7,2,9,6,3,1]

Input: root = [2,1,3]
Output: [2,3,1]

Input: root = []
Output: []`,
    constraints: `The number of nodes in the tree is in the range [0, 100].
-100 ≤ Node.val ≤ 100`,
    hints: [
      "Swap root.left and root.right, then recursively invert both subtrees.",
    ],
    thesis: "Post-order or pre-order recursive child pointer exchange on every node.",
    solution: {
      python: `def invert_tree(root):
    if not root:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
      typescript: `function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}`,
    },
    sandbox: {
      id: "invert-binary-tree",
      fn: { python: "invert_tree", javascript: "invertTree" },
      shape: "tree",
      starter: {
        python: `def invert_tree(root):
    # Invert binary tree and return root
    return None
`,
        javascript: `function invertTree(root) {
  // Invert binary tree and return root
  return null;
}
`,
      },
      cases: [
        { args: [[4, 2, 7, 1, 3, 6, 9]], expect: [4, 7, 2, 9, 6, 3, 1] },
        { args: [[2, 1, 3]], expect: [2, 3, 1] },
        { args: [[]], expect: [] },
      ],
    },
  },

  "missing-number": {
    id: 268,
    slug: "missing-number",
    title: "Missing Number",
    difficulty: "Easy",
    topics: ["Arrays", "Bit Manipulation", "Math"],
    pattern: "Gauss formula / XOR cancellation",
    description: `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.`,
    examples: `Input: nums = [3,0,1]
Output: 2
Explanation: n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number.

Input: nums = [0,1]
Output: 2

Input: nums = [9,6,4,2,3,5,7,0,1]
Output: 8`,
    constraints: `n == nums.length
1 ≤ n ≤ 10⁴
0 ≤ nums[i] ≤ n
All the numbers of nums are unique.`,
    hints: [
      "Expected sum of 0..n is n*(n+1)//2. Subtract sum(nums) from expected sum to find the missing number.",
    ],
    thesis: "Math formula n*(n+1)//2 - sum(nums) calculates missing element in O(n) time and O(1) space.",
    solution: {
      python: `def missing_number(nums):
    n = len(nums)
    expected = n * (n + 1) // 2
    return expected - sum(nums)`,
      typescript: `function missingNumber(nums: number[]): number {
  const n = nums.length;
  const expected = (n * (n + 1)) / 2;
  const actual = nums.reduce((a, b) => a + b, 0);
  return expected - actual;
}`,
    },
    sandbox: {
      id: "missing-number",
      fn: { python: "missing_number", javascript: "missingNumber" },
      starter: {
        python: `def missing_number(nums):
    # Return the missing number in [0, n]
    return 0
`,
        javascript: `function missingNumber(nums) {
  // Return the missing number in [0, n]
  return 0;
}
`,
      },
      cases: [
        { args: [[3, 0, 1]], expect: 2 },
        { args: [[0, 1]], expect: 2 },
        { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expect: 8 },
        { args: [[0]], expect: 1 },
      ],
    },
  },

  "counting-bits": {
    id: 338,
    slug: "counting-bits",
    title: "Counting Bits",
    difficulty: "Easy",
    topics: ["Dynamic Programming", "Bit Manipulation"],
    pattern: "Least significant bit recurrence",
    description: `Given an integer \`n\`, return an array \`ans\` of length \`n + 1\` such that for each \`i\` (\`0 <= i <= n\`), \`ans[i]\` is the **number of 1's** in the binary representation of \`i\`.`,
    examples: `Input: n = 2
Output: [0,1,1]
Explanation:
0 --> 0
1 --> 1
2 --> 10

Input: n = 5
Output: [0,1,1,2,1,2]`,
    constraints: `0 ≤ n ≤ 10⁵`,
    hints: [
      "dp[i] = dp[i >> 1] + (i & 1). Shifting right removes the lowest bit; add 1 if lowest bit was set.",
    ],
    thesis: "Dynamic programming using right-shift: dp[i] = dp[i // 2] + (i % 2).",
    solution: {
      python: `def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp`,
      typescript: `function countBits(n: number): number[] {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i >> 1] + (i & 1);
  }
  return dp;
}`,
    },
    sandbox: {
      id: "counting-bits",
      fn: { python: "count_bits", javascript: "countBits" },
      starter: {
        python: `def count_bits(n):
    # Return list of bit counts from 0 to n
    return []
`,
        javascript: `function countBits(n) {
  // Return list of bit counts from 0 to n
  return [];
}
`,
      },
      cases: [
        { args: [2], expect: [0, 1, 1] },
        { args: [5], expect: [0, 1, 1, 2, 1, 2] },
      ],
    },
  },

  "sum-of-two-integers": {
    id: 371,
    slug: "sum-of-two-integers",
    title: "Sum of Two Integers",
    difficulty: "Medium",
    topics: ["Math", "Bit Manipulation"],
    pattern: "Bitwise half-adder simulation",
    description: `Given two integers \`a\` and \`b\`, return the sum of the two integers without using the operators \`+\` and \`-\`.`,
    examples: `Input: a = 1, b = 2
Output: 3

Input: a = 2, b = 3
Output: 5`,
    constraints: `-1000 ≤ a, b ≤ 1000`,
    hints: [
      "XOR (a ^ b) gives the sum without carry. AND shifted left ((a & b) << 1) gives the carry. Repeat until carry is 0.",
    ],
    thesis: "Hardware adder logic: sum = a ^ b, carry = (a & b) << 1, looping until carry vanishes.",
    solution: {
      python: `def get_sum(a, b):
    mask = 0xFFFFFFFF
    while b & mask:
        carry = (a & b) << 1
        a = a ^ b
        b = carry
    return a if b > 0 else (a & mask) if a <= 0x7FFFFFFF else ~(a ^ mask)`,
      typescript: `function getSum(a: number, b: number): number {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a = a ^ b;
    b = carry;
  }
  return a;
}`,
    },
    sandbox: {
      id: "sum-of-two-integers",
      fn: { python: "get_sum", javascript: "getSum" },
      starter: {
        python: `def get_sum(a, b):
    # Return sum without using + or -
    return 0
`,
        javascript: `function getSum(a, b) {
  // Return sum without using + or -
  return 0;
}
`,
      },
      cases: [
        { args: [1, 2], expect: 3 },
        { args: [2, 3], expect: 5 },
        { args: [-1, 1], expect: 0 },
      ],
    },
  },

  "pacific-atlantic-water-flow": {
    id: 417,
    slug: "pacific-atlantic-water-flow",
    title: "Pacific Atlantic Water Flow",
    difficulty: "Medium",
    topics: ["Arrays", "Matrix", "Graphs", "DFS", "BFS"],
    pattern: "Reverse flow multi-source search",
    description: `There is an \`m x n\` rectangular island that borders both the **Pacific Ocean** and **Atlantic Ocean**. The Pacific Ocean touches the island's left and top edges, and the Atlantic Ocean touches the island's right and bottom edges.

Rain water can flow to neighboring cells in 4 directions if the neighboring cell's height is **less than or equal to** the current cell's height.

Return a 2D list of grid coordinates \`result\` where \`result[i] = [ri, ci]\` denotes that rain water can flow from cell \`(ri, ci)\` to **both** the Pacific and Atlantic oceans.`,
    examples: `Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]
Output: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]`,
    constraints: `m == heights.length, n == heights[r].length
1 ≤ m, n ≤ 200
0 ≤ heights[r][c] ≤ 10⁵`,
    hints: [
      "Instead of checking if water flows down to oceans, reverse the search: start at ocean borders and flow uphill (height >= prev_height).",
      "Intersect cells reachable from Pacific with cells reachable from Atlantic.",
    ],
    thesis: "Reverse flood-fill from Pacific and Atlantic borders uphill; intersection gives cells reaching both oceans.",
    solution: {
      python: `def pacific_atlantic(heights):
    if not heights: return []
    R, C = len(heights), len(heights[0])
    pac = set()
    atl = set()
    def dfs(r, c, visited, prev_val):
        if r < 0 or r >= R or c < 0 or c >= C or (r, c) in visited or heights[r][c] < prev_val:
            return
        visited.add((r, c))
        for dr, dc in [(1,0), (-1,0), (0,1), (0,-1)]:
            dfs(r + dr, c + dc, visited, heights[r][c])
    for r in range(R):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, C - 1, atl, heights[r][C - 1])
    for c in range(C):
        dfs(0, c, pac, heights[0][c])
        dfs(R - 1, c, atl, heights[R - 1][c])
    return [[r, c] for (r, c) in (pac & atl)]`,
      typescript: `function pacificAtlantic(heights: number[][]): number[][] {
  if (!heights.length) return [];
  const R = heights.length;
  const C = heights[0]!.length;
  const pac = Array.from({ length: R }, () => new Array(C).fill(false));
  const atl = Array.from({ length: R }, () => new Array(C).fill(false));
  function dfs(r: number, c: number, visited: boolean[][], prevVal: number) {
    if (r < 0 || r >= R || c < 0 || c >= C || visited[r]![c] || heights[r]![c]! < prevVal) return;
    visited[r]![c] = true;
    dfs(r + 1, c, visited, heights[r]![c]!);
    dfs(r - 1, c, visited, heights[r]![c]!);
    dfs(r, c + 1, visited, heights[r]![c]!);
    dfs(r, c - 1, visited, heights[r]![c]!);
  }
  for (let r = 0; r < R; r++) {
    dfs(r, 0, pac, heights[r]![0]!);
    dfs(r, C - 1, atl, heights[r]![C - 1]!);
  }
  for (let c = 0; c < C; c++) {
    dfs(0, c, pac, heights[0]![c]!);
    dfs(R - 1, c, atl, heights[R - 1]![c]!);
  }
  const res: number[][] = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (pac[r]![c] && atl[r]![c]) res.push([r, c]);
    }
  }
  return res;
}`,
    },
    sandbox: {
      id: "pacific-atlantic-water-flow",
      fn: { python: "pacific_atlantic", javascript: "pacificAtlantic" },
      compare: "set",
      starter: {
        python: `def pacific_atlantic(heights):
    # Return list of [r, c] coordinates reaching both oceans
    return []
`,
        javascript: `function pacificAtlantic(heights) {
  // Return list of [r, c] coordinates reaching both oceans
  return [];
}
`,
      },
      cases: [
        {
          args: [[[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]],
          expect: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]],
        },
      ],
    },
  },

  "longest-repeating-character-replacement": {
    id: 424,
    slug: "longest-repeating-character-replacement",
    title: "Longest Repeating Character Replacement",
    difficulty: "Medium",
    topics: ["Hash Tables", "Strings", "Sliding Window"],
    pattern: "Dynamic frequency window",
    description: `You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.`,
    examples: `Input: s = "ABAB", k = 2
Output: 4
Explanation: Replace the two 'A's with two 'B's or vice versa.

Input: s = "AABABBA", k = 1
Output: 4
Explanation: Replace the one 'A' in the middle with 'B' and form "AABBBBA". The substring "BBBB" has the longest repeating letters, which is 4.`,
    constraints: `1 ≤ s.length ≤ 10⁵
s consists of only uppercase English letters.
0 ≤ k ≤ s.length`,
    hints: [
      "A window is valid if (window_length - max_frequency) <= k.",
      "Expand the right pointer while tracking counts. If invalid, shrink the window from the left.",
    ],
    thesis: "Sliding window where window length - max character count <= k defines feasibility.",
    solution: {
      python: `def character_replacement(s, k):
    count = {}
    res = 0
    l = 0
    max_f = 0
    for r in range(len(s)):
        count[s[r]] = count.get(s[r], 0) + 1
        max_f = max(max_f, count[s[r]])
        while (r - l + 1) - max_f > k:
            count[s[l]] -= 1
            l += 1
        res = max(res, r - l + 1)
    return res`,
      typescript: `function characterReplacement(s: string, k: number): number {
  const count = new Map<string, number>();
  let res = 0;
  let l = 0;
  let maxF = 0;
  for (let r = 0; r < s.length; r++) {
    const char = s[r]!;
    count.set(char, (count.get(char) || 0) + 1);
    maxF = Math.max(maxF, count.get(char)!);
    while ((r - l + 1) - maxF > k) {
      count.set(s[l]!, count.get(s[l]!)! - 1);
      l++;
    }
    res = Math.max(res, r - l + 1);
  }
  return res;
}`,
    },
    sandbox: {
      id: "longest-repeating-character-replacement",
      fn: { python: "character_replacement", javascript: "characterReplacement" },
      starter: {
        python: `def character_replacement(s, k):
    # Return max length of uniform substring after at most k replacements
    return 0
`,
        javascript: `function characterReplacement(s, k) {
  // Return max length of uniform substring after at most k replacements
  return 0;
}
`,
      },
      cases: [
        { args: ["ABAB", 2], expect: 4 },
        { args: ["AABABBA", 1], expect: 4 },
      ],
    },
  },

  "coin-change-ii": {
    id: 518,
    slug: "coin-change-ii",
    title: "Coin Change II",
    difficulty: "Medium",
    topics: ["Arrays", "Dynamic Programming"],
    pattern: "Unbounded knapsack combinations DP",
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`0\`.

You may assume that you have an infinite number of each kind of coin.`,
    examples: `Input: amount = 5, coins = [1,2,5]
Output: 4
Explanation: there are four ways to make up the amount:
5=5
5=2+2+1
5=2+1+1+1
5=1+1+1+1+1

Input: amount = 3, coins = [2]
Output: 0

Input: amount = 10, coins = [10]
Output: 1`,
    constraints: `1 ≤ coins.length ≤ 300
1 ≤ coins[i] ≤ 5000
All the values of coins are unique.
0 ≤ amount ≤ 5000`,
    hints: [
      "To count combinations (not permutations), iterate through coins in outer loop and amounts in inner loop: dp[a] += dp[a - coin].",
    ],
    thesis: "Outer coin loop with inner amount scan accumulates unordered change combinations.",
    solution: {
      python: `def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for coin in coins:
        for a in range(coin, amount + 1):
            dp[a] += dp[a - coin]
    return dp[amount]`,
      typescript: `function change(amount: number, coins: number[]): number {
  const dp = new Array(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) {
      dp[a] += dp[a - coin];
    }
  }
  return dp[amount];
}`,
    },
    sandbox: {
      id: "coin-change-ii",
      fn: { python: "change", javascript: "change" },
      starter: {
        python: `def change(amount, coins):
    # Return number of combinations making up amount
    return 0
`,
        javascript: `function change(amount, coins) {
  // Return number of combinations making up amount
  return 0;
}
`,
      },
      cases: [
        { args: [5, [1, 2, 5]], expect: 4 },
        { args: [3, [2]], expect: 0 },
        { args: [10, [10]], expect: 1 },
      ],
    },
  },

  "subtree-of-another-tree": {
    id: 572,
    slug: "subtree-of-another-tree",
    title: "Subtree of Another Tree",
    difficulty: "Easy",
    topics: ["Binary Trees", "Recursion & Backtracking"],
    pattern: "DFS with structural tree equality check",
    description: `Given the roots of two binary trees \`root\` and \`subRoot\`, return \`true\` if there is a subtree of \`root\` with the same structure and node values of \`subRoot\` and \`false\` otherwise.

A subtree of a binary tree \`tree\` is a tree that consists of a node in \`tree\` and all of this node's descendants.`,
    examples: `Input: root = [3,4,5,1,2], subRoot = [4,1,2]
Output: true

Input: root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]
Output: false`,
    constraints: `The number of nodes in the root tree is in the range [1, 2000].
The number of nodes in the subRoot tree is in the range [1, 1000].
-10⁴ ≤ root.val ≤ 10⁴
-10⁴ ≤ subRoot.val ≤ 10⁴`,
    hints: [
      "Write a helper isSameTree(s, t). At each node of root, if isSameTree(root, subRoot) is true, return true. Otherwise recursively check root.left and root.right.",
    ],
    thesis: "Recursive pre-order traversal invoking exact subtree identity comparator at each candidate node.",
    solution: {
      python: `def is_subtree(root, sub_root):
    if not sub_root: return True
    if not root: return False
    def same(p, q):
        if not p and not q: return True
        if not p or not q or p.val != q.val: return False
        return same(p.left, q.left) and same(p.right, q.right)
    if same(root, sub_root):
        return True
    return is_subtree(root.left, sub_root) or is_subtree(root.right, sub_root)`,
      typescript: `function isSubtree(root: TreeNode | null, subRoot: TreeNode | null): boolean {
  if (!subRoot) return true;
  if (!root) return false;
  function same(p: TreeNode | null, q: TreeNode | null): boolean {
    if (!p && !q) return true;
    if (!p || !q || p.val !== q.val) return false;
    return same(p.left, q.left) && same(p.right, q.right);
  }
  if (same(root, subRoot)) return true;
  return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
    },
    sandbox: {
      id: "subtree-of-another-tree",
      fn: { python: "is_subtree", javascript: "isSubtree" },
      shape: "tree",
      starter: {
        python: `def is_subtree(root, sub_root):
    # Return True if sub_root is a subtree of root
    return False
`,
        javascript: `function isSubtree(root, subRoot) {
  // Return true if subRoot is a subtree of root
  return false;
}
`,
      },
      cases: [
        { args: [[3, 4, 5, 1, 2], [4, 1, 2]], expect: true },
        { args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expect: false },
      ],
    },
  },

  "valid-palindrome-ii": {
    id: 680,
    slug: "valid-palindrome-ii",
    title: "Valid Palindrome II",
    difficulty: "Easy",
    topics: ["Two Pointers", "Strings"],
    pattern: "Two pointers with one-chance deletion",
    description: `Given a string \`s\`, return \`true\` if the \`s\` can be palindrome after deleting **at most one** character from it.`,
    examples: `Input: s = "aba"
Output: true

Input: s = "abca"
Output: true
Explanation: You could delete the character 'c'.

Input: s = "abc"
Output: false`,
    constraints: `1 ≤ s.length ≤ 10⁵
s consists of lowercase English letters.`,
    hints: [
      "Use two pointers from left and right. When s[l] != s[r], check if either s[l+1..r] or s[l..r-1] is a palindrome.",
    ],
    thesis: "Inward pointer scan branch: upon first mismatch, test palindrome validity of skipping either left or right character.",
    solution: {
      python: `def valid_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            skip_l = s[l+1:r+1]
            skip_r = s[l:r]
            return skip_l == skip_l[::-1] or skip_r == skip_r[::-1]
        l += 1
        r -= 1
    return True`,
      typescript: `function validPalindrome(s: string): boolean {
  function isPal(left: number, right: number): boolean {
    while (left < right) {
      if (s[left] !== s[right]) return false;
      left++;
      right--;
    }
    return true;
  }
  let l = 0;
  let r = s.length - 1;
  while (l < r) {
    if (s[l] !== s[r]) {
      return isPal(l + 1, r) || isPal(l, r - 1);
    }
    l++;
    r--;
  }
  return true;
}`,
    },
    sandbox: {
      id: "valid-palindrome-ii",
      fn: { python: "valid_palindrome", javascript: "validPalindrome" },
      starter: {
        python: `def valid_palindrome(s):
    # Return True if s is palindrome after at most 1 deletion
    return False
`,
        javascript: `function validPalindrome(s) {
  // Return true if s is palindrome after at most 1 deletion
  return false;
}
`,
      },
      cases: [
        { args: ["aba"], expect: true },
        { args: ["abca"], expect: true },
        { args: ["abc"], expect: false },
        { args: ["deeee"], expect: true },
      ],
    },
  },

  "max-area-of-island": {
    id: 695,
    slug: "max-area-of-island",
    title: "Max Area of Island",
    difficulty: "Medium",
    topics: ["Arrays", "Matrix", "DFS", "BFS"],
    pattern: "Connected component area accumulation",
    description: `You are given an \`m x n\` binary matrix \`grid\`. An island is a group of \`1\`'s (representing land) connected **4-directionally** (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water.

The **area** of an island is the number of cells with a value \`1\` in the island.

Return the maximum **area** of an island in \`grid\`. If there is no island, return \`0\`.`,
    examples: `Input: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]
Output: 6`,
    constraints: `m == grid.length, n == grid[i].length
1 ≤ m, n ≤ 50
grid[i][j] is either 0 or 1.`,
    hints: [
      "For each cell with grid[r][c] == 1, run DFS/BFS to sum up all connected 1s and mutate visited cells to 0.",
    ],
    thesis: "Grid flood-fill DFS accumulating area per connected component with in-place zeroing.",
    solution: {
      python: `def max_area_of_island(grid):
    R, C = len(grid), len(grid[0])
    def dfs(r, c):
        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)
    max_area = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 1:
                max_area = max(max_area, dfs(r, c))
    return max_area`,
      typescript: `function maxAreaOfIsland(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0]!.length;
  function dfs(r: number, c: number): number {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r]![c] !== 1) return 0;
    grid[r]![c] = 0;
    return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1);
  }
  let maxArea = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r]![c] === 1) {
        maxArea = Math.max(maxArea, dfs(r, c));
      }
    }
  }
  return maxArea;
}`,
    },
    sandbox: {
      id: "max-area-of-island",
      fn: { python: "max_area_of_island", javascript: "maxAreaOfIsland" },
      starter: {
        python: `def max_area_of_island(grid):
    # Return max area of any island
    return 0
`,
        javascript: `function maxAreaOfIsland(grid) {
  // Return max area of any island
  return 0;
}
`,
      },
      cases: [
        {
          args: [[[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]],
          expect: 6,
        },
        {
          args: [[[0,0,0,0,0,0,0,0]]],
          expect: 0,
        },
      ],
    },
  },

  "binary-search": {
    id: 704,
    slug: "binary-search",
    title: "Binary Search",
    difficulty: "Easy",
    topics: ["Arrays", "Binary Search"],
    pattern: "Exact target search in sorted array",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: `Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4

Input: nums = [-1,0,3,5,9,12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1`,
    constraints: `1 ≤ nums.length ≤ 10⁴
-10⁴ < nums[i], target < 10⁴
All the integers in nums are unique.
nums is sorted in ascending order.`,
    hints: [
      "Maintain low = 0 and high = len(nums) - 1. Halve the search space by comparing nums[mid] to target.",
    ],
    thesis: "Classic closed-interval [low, high] binary search halving remaining domain per iteration.",
    solution: {
      python: `def search(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
      typescript: `function search(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    else if (nums[mid]! < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    },
    sandbox: {
      id: "binary-search",
      fn: { python: "search", javascript: "search" },
      starter: {
        python: `def search(nums, target):
    # Return index of target in nums, or -1
    return -1
`,
        javascript: `function search(nums, target) {
  // Return index of target in nums, or -1
  return -1;
}
`,
      },
      cases: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expect: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expect: -1 },
        { args: [[5], 5], expect: 0 },
        { args: [[5], -5], expect: -1 },
      ],
    },
  },

  "min-cost-climbing-stairs": {
    id: 746,
    slug: "min-cost-climbing-stairs",
    title: "Min Cost Climbing Stairs",
    difficulty: "Easy",
    topics: ["Arrays", "Dynamic Programming"],
    pattern: "Rolling DP 2-step recurrence",
    description: `You are given an integer array \`cost\` where \`cost[i]\` is the cost of \`i-th\` step on a staircase. Once you pay the cost, you can either climb one or two steps.

You can either start from the step with index \`0\`, or the step with index \`1\`.

Return the minimum cost to reach the top of the floor.`,
    examples: `Input: cost = [10,15,20]
Output: 15
Explanation: You will start at index 1.
- Pay 15 and climb two steps to reach the top.
The total cost is 15.

Input: cost = [1,100,1,1,1,100,1,1,100,1]
Output: 6`,
    constraints: `2 ≤ cost.length ≤ 1000
0 ≤ cost[i] ≤ 999`,
    hints: [
      "dp[i] = cost[i] + min(dp[i+1], dp[i+2]) working backwards from the top.",
    ],
    thesis: "Constant space backward DP computing minimum cost to summit via 1-step or 2-step jumps.",
    solution: {
      python: `def min_cost_climbing_stairs(cost):
    down_one, down_two = 0, 0
    for i in range(2, len(cost) + 1):
        curr = min(down_one + cost[i - 1], down_two + cost[i - 2])
        down_two = down_one
        down_one = curr
    return down_one`,
      typescript: `function minCostClimbingStairs(cost: number[]): number {
  let downOne = 0;
  let downTwo = 0;
  for (let i = 2; i <= cost.length; i++) {
    const curr = Math.min(downOne + cost[i - 1]!, downTwo + cost[i - 2]!);
    downTwo = downOne;
    downOne = curr;
  }
  return downOne;
}`,
    },
    sandbox: {
      id: "min-cost-climbing-stairs",
      fn: { python: "min_cost_climbing_stairs", javascript: "minCostClimbingStairs" },
      starter: {
        python: `def min_cost_climbing_stairs(cost):
    # Return minimum cost to reach the top
    return 0
`,
        javascript: `function minCostClimbingStairs(cost) {
  // Return minimum cost to reach the top
  return 0;
}
`,
      },
      cases: [
        { args: [[10, 15, 20]], expect: 15 },
        { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expect: 6 },
      ],
    },
  },

  "cheapest-flights-within-k-stops": {
    id: 787,
    slug: "cheapest-flights-within-k-stops",
    title: "Cheapest Flights Within K Stops",
    difficulty: "Medium",
    topics: ["Dynamic Programming", "Graphs", "Shortest Path", "BFS"],
    pattern: "Bellman-Ford / layer BFS with stop counter",
    description: `There are \`n\` cities connected by some number of flights. You are given an array \`flights\` where \`flights[i] = [fromi, toi, pricei]\` indicates that there is a flight from city \`fromi\` to city \`toi\` with cost \`pricei\`.

You are also given three integers \`src\`, \`dst\`, and \`k\`, return the **cheapest price** from \`src\` to \`dst\` with at most \`k\` stops. If there is no such route, return \`-1\`.`,
    examples: `Input: n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1
Output: 700
Explanation:
The optimal path with at most 1 stop from city 0 to 3 has cost 100 + 600 = 700.

Input: n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1
Output: 200`,
    constraints: `1 ≤ n ≤ 100
0 ≤ flights.length ≤ (n * (n - 1) / 2)
flights[i].length == 3
0 ≤ fromi, toi < n
fromi != toi
1 ≤ pricei ≤ 10⁴
There will not be any multiple flights between two cities.
0 ≤ src, dst, k < n
src != dst`,
    hints: [
      "Use Bellman-Ford relaxed exactly k + 1 times (each iteration corresponds to at most i stops).",
      "Clone the distances array before each round so relaxing an edge doesn't cascade in the same step.",
    ],
    thesis: "Bellman-Ford algorithm executed for k+1 iterations using a cloned distance vector prevents over-relaxing within one hop.",
    solution: {
      python: `def find_cheapest_price(n, flights, src, dst, k):
    prices = [float('inf')] * n
    prices[src] = 0
    for _ in range(k + 1):
        tmp_prices = list(prices)
        for u, v, w in flights:
            if prices[u] == float('inf'):
                continue
            if prices[u] + w < tmp_prices[v]:
                tmp_prices[v] = prices[u] + w
        prices = tmp_prices
    return prices[dst] if prices[dst] != float('inf') else -1`,
      typescript: `function findCheapestPrice(n: number, flights: number[][], src: number, dst: number, k: number): number {
  let prices = new Array(n).fill(Infinity);
  prices[src] = 0;
  for (let i = 0; i <= k; i++) {
    const tmp = [...prices];
    for (const [u, v, w] of flights) {
      if (prices[u!] === Infinity) continue;
      if (prices[u!] + w! < tmp[v!]!) {
        tmp[v!] = prices[u!] + w!;
      }
    }
    prices = tmp;
  }
  return prices[dst] === Infinity ? -1 : prices[dst];
}`,
    },
    sandbox: {
      id: "cheapest-flights-within-k-stops",
      fn: { python: "find_cheapest_price", javascript: "findCheapestPrice" },
      starter: {
        python: `def find_cheapest_price(n, flights, src, dst, k):
    # Return cheapest price with at most k stops or -1
    return -1
`,
        javascript: `function findCheapestPrice(n, flights, src, dst, k) {
  // Return cheapest price with at most k stops or -1
  return -1;
}
`,
      },
      cases: [
        { args: [4, [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], 0, 3, 1], expect: 700 },
        { args: [3, [[0,1,100],[1,2,100],[0,2,500]], 0, 2, 1], expect: 200 },
      ],
    },
  },

  "rotting-oranges": {
    id: 994,
    slug: "rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "Medium",
    topics: ["Arrays", "Matrix", "BFS"],
    pattern: "Multi-source level-order BFS",
    description: `You are given an \`m x n\` grid where each cell can have one of three values:
- \`0\` representing an empty cell,
- \`1\` representing a fresh orange, or
- \`2\` representing a rotten orange.

Every minute, any fresh orange that is **4-directionally adjacent** to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return \`-1\`.`,
    examples: `Input: grid = [[2,1,1],[1,1,0],[0,1,1]]
Output: 4

Input: grid = [[2,1,1],[0,1,1],[1,0,1]]
Output: -1
Explanation: The orange in the bottom left corner (row 2, column 0) is never rotten, because rotting only happens 4-directionally.

Input: grid = [[0,2]]
Output: 0
Explanation: Since there are already no fresh oranges at minute 0, the answer is just 0.`,
    constraints: `m == grid.length, n == grid[i].length
1 ≤ m, n ≤ 10
grid[i][j] is 0, 1, or 2.`,
    hints: [
      "Enqueue all initially rotten oranges (2) into a queue and count fresh oranges (1).",
      "Process the queue level by level (each level = 1 minute), infecting neighbors. Decrement fresh count. If fresh == 0, return minutes.",
    ],
    thesis: "Simultaneous multi-source BFS counting elapsed minute rounds until all connected fresh fruit is spoiled.",
    solution: {
      python: `from collections import deque

def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1
    if fresh == 0:
        return 0
    minutes = 0
    while q and fresh > 0:
        minutes += 1
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in [(1,0), (-1,0), (0,1), (0,-1)]:
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
    return minutes if fresh == 0 else -1`,
      typescript: `function orangesRotting(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0]!.length;
  const q: [number, number][] = [];
  let fresh = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r]![c] === 2) q.push([r, c]);
      else if (grid[r]![c] === 1) fresh++;
    }
  }
  if (fresh === 0) return 0;
  let minutes = 0;
  while (q.length > 0 && fresh > 0) {
    minutes++;
    const size = q.length;
    for (let i = 0; i < size; i++) {
      const [r, c] = q.shift()!;
      for (const [dr, dc] of [[1,0], [-1,0], [0,1], [0,-1]]) {
        const nr = r + dr!;
        const nc = c + dc!;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr]![nc] === 1) {
          grid[nr]![nc] = 2;
          fresh--;
          q.push([nr, nc]);
        }
      }
    }
  }
  return fresh === 0 ? minutes : -1;
}`,
    },
    sandbox: {
      id: "rotting-oranges",
      fn: { python: "oranges_rotting", javascript: "orangesRotting" },
      starter: {
        python: `def oranges_rotting(grid):
    # Return minutes until all oranges rot, or -1
    return 0
`,
        javascript: `function orangesRotting(grid) {
  // Return minutes until all oranges rot, or -1
  return 0;
}
`,
      },
      cases: [
        { args: [[[2,1,1],[1,1,0],[0,1,1]]], expect: 4 },
        { args: [[[2,1,1],[0,1,1],[1,0,1]]], expect: -1 },
        { args: [[[0,2]]], expect: 0 },
      ],
    },
  },

  "last-stone-weight": {
    id: 1046,
    slug: "last-stone-weight",
    title: "Last Stone Weight",
    difficulty: "Easy",
    topics: ["Arrays", "Heaps"],
    pattern: "Max-heap simulation",
    description: `You are given an array of integers \`stones\` where \`stones[i]\` is the weight of the \`i-th\` stone.

We are playing a game with the stones. On each turn, we choose the **heaviest two stones** and smash them together. Suppose the heaviest two stones have weights \`x\` and \`y\` with \`x <= y\`. The result of this smash is:
- If \`x == y\`, both stones are destroyed.
- If \`x != y\`, the stone of weight \`x\` is destroyed, and the stone of weight \`y\` has new weight \`y - x\`.

At the end of the game, there is **at most one** stone left. Return the weight of the last remaining stone. If there are no stones left, return \`0\`.`,
    examples: `Input: stones = [2,7,4,1,8,1]
Output: 1
Explanation: 
We combine 7 and 8 to get 1 so the array converts to [2,4,1,1,1] then,
we combine 2 and 4 to get 2 so the array converts to [2,1,1,1] then,
we combine 2 and 1 to get 1 so the array converts to [1,1,1] then,
we combine 1 and 1 to get 0 so the array converts to [1] then that's the value of the last stone.

Input: stones = [1]
Output: 1`,
    constraints: `1 ≤ stones.length ≤ 30
1 ≤ stones[i] ≤ 1000`,
    hints: [
      "Use a max-heap (negated values in Python heapq). In each step pop the two largest. If diff > 0, push diff back.",
    ],
    thesis: "Max-heap repeatedly extracting and resolving the top two stones until <= 1 remain.",
    solution: {
      python: `import heapq

def last_stone_weight(stones):
    h = [-x for x in stones]
    heapq.heapify(h)
    while len(h) > 1:
        first = -heapq.heappop(h)
        second = -heapq.heappop(h)
        if first != second:
            heapq.heappush(h, -(first - second))
    return -h[0] if h else 0`,
      typescript: `function lastStoneWeight(stones: number[]): number {
  while (stones.length > 1) {
    stones.sort((a, b) => a - b);
    const y = stones.pop()!;
    const x = stones.pop()!;
    if (x !== y) {
      stones.push(y - x);
    }
  }
  return stones.length === 1 ? stones[0]! : 0;
}`,
    },
    sandbox: {
      id: "last-stone-weight",
      fn: { python: "last_stone_weight", javascript: "lastStoneWeight" },
      starter: {
        python: `def last_stone_weight(stones):
    # Return weight of last stone or 0
    return 0
`,
        javascript: `function lastStoneWeight(stones) {
  // Return weight of last stone or 0
  return 0;
}
`,
      },
      cases: [
        { args: [[2, 7, 4, 1, 8, 1]], expect: 1 },
        { args: [[1]], expect: 1 },
        { args: [[2, 2]], expect: 0 },
      ],
    },
  },

  "copy-list-with-random-pointer": {
    id: 138,
    slug: "copy-list-with-random-pointer",
    title: "Copy List with Random Pointer",
    difficulty: "Medium",
    topics: ["Hash Tables", "Linked Lists"],
    pattern: "Interweaved node cloning / hash map mapping",
    description: `A linked list of length \`n\` is given such that each node contains an additional random pointer, which could point to any node in the list, or \`null\`.

Construct a **deep copy** of the list. The deep copy should consist of exactly \`n\` **brand new** nodes, where each new node has its value set to the value of its corresponding original node. Both the \`next\` and \`random\` pointer of the new nodes should point to new nodes in the copied list such that the pointers in the original list and copied list represent the same list state. None of the pointers in the new list should point to nodes in the original list.

Return the head of the copied linked list.`,
    examples: `Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]

Input: head = [[1,1],[2,1]]
Output: [[1,1],[2,1]]`,
    constraints: `0 ≤ n ≤ 1000
-10⁴ ≤ Node.val ≤ 10⁴
Node.random is null or is pointing to some node in the linked list.`,
    hints: [
      "Use a hash map mapping old_node -> new Node(old_node.val). Then in a second pass, link new_node.next and new_node.random.",
    ],
    thesis: "Two-pass hash map mapping every original node to its clone before wiring next and random pointers.",
    solution: {
      python: `def copy_random_list(head):
    if not head:
        return None
    old_to_new = {}
    curr = head
    while curr:
        old_to_new[curr] = Node(curr.val)
        curr = curr.next
    curr = head
    while curr:
        old_to_new[curr].next = old_to_new.get(curr.next)
        old_to_new[curr].random = old_to_new.get(curr.random)
        curr = curr.next
    return old_to_new[head]`,
      typescript: `function copyRandomList(head: Node | null): Node | null {
  if (!head) return null;
  const oldToNew = new Map<Node, Node>();
  let curr: Node | null = head;
  while (curr) {
    oldToNew.set(curr, new Node(curr.val));
    curr = curr.next;
  }
  curr = head;
  while (curr) {
    const clone = oldToNew.get(curr)!;
    clone.next = curr.next ? oldToNew.get(curr.next)! : null;
    clone.random = curr.random ? oldToNew.get(curr.random)! : null;
    curr = curr.next;
  }
  return oldToNew.get(head)!;
}`,
    },
    sandbox: {
      id: "copy-list-with-random-pointer",
      fn: { python: "copy_random_list", javascript: "copyRandomList" },
      starter: {
        python: `def copy_random_list(head):
    # Return head of the deep copied list
    return None
`,
        javascript: `function copyRandomList(head) {
  // Return head of the deep copied list
  return null;
}
`,
      },
      cases: [
        { args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]], expect: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
        { args: [[[1, 1], [2, 1]]], expect: [[1, 1], [2, 1]] },
        { args: [[]], expect: [] },
      ],
    },
  },

  "lru-cache": {
    id: 146,
    slug: "lru-cache",
    title: "LRU Cache",
    difficulty: "Medium",
    topics: ["Hash Tables", "Linked Lists", "Design"],
    pattern: "Hash map + doubly linked list",
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    examples: `Input
["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
Output
[null, null, null, 1, null, -1, null, -1, 3, 4]`,
    constraints: `1 ≤ capacity ≤ 3000
0 ≤ key ≤ 10⁴
0 ≤ value ≤ 10⁵
At most 2 · 10⁵ calls will be made to get and put.`,
    hints: [
      "Combine a hash map (key -> node) with a doubly-linked list with dummy head and tail for O(1) removal and insertion at MRU.",
    ],
    thesis: "Doubly linked list maintains access recency order while a hash map enables O(1) node lookup.",
    solution: {
      python: `class DLinkedNode:
    def __init__(self, key=0, val=0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}
        self.head = DLinkedNode()
        self.tail = DLinkedNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = DLinkedNode(key, value)
        self._add_to_front(node)
        self.cache[key] = node
        if len(self.cache) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]`,
      typescript: `class DNode {
  key: number;
  val: number;
  prev: DNode | null = null;
  next: DNode | null = null;
  constructor(key = 0, val = 0) {
    this.key = key;
    this.val = val;
  }
}

class LRUCache {
  private cap: number;
  private cache = new Map<number, DNode>();
  private head = new DNode();
  private tail = new DNode();

  constructor(capacity: number) {
    this.cap = capacity;
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private remove(node: DNode) {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private addToFront(node: DNode) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  get(key: number): number {
    if (!this.cache.has(key)) return -1;
    const node = this.cache.get(key)!;
    this.remove(node);
    this.addToFront(node);
    return node.val;
  }

  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.remove(this.cache.get(key)!);
    }
    const node = new DNode(key, value);
    this.addToFront(node);
    this.cache.set(key, node);
    if (this.cache.size > this.cap) {
      const lru = this.tail.prev!;
      this.remove(lru);
      this.cache.delete(lru.key);
    }
  }
}`,
    },
    sandbox: {
      id: "lru-cache",
      fn: { python: "LRUCache", javascript: "LRUCache" },
      class: { python: "LRUCache", javascript: "LRUCache" },
      check: "sequence",
      starter: {
        python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        return -1

    def put(self, key: int, value: int) -> None:
        pass
`,
        javascript: `class LRUCache {
  constructor(capacity) {}

  get(key) {
    return -1;
  }

  put(key, value) {}
}
`,
      },
      cases: [
        {
          construct: [2],
          ops: [
            ["put", [1, 1], null],
            ["put", [2, 2], null],
            ["get", [1], 1],
            ["put", [3, 3], null],
            ["get", [2], -1],
            ["put", [4, 4], null],
            ["get", [1], -1],
            ["get", [3], 3],
            ["get", [4], 4],
          ],
        },
      ],
    },
  },

  "range-sum-query-mutable": {
    id: 307,
    slug: "range-sum-query-mutable",
    title: "Range Sum Query — Mutable",
    difficulty: "Medium",
    topics: ["Arrays", "Design", "Segment Tree"],
    pattern: "Binary Indexed Tree / Fenwick tree",
    description: `Given an integer array \`nums\`, handle multiple queries of the following types:
1. **Update** the value of an element in \`nums\`.
2. Calculate the **sum** of the elements of \`nums\` between indices \`left\` and \`right\` inclusive where \`left <= right\`.

Implement the \`NumArray\` class:
- \`NumArray(int[] nums)\` Initializes the object with the integer array \`nums\`.
- \`void update(int index, int val)\` Updates the value of \`nums[index]\` to be \`val\`.
- \`int sumRange(int left, int right)\` Returns the sum of the elements of \`nums\` between indices \`left\` and \`right\` inclusive.`,
    examples: `Input
["NumArray", "sumRange", "update", "sumRange"]
[[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]
Output
[null, 9, null, 8]`,
    constraints: `1 ≤ nums.length ≤ 3 · 10⁴
-100 ≤ nums[i] ≤ 100
0 ≤ index < nums.length
-100 ≤ val ≤ 100
0 ≤ left ≤ right < nums.length
At most 3 · 10⁴ calls will be made to update and sumRange.`,
    hints: [
      "A Binary Indexed Tree (Fenwick tree) or Segment Tree handles point updates and range sum queries in O(log n) time.",
    ],
    thesis: "Binary Indexed Tree with prefix query difference sumRange(L, R) = prefix(R) - prefix(L-1).",
    solution: {
      python: `class NumArray:
    def __init__(self, nums):
        self.n = len(nums)
        self.nums = list(nums)
        self.bit = [0] * (self.n + 1)
        for i, val in enumerate(nums):
            self._add(i + 1, val)

    def _add(self, i, delta):
        while i <= self.n:
            self.bit[i] += delta
            i += i & (-i)

    def _query(self, i):
        s = 0
        while i > 0:
            s += self.bit[i]
            i -= i & (-i)
        return s

    def update(self, index: int, val: int) -> None:
        delta = val - self.nums[index]
        self.nums[index] = val
        self._add(index + 1, delta)

    def sumRange(self, left: int, right: int) -> int:
        return self._query(right + 1) - self._query(left)`,
      typescript: `class NumArray {
  private n: number;
  private nums: number[];
  private bit: number[];

  constructor(nums: number[]) {
    this.n = nums.length;
    this.nums = [...nums];
    this.bit = new Array(this.n + 1).fill(0);
    for (let i = 0; i < this.n; i++) {
      this.add(i + 1, nums[i]!);
    }
  }

  private add(i: number, delta: number) {
    while (i <= this.n) {
      this.bit[i] += delta;
      i += i & -i;
    }
  }

  private query(i: number): number {
    let s = 0;
    while (i > 0) {
      s += this.bit[i]!;
      i -= i & -i;
    }
    return s;
  }

  update(index: number, val: number): void {
    const delta = val - this.nums[index]!;
    this.nums[index] = val;
    this.add(index + 1, delta);
  }

  sumRange(left: number, right: number): number {
    return this.query(right + 1) - this.query(left);
  }
}`,
    },
    sandbox: {
      id: "range-sum-query-mutable",
      fn: { python: "NumArray", javascript: "NumArray" },
      class: { python: "NumArray", javascript: "NumArray" },
      check: "sequence",
      starter: {
        python: `class NumArray:
    def __init__(self, nums):
        pass

    def update(self, index: int, val: int) -> None:
        pass

    def sumRange(self, left: int, right: int) -> int:
        return 0
`,
        javascript: `class NumArray {
  constructor(nums) {}

  update(index, val) {}

  sumRange(left, right) {
    return 0;
  }
}
`,
      },
      cases: [
        {
          construct: [[1, 3, 5]],
          ops: [
            ["sumRange", [0, 2], 9],
            ["update", [1, 2], null],
            ["sumRange", [0, 2], 8],
          ],
        },
      ],
    },
  },

  "count-of-smaller-numbers-after-self": {
    id: 315,
    slug: "count-of-smaller-numbers-after-self",
    title: "Count of Smaller Numbers After Self",
    difficulty: "Hard",
    topics: ["Arrays", "Binary Search", "Divide and Conquer", "Segment Tree"],
    pattern: "Merge sort inversion counter",
    description: `Given an integer array \`nums\`, return an integer array \`counts\` where \`counts[i]\` is the number of smaller elements to the right of \`nums[i]\`.`,
    examples: `Input: nums = [5,2,6,1]
Output: [2,1,1,0]
Explanation:
To the right of 5 there are 2 smaller elements (2 and 1).
To the right of 2 there is 1 smaller element (1).
To the right of 6 there is 1 smaller element (1).
To the right of 1 there is 0 smaller element.

Input: nums = [-1]
Output: [0]

Input: nums = [-1,-1]
Output: [0,0]`,
    constraints: `1 ≤ nums.length ≤ 10⁵
-10⁴ ≤ nums[i] ≤ 10⁴`,
    hints: [
      "Use merge sort on indexed pairs (nums[i], i). During the merge step, when an element from the right array is placed before left[i], count how many elements jumped ahead of left[i].",
    ],
    thesis: "Modified merge sort tracking index permutations and accumulating right-hand inversions in O(n log n).",
    solution: {
      python: `def count_smaller(nums):
    n = len(nums)
    counts = [0] * n
    arr = list(enumerate(nums))

    def merge_sort(l, r):
        if l >= r:
            return
        mid = (l + r) // 2
        merge_sort(l, mid)
        merge_sort(mid + 1, r)
        merged = []
        i, j = l, mid + 1
        right_counter = 0
        while i <= mid and j <= r:
            if arr[j][1] < arr[i][1]:
                right_counter += 1
                merged.append(arr[j])
                j += 1
            else:
                counts[arr[i][0]] += right_counter
                merged.append(arr[i])
                i += 1
        while i <= mid:
            counts[arr[i][0]] += right_counter
            merged.append(arr[i])
            i += 1
        while j <= r:
            merged.append(arr[j])
            j += 1
        arr[l:r+1] = merged

    merge_sort(0, n - 1)
    return counts`,
      typescript: `function countSmaller(nums: number[]): number[] {
  const n = nums.length;
  const counts = new Array(n).fill(0);
  const arr = nums.map((val, idx) => ({ idx, val }));

  function mergeSort(l: number, r: number) {
    if (l >= r) return;
    const mid = Math.floor((l + r) / 2);
    mergeSort(l, mid);
    mergeSort(mid + 1, r);
    const merged: { idx: number; val: number }[] = [];
    let i = l;
    let j = mid + 1;
    let rightCounter = 0;
    while (i <= mid && j <= r) {
      if (arr[j]!.val < arr[i]!.val) {
        rightCounter++;
        merged.push(arr[j]!);
        j++;
      } else {
        counts[arr[i]!.idx] += rightCounter;
        merged.push(arr[i]!);
        i++;
      }
    }
    while (i <= mid) {
      counts[arr[i]!.idx] += rightCounter;
      merged.push(arr[i]!);
      i++;
    }
    while (j <= r) {
      merged.push(arr[j]!);
      j++;
    }
    for (let k = 0; k < merged.length; k++) {
      arr[l + k] = merged[k]!;
    }
  }

  mergeSort(0, n - 1);
  return counts;
}`,
    },
    sandbox: {
      id: "count-of-smaller-numbers-after-self",
      fn: { python: "count_smaller", javascript: "countSmaller" },
      starter: {
        python: `def count_smaller(nums):
    # Return count of smaller numbers to the right
    return []
`,
        javascript: `function countSmaller(nums) {
  // Return count of smaller numbers to the right
  return [];
}
`,
      },
      cases: [
        { args: [[5, 2, 6, 1]], expect: [2, 1, 1, 0] },
        { args: [[-1]], expect: [0] },
        { args: [[-1, -1]], expect: [0, 0] },
      ],
    },
  },

  "design-twitter": {
    id: 355,
    slug: "design-twitter",
    title: "Design Twitter",
    difficulty: "Medium",
    topics: ["Hash Tables", "Linked Lists", "Design", "Heaps"],
    pattern: "Multi-user timeline merge with max-heap",
    description: `Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the \`10\` most recent tweets in the user's news feed.

Implement the \`Twitter\` class:
- \`Twitter()\` Initializes your twitter object.
- \`void postTweet(int userId, int tweetId)\` Composes a new tweet with ID \`tweetId\` by the user \`userId\`. Each call to this function will be made with a unique \`tweetId\`.
- \`List<Integer> getNewsFeed(int userId)\` Retrieves the \`10\` most recent tweet IDs in the user's news feed. Each item in the news feed must be posted by users who the user followed or by the user themself. Tweets must be **ordered from most recent to least recent**.
- \`void follow(int followerId, int followeeId)\` The user with ID \`followerId\` started following the user with ID \`followeeId\`.
- \`void unfollow(int followerId, int followeeId)\` The user with ID \`followerId\` started unfollowing the user with ID \`followeeId\`.`,
    examples: `Input
["Twitter", "postTweet", "getNewsFeed", "follow", "postTweet", "getNewsFeed", "unfollow", "getNewsFeed"]
[[], [1, 5], [1], [1, 2], [2, 6], [1], [1, 2], [1]]
Output
[null, null, [5], null, null, [6, 5], null, [5]]`,
    constraints: `1 ≤ userId, followerId, followeeId ≤ 500
0 ≤ tweetId ≤ 10⁴
All the tweets have unique IDs.
At most 3 · 10⁴ calls will be made to postTweet, getNewsFeed, follow, and unfollow.`,
    hints: [
      "Use a global timestamp for every tweet. For news feed, use a max-heap to merge the most recent tweets from the user and all followed users.",
    ],
    thesis: "Max-heap k-way merge of followed users' chronologically timestamped post streams.",
    solution: {
      python: `import heapq
from collections import defaultdict

class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)
        self.following = defaultdict(set)

    def postTweet(self, userId: int, tweetId: int) -> None:
        self.time += 1
        self.tweets[userId].append((self.time, tweetId))

    def getNewsFeed(self, userId: int):
        feed_users = self.following[userId] | {userId}
        h = []
        for u in feed_users:
            for t, tid in self.tweets[u][-10:]:
                heapq.heappush(h, (t, tid))
                if len(h) > 10:
                    heapq.heappop(h)
        res = []
        while h:
            res.append(heapq.heappop(h)[1])
        return res[::-1]

    def follow(self, followerId: int, followeeId: int) -> None:
        if followerId != followeeId:
            self.following[followerId].add(followeeId)

    def unfollow(self, followerId: int, followeeId: int) -> None:
        self.following[followerId].discard(followeeId)`,
      typescript: `class Twitter {
  private time = 0;
  private tweets = new Map<number, { time: number; tweetId: number }[]>();
  private following = new Map<number, Set<number>>();

  postTweet(userId: number, tweetId: number): void {
    this.time++;
    if (!this.tweets.has(userId)) this.tweets.set(userId, []);
    this.tweets.get(userId)!.push({ time: this.time, tweetId });
  }

  getNewsFeed(userId: number): number[] {
    const users = new Set(this.following.get(userId) || []);
    users.add(userId);
    const allTweets: { time: number; tweetId: number }[] = [];
    for (const u of users) {
      const userTweets = this.tweets.get(u) || [];
      const recent = userTweets.slice(-10);
      allTweets.push(...recent);
    }
    allTweets.sort((a, b) => b.time - a.time);
    return allTweets.slice(0, 10).map((t) => t.tweetId);
  }

  follow(followerId: number, followeeId: number): void {
    if (followerId === followeeId) return;
    if (!this.following.has(followerId)) this.following.set(followerId, new Set());
    this.following.get(followerId)!.add(followeeId);
  }

  unfollow(followerId: number, followeeId: number): void {
    this.following.get(followerId)?.delete(followeeId);
  }
}`,
    },
    sandbox: {
      id: "design-twitter",
      fn: { python: "Twitter", javascript: "Twitter" },
      class: { python: "Twitter", javascript: "Twitter" },
      check: "sequence",
      starter: {
        python: `class Twitter:
    def __init__(self):
        pass

    def postTweet(self, userId: int, tweetId: int) -> None:
        pass

    def getNewsFeed(self, userId: int):
        return []

    def follow(self, followerId: int, followeeId: int) -> None:
        pass

    def unfollow(self, followerId: int, followeeId: int) -> None:
        pass
`,
        javascript: `class Twitter {
  constructor() {}

  postTweet(userId, tweetId) {}

  getNewsFeed(userId) {
    return [];
  }

  follow(followerId, followeeId) {}

  unfollow(followerId, followeeId) {}
}
`,
      },
      cases: [
        {
          construct: [],
          ops: [
            ["postTweet", [1, 5], null],
            ["getNewsFeed", [1], [5]],
            ["follow", [1, 2], null],
            ["postTweet", [2, 6], null],
            ["getNewsFeed", [1], [6, 5]],
            ["unfollow", [1, 2], null],
            ["getNewsFeed", [1], [5]],
          ],
        },
      ],
    },
  },

  "time-based-key-value-store": {
    id: 981,
    slug: "time-based-key-value-store",
    title: "Time Based Key-Value Store",
    difficulty: "Medium",
    topics: ["Hash Tables", "String", "Binary Search", "Design"],
    pattern: "Hash map of sorted timestamp arrays + binary search",
    description: `Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the \`TimeMap\` class:
- \`TimeMap()\` Initializes the object of the data structure.
- \`void set(String key, String value, int timestamp)\` Stores the key \`key\` with the value \`value\` at the given time \`timestamp\`.
- \`String get(String key, int timestamp)\` Returns a value such that \`set\` was called previously, with \`timestamp_prev <= timestamp\`. If there are multiple such values, it returns the value associated with the largest \`timestamp_prev\`. If there are no values, it returns \`""\`.`,
    examples: `Input
["TimeMap", "set", "get", "get", "set", "get", "get"]
[[], ["foo", "bar", 1], ["foo", 1], ["foo", 3], ["foo", "bar2", 4], ["foo", 4], ["foo", 5]]
Output
[null, null, "bar", "bar", null, "bar2", "bar2"]`,
    constraints: `1 ≤ key.length, value.length ≤ 100
key and value consist of lowercase English letters and digits.
1 ≤ timestamp ≤ 10⁷
All the timestamps timestamp of set are strictly increasing.
At most 2 · 10⁵ calls will be made to set and get.`,
    hints: [
      "Since timestamps for each key are strictly increasing, store (timestamp, value) pairs in an array. Use binary search (rightmost element <= timestamp) to query in O(log n).",
    ],
    thesis: "Hash table of sorted timestamp arrays queried with binary search floor locator in O(log n).",
    solution: {
      python: `class TimeMap:
    def __init__(self):
        self.store = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        if key not in self.store:
            self.store[key] = []
        self.store[key].append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        if key not in self.store:
            return ""
        arr = self.store[key]
        l, r = 0, len(arr) - 1
        res = ""
        while l <= r:
            mid = (l + r) // 2
            if arr[mid][0] <= timestamp:
                res = arr[mid][1]
                l = mid + 1
            else:
                r = mid - 1
        return res`,
      typescript: `class TimeMap {
  private store = new Map<string, { timestamp: number; value: string }[]>();

  set(key: string, value: string, timestamp: number): void {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key)!.push({ timestamp, value });
  }

  get(key: string, timestamp: number): string {
    if (!this.store.has(key)) return "";
    const arr = this.store.get(key)!;
    let l = 0;
    let r = arr.length - 1;
    let res = "";
    while (l <= r) {
      const mid = Math.floor((l + r) / 2);
      if (arr[mid]!.timestamp <= timestamp) {
        res = arr[mid]!.value;
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
    return res;
  }
}`,
    },
    sandbox: {
      id: "time-based-key-value-store",
      fn: { python: "TimeMap", javascript: "TimeMap" },
      class: { python: "TimeMap", javascript: "TimeMap" },
      check: "sequence",
      starter: {
        python: `class TimeMap:
    def __init__(self):
        pass

    def set(self, key: str, value: str, timestamp: int) -> None:
        pass

    def get(self, key: str, timestamp: int) -> str:
        return ""
`,
        javascript: `class TimeMap {
  constructor() {}

  set(key, value, timestamp) {}

  get(key, timestamp) {
    return "";
  }
}
`,
      },
      cases: [
        {
          construct: [],
          ops: [
            ["set", ["foo", "bar", 1], null],
            ["get", ["foo", 1], "bar"],
            ["get", ["foo", 3], "bar"],
            ["set", ["foo", "bar2", 4], null],
            ["get", ["foo", 4], "bar2"],
            ["get", ["foo", 5], "bar2"],
          ],
        },
      ],
    },
  },
};

export function getCatalogExtraProblem(slug: string): CatalogExtraProblem | undefined {
  return CATALOG_EXTRA_PROBLEMS[slug];
}

export function getAllCatalogExtraSlugs(): string[] {
  return Object.keys(CATALOG_EXTRA_PROBLEMS);
}
