"""Genera app/data/fichas.js y las fotos optimizadas a partir de la Fase 3.

  python3 tools/build_data.py [--fotos]

Entradas: tools/Fase3_Fichas_datos_NYC.json, tools/meta.py, tools/fotos_src/ (jpg + meta.json)
"""
import json, pathlib, sys
from meta import META

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
APP = ROOT / "app"


def norm_hours(h):
    if h is None:
        return {str(d): None for d in range(1, 8)}
    if isinstance(h, str):
        return {str(d): h for d in range(1, 8)}
    return {str(d): h.get(d) for d in range(1, 8)}


def main(fotos=False):
    src = json.loads((TOOLS / "Fase3_Fichas_datos_NYC.json").read_text(encoding="utf-8"))
    credits = json.loads((TOOLS / "fotos_src" / "meta.json").read_text(encoding="utf-8"))
    out = []
    used = set()
    for f in src["fichas"]:
        m = META[f["num"]]
        plan = {"dur": m["dur"]}
        if "fun" in m:
            plan["fun"] = {str(k): v for k, v in m["fun"].items()}
        else:
            plan["h"] = norm_hours(m.get("h"))
        for k in ("last", "meal", "luz", "franja", "viaje"):
            if k in m:
                plan[k] = m[k]
        if "notas" in m:
            plan["notas"] = {str(k): v for k, v in m["notas"].items()}
        f["plan"] = plan
        fot = f.get("fotos") or {}
        keys = [fot.get("hero")] + [g[0] for g in fot.get("gal", [])]
        f["creditos"] = {k: {"autor": credits[k]["autor"], "licencia": credits[k]["licencia"],
                             "pagina": credits[k].get("pagina", "")}
                         for k in keys if k and k in credits}
        used.update(k for k in keys if k)
        f.pop("fuentes", None)
        out.append(f)
    js = "/* Generado por tools/build_data.py — no editar a mano */\nwindow.FICHAS = " + \
        json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (APP / "data" / "fichas.js").write_text(js, encoding="utf-8")
    print("fichas:", len(out), "·", len(js) // 1024, "KB")

    if fotos:
        from PIL import Image
        dst = APP / "img"; dst.mkdir(exist_ok=True)
        (dst / "t").mkdir(exist_ok=True)
        tot = 0
        missing = []
        for k in sorted(used):
            p = TOOLS / "fotos_src" / f"{k}.jpg"
            if not p.exists():
                missing.append(k); continue
            im = Image.open(p).convert("RGB")
            w = 800 if k.endswith("hero") else 640
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            o = dst / f"{k}.webp"; im.save(o, "WEBP", quality=52, method=6); tot += o.stat().st_size
            if k.endswith("hero"):
                t = im.copy(); t.thumbnail((320, 240), Image.LANCZOS)
                o = dst / "t" / f"{k}.webp"; t.save(o, "WEBP", quality=60, method=6); tot += o.stat().st_size
        print("fotos:", len(used) - len(missing), "·", tot // 1024, "KB", "· faltan:", missing)


if __name__ == "__main__":
    main("--fotos" in sys.argv)
