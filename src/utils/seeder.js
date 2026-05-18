// Utility to seed initial problems database for demo and visual validation
export const seedProblems = [
  {
    id: "seed-1",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum",
    difficulty: "easy",
    category: "Arrays & Hashing",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0], // 14 days ago
    language: "python",
    code: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i\n        return`,
    intuition: "Use a hash map to track indices of elements we have already visited. Since we need to find elements that sum up to a target, for each number we check if its complement (target - num) is in our hash map.",
    notes: "### Key Takeaways\n- Time complexity is optimal at O(N) since we do a single pass.\n- Space complexity is O(N) to store elements in the hash table.\n- Make sure to handle indices correctly and don't reuse the same element.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    confidence: 5,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 16).toISOString().split('T')[0] // Safe, 16 days in future
  },
  {
    id: "seed-2",
    title: "Valid Parentheses",
    url: "https://leetcode.com/problems/valid-parentheses",
    difficulty: "easy",
    category: "Stack",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0], // 10 days ago
    language: "javascript",
    code: `function isValid(s) {\n    const stack = [];\n    const closeToOpen = { ")": "(", "}": "{", "]": "[" };\n    \n    for (let char of s) {\n        if (char in closeToOpen) {\n            if (stack.length > 0 && stack[stack.length - 1] === closeToOpen[char]) {\n                stack.pop();\n            } else {\n                return false;\n            }\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}`,
    intuition: "Utilize a stack to handle brackets. Push opening brackets onto the stack. When encountering a closing bracket, check if it matches the bracket at the top of the stack.",
    notes: "### Stack Properties\n- LIFO (Last In First Out) is perfect here because nested brackets must be closed in reverse order of opening.\n- Time Complexity: O(N) as we traverse the string once.\n- Space Complexity: O(N) for stack storage.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(N)",
    confidence: 4,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0] // due soon
  },
  {
    id: "seed-3",
    title: "Reverse Linked List",
    url: "https://leetcode.com/problems/reverse-linked-list",
    difficulty: "easy",
    category: "Linked List",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // 5 days ago
    language: "python",
    code: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`,
    intuition: "Iterate through the linked list. Keep track of the previous node. For each node, save its next connection, redirect its next pointer to the previous node, then move previous and current pointers one step forward.",
    notes: "### Multi-Pointer Logic\n- Must maintain three pointers (`prev`, `curr`, `nxt`) to avoid losing the rest of the list when modifying references.\n- Space: O(1) iterative, O(N) recursive.\n- Recommended: Try recursive approach for complete mastery.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    confidence: 3,
    nextReviewDate: new Date().toISOString().split('T')[0] // DUE TODAY
  },
  {
    id: "seed-4",
    title: "3Sum",
    url: "https://leetcode.com/problems/3sum",
    difficulty: "medium",
    category: "Two Pointers",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0], // 3 days ago
    language: "python",
    code: `class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        res = []\n        nums.sort()\n        \n        for i, a in enumerate(nums):\n            if i > 0 and a == nums[i - 1]:\n                continue\n            \n            l, r = i + 1, len(nums) - 1\n            while l < r:\n                threeSum = a + nums[l] + nums[r]\n                if threeSum > 0:\n                    r -= 1\n                elif threeSum < 0:\n                    l += 1\n                else:\n                    res.append([a, nums[l], nums[r]])\n                    l += 1\n                    while nums[l] == nums[l - 1] and l < r:\n                        l += 1\n        return res`,
    intuition: "Sort the input array. Loop through elements, checking to make sure we don't repeat the first number. For each first number, use Two Pointers from its right side to the end of the array to find pairs that sum to -first_number.",
    notes: "### Key Points\n- Sorting simplifies duplicate removal: `nums.sort()` takes O(N log N).\n- Double pointer nested loop is O(N^2).\n- Skipping duplicate matches is critical both for the first pointer `i` and left pointer `l` after finding a valid triplet.",
    timeComplexity: "O(N^2)",
    spaceComplexity: "O(1) to O(N) depending on sort implementation",
    confidence: 2,
    nextReviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0] // OVERDUE
  },
  {
    id: "seed-5",
    title: "LRU Cache",
    url: "https://leetcode.com/problems/lru-cache",
    difficulty: "hard",
    category: "Design",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0], // Yesterday
    language: "javascript",
    code: `class Node {\n    constructor(key, val) {\n        this.key = key;\n        this.val = val;\n        this.prev = null;\n        this.next = null;\n    }\n}\n\nclass LRUCache {\n    constructor(capacity) {\n        this.cap = capacity;\n        this.cache = new Map(); // map key to node\n        \n        this.left = new Node(0, 0);\n        this.right = new Node(0, 0);\n        this.left.next = this.right;\n        this.right.prev = this.left;\n    }\n    \n    remove(node) {\n        const prev = node.prev;\n        const nxt = node.next;\n        prev.next = nxt;\n        nxt.prev = prev;\n    }\n    \n    insert(node) {\n        const prev = this.right.prev;\n        const nxt = this.right;\n        prev.next = node;\n        nxt.prev = node;\n        node.prev = prev;\n        node.next = nxt;\n    }\n    \n    get(key) {\n        if (this.cache.has(key)) {\n            this.remove(this.cache.get(key));\n            this.insert(this.cache.get(key));\n            return this.cache.get(key).val;\n        }\n        return -1;\n    }\n    \n    put(key, value) {\n        if (this.cache.has(key)) {\n            this.remove(this.cache.get(key));\n        }\n        this.cache.set(key, new Node(key, value));\n        this.insert(this.cache.get(key));\n        \n        if (this.cache.size > this.cap) {\n            const lru = this.left.next;\n            this.remove(lru);\n            this.cache.delete(lru.key);\n        }\n    }\n}`,
    intuition: "To achieve O(1) get and put, combine a Hash Map with a Doubly Linked List. The Map stores keys pointing to list nodes. The Linked List tracks recency—new elements are inserted at the tail, and the least recently used element at the head can be evicted in O(1).",
    notes: "### Advanced System Design\n- LRU = Least Recently Used.\n- Doubly Linked List allows O(1) removal and insertion once node is located.\n- Dummy head (`left`) and dummy tail (`right`) simplify boundary node updates significantly.",
    timeComplexity: "O(1) for both get and put",
    spaceComplexity: "O(Capacity)",
    confidence: 1,
    nextReviewDate: new Date().toISOString().split('T')[0] // DUE TODAY (Confidence 1 requires frequent checks)
  },
  {
    id: "seed-6",
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters",
    difficulty: "medium",
    category: "Sliding Window",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0], // 7 days ago
    language: "python",
    code: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        charSet = set()\n        l = 0\n        res = 0\n        \n        for r in range(len(s)):\n            while s[r] in charSet:\n                charSet.remove(s[l])\n                l += 1\n            charSet.add(s[r])\n            res = max(res, r - l + 1)\n        return res`,
    intuition: "Maintain a sliding window defined by two pointers `l` and `r`. As `r` moves right, add elements to a set. If we hit a duplicate, shrink the window from the left by removing elements from the set and moving `l` forward until the duplicate is gone.",
    notes: "### Sliding Window Mastery\n- Efficiently maintains a valid substring without repeating elements.\n- Time: O(N) because each character is visited at most twice (once by `r` and once by `l`).\n- Space: O(min(M, N)) where M is alphabet size.",
    timeComplexity: "O(N)",
    spaceComplexity: "O(min(A, N))",
    confidence: 4,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0]
  },
  {
    id: "seed-7",
    title: "Merge Intervals",
    url: "https://leetcode.com/problems/merge-intervals",
    difficulty: "medium",
    category: "Intervals",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString().split('T')[0], // 9 days ago
    language: "python",
    code: `class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda i: i[0])\n        output = [intervals[0]]\n        \n        for start, end in intervals[1:]:\n            lastEnd = output[-1][1]\n            \n            if start <= lastEnd:\n                output[-1][1] = max(lastEnd, end)\n            else:\n                output.append([start, end])\n        return output`,
    intuition: "Sort the intervals based on their start values. Then, iterate through sorted intervals, checking if the current interval starts before or at the end of the previously merged interval. If it does, they overlap, so merge them by updating the end.",
    notes: "### Sorting & Linear Scan\n- Sorting is key. Once sorted, we only need to compare the current interval with the last interval in our output list.\n- Time Complexity: O(N log N) dominated by sorting.\n- Space Complexity: O(N) to store sorted keys/output.",
    timeComplexity: "O(N log N)",
    spaceComplexity: "O(N)",
    confidence: 5,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().split('T')[0]
  },
  {
    id: "seed-8",
    title: "Binary Search",
    url: "https://leetcode.com/problems/binary-search",
    difficulty: "easy",
    category: "Binary Search",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0], // 20 days ago
    language: "javascript",
    code: `function search(nums, target) {\n    let l = 0;\n    let r = nums.length - 1;\n    \n    while (l <= r) {\n        let m = Math.floor((l + r) / 2);\n        if (nums[m] > target) {\n            r = m - 1;\n        } else if (nums[m] < target) {\n            l = m + 1;\n        } else {\n            return m;\n        }\n    }\n    return -1;\n}`,
    intuition: "Divide and conquer. Compare target with middle element. If it matches, return index. If middle element is larger, target must be in the left half, so shrink right boundary. Otherwise, shrink left boundary.",
    notes: "### Basic Binary Search Template\n- Classic template used as foundation for harder binary search questions.\n- Make sure to handle mid calculation safely to avoid overflow in other languages: `mid = l + Math.floor((r - l) / 2)`.\n- Time: O(log N), Space: O(1).",
    timeComplexity: "O(log N)",
    spaceComplexity: "O(1)",
    confidence: 5,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
  },
  {
    id: "seed-9",
    title: "Container With Most Water",
    url: "https://leetcode.com/problems/container-with-most-water",
    difficulty: "medium",
    category: "Two Pointers",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0], // 12 days ago
    language: "python",
    code: `class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        l, r = 0, len(height) - 1\n        res = 0\n        \n        while l < r:\n            area = (r - l) * min(height[l], height[r])\n            res = max(res, area)\n            \n            if height[l] < height[r]:\n                l += 1\n            else:\n                r -= 1\n        return res`,
    intuition: "Use two pointers starting at both ends of the array. The width starts at maximum. Calculate water volume, then move the pointer that points to the shorter line inward, since keeping the shorter line can never yield a larger area.",
    notes: "### Two Pointer Strategy\n- Starting at maximum width allows us to prioritize finding taller heights by shifting pointers inward.\n- Moving the taller pointer would guarantee a smaller area, so we always shift the shorter pointer.\n- Time: O(N), Space: O(1).",
    timeComplexity: "O(N)",
    spaceComplexity: "O(1)",
    confidence: 3,
    nextReviewDate: new Date().toISOString().split('T')[0] // DUE TODAY
  },
  {
    id: "seed-10",
    title: "Longest Palindromic Substring",
    url: "https://leetcode.com/problems/longest-palindromic-substring",
    difficulty: "medium",
    category: "Dynamic Programming",
    solvedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString().split('T')[0], // 18 days ago
    language: "python",
    code: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        res = \"\"\n        resLen = 0\n        \n        for i in range(len(s)):\n            # odd length\n            l, r = i, i\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > resLen:\n                    res = s[l:r+1]\n                    resLen = r - l + 1\n                l -= 1\n                r += 1\n                \n            # even length\n            l, r = i, i + 1\n            while l >= 0 and r < len(s) and s[l] == s[r]:\n                if (r - l + 1) > resLen:\n                    res = s[l:r+1]\n                    resLen = r - l + 1\n                l -= 1\n                r += 1\n        return res`,
    intuition: "Expand around centers. For each index, treat it as the center of a palindrome (both odd center like 'aba' and even center like 'abba') and expand outward as long as characters match.",
    notes: "### Center Expansion Pattern\n- Intuitive way to find palindromic substrings.\n- O(N^2) time, O(1) space (much better than DP O(N^2) space).\n- Can be optimized to O(N) using Manacher's Algorithm, but usually not required in interviews.",
    timeComplexity: "O(N^2)",
    spaceComplexity: "O(1)",
    confidence: 4,
    nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0]
  }
];
