import urllib.request
import json
import os
import sys

def load_env():
    env_file = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip())

load_env()

FIGMA_TOKEN = os.environ.get("FIGMA_TOKEN", "")
FILE_KEY = os.environ.get("FIGMA_FILE_KEY", "VX9AuJvyk8aXuQQDRbRspg")

def get_node(node_id: str, depth: int = 4):
    url = f"https://api.figma.com/v1/files/{FILE_KEY}/nodes?ids={node_id}&depth={depth}"
    req = urllib.request.Request(url, headers={"X-Figma-Token": FIGMA_TOKEN})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def export_image(node_id: str, format: str = "png", scale: float = 2.0):
    url = f"https://api.figma.com/v1/images/{FILE_KEY}?ids={node_id}&format={format}&scale={scale}"
    req = urllib.request.Request(url, headers={"X-Figma-Token": FIGMA_TOKEN})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def inspect_node(node, depth=0):
    indent = "  " * depth
    name = node.get("name")
    ntype = node.get("type")
    style = node.get("style", {})
    fills = node.get("fills", [])
    color_info = ""
    if fills and len(fills) > 0 and fills[0].get("color"):
        c = fills[0]["color"]
        r, g, b = int(c.get("r", 0) * 255), int(c.get("g", 0) * 255), int(c.get("b", 0) * 255)
        color_info = f" #{r:02x}{g:02x}{b:02x}"

    txt = ""
    if ntype == "TEXT":
        fs = style.get("fontSize")
        fw = style.get("fontWeight")
        lh = style.get("lineHeightPercentFontSize")
        txt = f' [Text: "{node.get("characters", "").strip()}" font={style.get("fontFamily")} {fs}px weight={fw} lh={lh}%{color_info}]'
    elif color_info:
        txt = f" [{color_info}]"

    bbox = node.get("absoluteBoundingBox", {})
    w, h = bbox.get("width", 0), bbox.get("height", 0)
    print(f"{indent}- {name} ({ntype}) {w:.1f}x{h:.1f}{txt}")
    for child in node.get("children", []):
        inspect_node(child, depth + 1)

if __name__ == "__main__":
    node_id = sys.argv[1] if len(sys.argv) > 1 else "33:327"
    data = get_node(node_id)
    node = data["nodes"][node_id]["document"]
    inspect_node(node)
