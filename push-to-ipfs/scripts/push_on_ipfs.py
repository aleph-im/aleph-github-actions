#!/usr/bin/env python3
import requests
import json
import sys
from pathlib import Path
from cid import make_cid

def upload_with_requests(folder: Path, gateway: str):
    url = f"{gateway}/api/v0/add"
    params = {
        "recursive": "true",
        "wrap-with-directory": "true"
    }

    # Prepare file data like curl -F file=@./dist/
    files = []
    for path in folder.rglob("*"):
        if path.is_file():
            relative_path = path.relative_to(folder.parent)
            files.append(
                ("file", (str(relative_path), open(path, "rb")))
            )

    response = requests.post(url, params=params, files=files)
    response.raise_for_status()

    # Parse the response line-by-line
    cid_v0 = None
    for line in response.text.strip().splitlines():
        entry = json.loads(line)
        cid_v0 = entry.get("Hash")

    if not cid_v0:
        raise RuntimeError("CID not found in response.")

    cid_v1 = make_cid(cid_v0).to_v1().encode("base32").decode()
    return {"cid_v0": cid_v0, "cid_v1": cid_v1}

if __name__ == "__main__":
    path = Path(sys.argv[1])
    if not path.is_dir():
        print("Error: path must be a directory")
        sys.exit(1)

    result = upload_with_requests(path.resolve(), "https://ipfs-2.aleph.im")
    print(json.dumps(result))