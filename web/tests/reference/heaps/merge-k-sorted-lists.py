import heapq

def merge_k_lists(lists):
    pq = []
    for i, head in enumerate(lists):
        if head is not None:
            heapq.heappush(pq, (head.val, i, head))
    dummy = ListNode(0)
    tail = dummy
    while pq:
        _, i, node = heapq.heappop(pq)
        tail.next = node
        tail = node
        if node.next is not None:
            heapq.heappush(pq, (node.next.val, i, node.next))
    tail.next = None
    return dummy.next
