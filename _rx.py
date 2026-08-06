"""Midlertidig ekstraktor for router-splitten (AST-basert, robust mot strenger).
Slettes når splitten er ferdig."""
import ast


def _spans(src):
    tree = ast.parse(src)
    m = {}
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            start = node.lineno
            if node.decorator_list:
                start = min(d.lineno for d in node.decorator_list)
            m[node.name] = (start, node.end_lineno)  # 1-indeksert inklusiv
    return m


def extract(path, names, extra_ranges=None):
    """Flytt topp-nivå def/class med gitte navn ut. Returner blokk-tekstene i
    oppgitt rekkefølge og skriv path uten dem. extra_ranges: liste av
    (start_substr, end_substr) sammenhengende linjeområder som også fjernes."""
    src = open(path, encoding="utf-8").read()
    lines = src.split("\n")
    sp = _spans(src)
    ranges, blocks = [], []
    for name in names:
        if name not in sp:
            raise ValueError("navn ikke funnet: " + name)
        s, e = sp[name]
        blocks.append("\n".join(lines[s - 1:e]))
        ranges.append((s - 1, e))
    for a, b in (extra_ranges or []):
        ai = next(i for i, l in enumerate(lines) if a in l)
        bi = next(i for i, l in enumerate(lines) if b in l)
        ranges.append((ai, bi + 1))
    for s, e in sorted(ranges, key=lambda r: -r[0]):
        del lines[s:e]
    open(path, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
    return blocks


def write_router(path, header, blocks):
    body = "\n\n".join(b.replace("@app.", "@router.") for b in blocks)
    open(path, "w", encoding="utf-8", newline="\n").write(header + body + "\n")
