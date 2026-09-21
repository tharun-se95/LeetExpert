# Matrix systems: narration scripts

Eight narrated videos, one per system in "The Grid Underneath". Each video is a
hook over the title card, body beats that each cover a contiguous range of the
scene's frames, and a closing line over the three fact cards.

Format, read by `build-vo.py` and `build-narration.py`:

    ## <video> · Line <n> — <title> [intro | frames a-b | outro | outro cards s1,s2,s3]
        spoken text, indented four spaces

`outro cards 2,3,4` names the spoken sentence (1-based) that states each of the three
fact cards; each card rises as its sentence begins. Plain `outro` means sentences 1,2,3.

`frames a-b` are inclusive frame indices of that video's scene. Beats must be
contiguous and end at the scene's last frame; the builder asserts it. Every
number spoken is one the scene computes or the lesson states. Where a claim is
a typical figure for real hardware rather than something the scene proves, the
line says so.

# matrix-framebuffer

## matrix-framebuffer · Line 1 — hook [intro]
    Your screen is a grid of pixels. Memory is not. Memory is one long line of bytes, and the way your loop walks that line decides whether an image filter takes a moment, or several times longer. Let's see why.

## matrix-framebuffer · Line 2 — address arithmetic [frames 0-3]
    A 1080p frame is eight million, two hundred ninety-four thousand, four hundred bytes, stored row after row. So pixel x, y is never looked up. It is computed: skip y whole rows, then walk x pixels in. With four bytes a pixel and rows seven thousand six hundred eighty bytes wide, the pixel at one hundred, fifty sits at byte three hundred eighty-four thousand, four hundred. On the left, a loop over rows and then columns. On the right, columns and then rows. Same cells, different order.

## matrix-framebuffer · Line 3 — cache lines [frames 4-11]
    The processor never fetches a single byte. It loads a whole cache line, drawn here as four cells. The row loop reads zero, and the line arrives with its three neighbours, so the next three reads cost nothing. The column loop reads zero, then eight, then sixteen. Every one of those lives in a different line, and this toy cache holds only two, so old lines are thrown out before the loop comes back for them.

## matrix-framebuffer · Line 4 — counting misses [frames 12-27]
    Keep an eye on the counters. The row loop pays one miss for every four cells. The column loop pays a miss on nearly every read, because by the time it returns to the top of the next column, the line it needs is already gone.

## matrix-framebuffer · Line 5 — result [frames 28-31]
    Eight misses against thirty-two. Same grid, same arithmetic, same answer, and four times the trips to memory. On typical hardware a cache line is sixty-four bytes, which is sixteen four-byte pixels, so the real gap is wider than this toy shows.

## matrix-framebuffer · Line 6 — facts [outro cards 2,3,4]
    Remember three numbers. Eight million, two hundred ninety-four thousand, four hundred bytes in one frame. Three hundred eighty-four thousand, four hundred, the position of one pixel, found by arithmetic alone. And sixteen pixels per cache line, which is why you walk along rows, not down columns.

# matrix-photo-filters

## matrix-photo-filters · Line 1 — hook [intro]
    A blur looks like magic. It is not. Every output pixel is just the average of the pixels around it. The interesting part is what happens at the edge of the picture, where some of those neighbours do not exist.

## matrix-photo-filters · Line 2 — the corner [frames 0-1]
    Here is a tiny image: a bright plus sign on a dark background, with brightness from zero to nine. To blur it, visit every pixel and average its three by three window. Start at the top left corner. Its window hangs off the image, so only three of its eight neighbours exist, and the average uses four values.

## matrix-photo-filters · Line 3 — bounds checks [frames 2-7]
    Along the top edge, five neighbours exist. This is the trick that keeps the code safe: a list of eight direction vectors, up and left, up, up and right, and so on, and one bounds check per neighbour. If the neighbour's row or column falls outside the grid, skip it.

## matrix-photo-filters · Line 4 — the interior [frames 8-11]
    Once the window sits fully inside the image, all eight neighbours count. Nine values, added up and divided by nine. Watch the plus sign soften: a sharp nine next to a zero becomes a five, or a seven.

## matrix-photo-filters · Line 5 — every pixel once [frames 12-31]
    The window keeps sliding, row by row, and every pixel is visited exactly once. Corners use three neighbours, edges five, the interior eight. When it finishes, the hard edges have softened, and the border pixels were averaged from fewer real values, not from invented ones. One warning: in Python, a negative index quietly wraps to the far side of the grid, so always check the bounds before you read.

## matrix-photo-filters · Line 6 — facts [outro]
    One twelve megapixel photo means about ninety-six million neighbour reads. Eight neighbours for an interior pixel, five on an edge, three in a corner. And just eight direction vectors carry the whole technique.

# matrix-alert-storms

## matrix-alert-storms · Line 1 — hook [intro]
    It is three in the morning and your phone will not stop. Twenty-two alerts, one for every overheating rack. But look at the floor map: those racks are touching. This is not twenty-two problems. So how many is it?

## matrix-alert-storms · Line 2 — first incident [frames 0-4]
    Every warm cell is a rack over its temperature limit. Scan the map row by row. The first hot cell you meet starts an incident. Then flood outward: any hot cell that touches the incident, above, below, left or right, joins it. Four racks in the corner, one incident.

## matrix-alert-storms · Line 3 — claimed cells [frames 5-12]
    Keep scanning. The next hot cell that nobody has claimed starts incident two, and the flood repeats. Then a third. A claimed cell is skipped, so nothing is counted twice. Mark a cell as claimed the moment you queue it, not when you pop it, or the same rack can be queued twice.

## matrix-alert-storms · Line 4 — the rest [frames 13-22]
    Three more regions appear. Notice that no cell is ever examined more than once, so the work grows with the size of the map, not with the number of incidents.

## matrix-alert-storms · Line 5 — result [frames 23-23]
    Twenty-two hot racks collapse into six regions. Six things a person can act on instead of twenty-two pages.

## matrix-alert-storms · Line 6 — facts [outro]
    Twenty-two hot racks. Six connected regions. One visit per cell. The same flood fill powers a paint bucket, counts cells on a microscope slide, and finds lakes on a satellite image.

# matrix-camera-rotation

## matrix-camera-rotation · Line 1 — hook [intro]
    A phone takes a photo sideways, and something has to turn it upright. The obvious way allocates a second image. A twelve megapixel photo is forty-eight million bytes, so a copy is not free. There is a way to turn it in place, in two moves.

## matrix-camera-rotation · Line 2 — transpose [frames 0-6]
    Take a four by four picture. Each tile keeps its number, and the shade runs from dark at one to bright at sixteen, so you can follow every tile. Move one: transpose. Swap each tile with its mirror image across the main diagonal. Six swaps, and the rows have become columns.

## matrix-camera-rotation · Line 3 — reverse each row [frames 7-14]
    Move two: reverse every row. Swap the first tile with the last, the second with the third. Eight more swaps. Why does that make a turn? Follow tile two, top row, second column. Transposing sends it to the second row, first column. Flipping that row sends it to the last column. So tile two moved from the top row to the last column, which is exactly where a clockwise quarter turn puts it.

## matrix-camera-rotation · Line 4 — result [frames 15-15]
    Tile one, which started top left, is now top right. Tile thirteen moved from bottom left to top left. Fourteen swaps in total, and one temporary value of extra memory.

## matrix-camera-rotation · Line 5 — facts [outro]
    Forty-eight million bytes for a copy. Fourteen swaps here, six transposing and eight flipping. One temporary value. And start the transpose loop at i plus one, or every pair swaps twice and the picture never changes.

# matrix-cnc-toolpaths

## matrix-cnc-toolpaths · Line 1 — hook [intro]
    A milling tool clearing a pocket has to cover every point of an area, and spiralling in from the edge wastes the least motion. Tracking a spiral looks hard until you notice one thing: the part you have not visited is always a rectangle.

## matrix-cnc-toolpaths · Line 2 — the first ring [frames 0-18]
    Four numbers describe that rectangle: top, bottom, left and right. Start with the whole grid. Walk the top row left to right, then the right column downward, then the bottom row right to left, then the left column back up. That is one ring, and the dashed rectangle marks what is still untouched.

## matrix-cnc-toolpaths · Line 3 — shrinking [frames 19-28]
    Now shrink the rectangle by one on every side: top plus one, bottom minus one, left plus one, right minus one. Then walk its outer ring the same way. The tool spirals inward, and no cell is ever visited twice.

## matrix-cnc-toolpaths · Line 4 — the last ring [frames 29-30]
    The edges keep closing until they cross. Here the last ring is a single row, two cells wide. That is exactly why the bottom row and the left column are guarded by a check: with one row left, walking back would cover cells you just emitted.

## matrix-cnc-toolpaths · Line 5 — facts [outro]
    Thirty cells, each visited exactly once. Four integers of state, however large the grid. One pass, order m times n, with constant extra space.

# matrix-data-masking

## matrix-data-masking · Line 1 — hook [intro]
    One corrupt reading in a telemetry table can invalidate its whole row and its whole column. The obvious fix keeps two lists of what to erase. There is a neater way: use the table's own border as scratch paper.

## matrix-data-masking · Line 2 — find first, act second [frames 0-1]
    Five servers, six metrics, and three cells hold zero. If we wipe a row the moment we see a zero, the new zeros look exactly like real ones and we wipe rows we should not. So we must find every zero first, and act second. One zero already sits in row zero, so we remember that in a single flag.

## matrix-data-masking · Line 3 — flags on the border [frames 2-21]
    Now scan the interior. When a zero appears at row i, column j, write a zero at the left end of row i and at the top of column j. Those border cells are our notes. The gold cells are flags, not data, and no second table was needed to hold them.

## matrix-data-masking · Line 4 — apply the flags [frames 22-25]
    Second pass, interior only. If a cell's row flag or column flag is zero, zero the cell. The border has to wait: zero it now and the flags are erased before they are read.

## matrix-data-masking · Line 5 — border last [frames 26-26]
    Last, because row zero held a zero at the start, zero that whole row. Two flags in total, and no extra tables.

## matrix-data-masking · Line 6 — facts [outro]
    Two flag variables replace two arrays of m plus n booleans. On a ten thousand by ten thousand grid that avoids twenty thousand flags. Two passes, still order m times n. And zero the interior before the border, or the flags are gone before you read them.

# matrix-sorted-pages

## matrix-sorted-pages · Line 1 — hook [intro]
    A database does not scan a table to find a key. It keeps keys sorted in pages and jumps. Here is a trick: if every page is sorted, and each page starts above where the last one ended, then the whole set of pages is a single sorted array folded into rows.

## matrix-sorted-pages · Line 2 — one sorted array [frames 0-0]
    Five pages of six keys. Read them left to right, top to bottom, and it is thirty sorted keys. So binary search works, as long as we can turn a flat position into a page and a slot.

## matrix-sorted-pages · Line 3 — the translation [frames 1-2]
    The translation is one line: page equals position divided by six, slot equals the remainder. We are looking for thirty-seven. The middle position is fourteen, which is page two, slot two. Its key, sixty-one, is above thirty-seven, so the upper half is gone. The new middle is six: page one, slot zero, key twenty-seven, below thirty-seven, so the lower half is gone.

## matrix-sorted-pages · Line 4 — converging [frames 3-4]
    Middle ten: page one, slot four, key forty-four, too high again. Middle eight: page one, slot two, key thirty-seven. Found, in four probes out of thirty keys. Real engines usually search the page boundaries first and then inside the page. Flattening is the same arithmetic in a single search.

## matrix-sorted-pages · Line 5 — facts [outro]
    Twenty probes find one key among a million, since log base two of a million is about nineteen point nine. Four probes here. And one line of arithmetic, divide and remainder, connects the flat index to the page.

# matrix-chip-routing

## matrix-chip-routing · Line 1 — hook [intro]
    Finding a path through a grid means committing to a cell, exploring from it, and undoing the commitment when it fails. Chip and circuit board routers, puzzle solvers and maze solvers all lean on this. Here, we search for the word ROUTE.

## matrix-chip-routing · Line 2 — commit [frames 0-4]
    Move up, right, down, left, and never reuse a cell. Only one R exists, so start there: R, then O, then U along the top, then T. Every matched cell is marked as used, so this attempt can never walk over itself.

## matrix-chip-routing · Line 3 — dead ends [frames 5-8]
    The T at the top right needs an E next, and its only unused neighbour is an X. Dead end. So un-mark the T, step back to the U, and try its remaining directions. Nothing there spells T either. Another dead end, and the U is un-marked too.

## matrix-chip-routing · Line 4 — the real route [frames 9-11]
    Back at the O, the next direction is down: another U, then a T, then an E. ROUTE, found. Un-marking is the whole point. Without it, the failed attempt would leave its cells blocked, and a route that exists would be reported as missing.

## matrix-chip-routing · Line 5 — facts [outro]
    Two backtracks before the route appeared. Five letters, so the search never goes deeper than five cells. One board reused as its own visited marker. And in the worst case, m times n times four to the power of the word length.
