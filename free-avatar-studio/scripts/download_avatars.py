from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

from PIL import Image, ImageDraw, ImageFont


BASE_DIR = Path(__file__).resolve().parents[1]
AVATAR_DIR = BASE_DIR / "static" / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

AVATARS = [
    ("ahmed.jpg", "Ahmed", "https://randomuser.me/api/portraits/men/32.jpg"),
    ("fatima.jpg", "Fatima", "https://randomuser.me/api/portraits/women/44.jpg"),
    ("mohammed.jpg", "Mohammed", "https://randomuser.me/api/portraits/men/75.jpg"),
    ("noura.jpg", "Noura", "https://randomuser.me/api/portraits/women/68.jpg"),
    ("emma.jpg", "Emma", "https://randomuser.me/api/portraits/women/65.jpg"),
    ("liam.jpg", "Liam", "https://randomuser.me/api/portraits/men/46.jpg"),
    ("sofia.jpg", "Sofia", "https://randomuser.me/api/portraits/women/12.jpg"),
    ("noah.jpg", "Noah", "https://randomuser.me/api/portraits/men/22.jpg"),
]


def load_font(size):
    candidate = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    if Path(candidate).exists():
        return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def make_placeholder(path, name):
    image = Image.new("RGB", (512, 512), "#2d1247")
    draw = ImageDraw.Draw(image)
    draw.ellipse((86, 58, 426, 398), fill="#7040a8")
    draw.ellipse((176, 128, 336, 288), fill="#ecc45c")
    draw.rounded_rectangle((126, 308, 386, 472), radius=80, fill="#ecc45c")
    initials = "".join(part[0] for part in name.split()[:2]).upper()
    font = load_font(78)
    box = draw.textbbox((0, 0), initials, font=font)
    draw.text(((512 - (box[2] - box[0])) / 2, 196), initials, font=font, fill="#241136")
    image.save(path, quality=92)


def download_avatar(filename, name, url):
    target = AVATAR_DIR / filename
    request = Request(url, headers={"User-Agent": "free-avatar-studio/1.0"})
    try:
        with urlopen(request, timeout=20) as response:
            target.write_bytes(response.read())
        with Image.open(target) as image:
            image.convert("RGB").resize((512, 512)).save(target, quality=92)
        print(f"Downloaded {name}: {target}")
    except (OSError, URLError) as exc:
        print(f"Could not download {name} from {url}: {exc}. Creating placeholder.")
        make_placeholder(target, name)


def main():
    for filename, name, url in AVATARS:
        download_avatar(filename, name, url)


if __name__ == "__main__":
    main()
