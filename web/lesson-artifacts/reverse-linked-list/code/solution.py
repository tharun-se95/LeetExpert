def reverse_list(head):
    prev, curr = None, head        # reversed part: empty; untouched part: everything
    while curr is not None:
        nxt = curr.next            # 1) save the lifeline
        curr.next = prev           # 2) the flip
        prev = curr                # 3) march
        curr = nxt
    return prev                    # curr is None; prev heads it all
