"""Driver's Collection: turn one card's print files into the 3 web files for the 3D card.

usage: python3 make_card_assets.py <slug> <front.png> <silver_plate.png> <gold_plate.png> [outdir]
  front.png        : finished card image (trim size, e.g. 1890x2640)
  silver_plate.png : 銀ホロ版 (black = silver foil), exported with trim marks
  gold_plate.png   : 金フレーム版 (black = pure-gold foil), exported with trim marks
The plates are centre-cropped to the front image size (trim marks / labels fall outside).
Outputs <outdir>/<slug>/front.webp, thumb.webp, silver.webp, gold.webp and prints a sanity report.
"""
import sys, os, io
import numpy as np
from PIL import Image, ImageChops

FRONT_W, MASK_W, LEVELS = 760, 560, 16


def centre_crop_box(plate_size, front_size):
    (pw, ph), (fw, fh) = plate_size, front_size
    dx, dy = pw - fw, ph - fh
    if dx < 0 or dy < 0:
        raise SystemExit(f"plate {plate_size} is smaller than front {front_size}")
    if dx % 2 or dy % 2:
        print(f"  ! margin is odd ({dx}x{dy}) - check the export settings")
    return (dx // 2, dy // 2, dx // 2 + fw, dy // 2 + fh)


def plate_alpha(path, box, border=0):
    g = Image.open(path).convert("L").crop(box)
    a = np.array(ImageChops.invert(g)).astype(np.float32)
    a = np.clip((a - 30) / (225 - 30), 0, 1)          # drop paper noise, solidify ink
    if border:
        a[:border], a[-border:], a[:, :border], a[:, -border:] = 0, 0, 0, 0
    return a


def mask_webp(a, w):
    im = Image.fromarray((a * 255).astype(np.uint8))
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    q = np.round(np.array(im) / 255 * (LEVELS - 1)) / (LEVELS - 1) * 255
    im = Image.fromarray(q.astype(np.uint8))
    white = Image.new("L", im.size, 255)
    buf = io.BytesIO()
    Image.merge("RGBA", (white, white, white, im)).save(buf, "WEBP", lossless=True, quality=100, method=6)
    return buf.getvalue()


def main():
    if len(sys.argv) < 5:
        raise SystemExit(__doc__)
    slug, front_p, silver_p, gold_p = sys.argv[1:5]
    out = os.path.join(sys.argv[5] if len(sys.argv) > 5 else "cards", slug)
    os.makedirs(out, exist_ok=True)

    front = Image.open(front_p).convert("RGB")
    box = centre_crop_box(Image.open(silver_p).size, front.size)
    if Image.open(gold_p).size != Image.open(silver_p).size:
        raise SystemExit("silver and gold plates are different sizes")

    s = plate_alpha(silver_p, box)
    g = plate_alpha(gold_p, box, border=4)

    fw = front.resize((FRONT_W, round(front.height * FRONT_W / front.width)), Image.LANCZOS)
    fw.save(os.path.join(out, "front.webp"), "WEBP", quality=82, method=6)
    tw = front.resize((240, round(front.height * 240 / front.width)), Image.LANCZOS)
    tw.save(os.path.join(out, "thumb.webp"), "WEBP", quality=80, method=6)
    open(os.path.join(out, "silver.webp"), "wb").write(mask_webp(s, MASK_W))
    open(os.path.join(out, "gold.webp"), "wb").write(mask_webp(g, MASK_W))

    overlap = ((s > .5) & (g > .5)).mean() * 100
    print(f"{slug}: crop {box}  silver {s.mean()*100:.1f}%  gold {g.mean()*100:.1f}%  overlap {overlap:.2f}%")
    if overlap > 1:
        print("  ! silver and gold overlap a lot - are the plates swapped or misaligned?")
    for f in ("front.webp", "thumb.webp", "silver.webp", "gold.webp"):
        print(f"  {f}: {os.path.getsize(os.path.join(out, f)) // 1024} KB")


if __name__ == "__main__":
    main()
