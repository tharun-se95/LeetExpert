def find_min_arrow_shots(points):
    points.sort(key=lambda b: b[1])
    arrows = 1
    arrow_x = points[0][1]
    for start, end in points[1:]:
        if start > arrow_x:
            arrows += 1
            arrow_x = end
    return arrows
