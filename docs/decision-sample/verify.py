"""Verify the three records in the adjacent public synthetic evidence sample, offline."""
import hashlib
import json
import re
import sys
from pathlib import Path

DOMAIN = b"AGENT//ARENA public decision sample v1\0"
HERE = Path(__file__).resolve().parent
FIELDS = {"decision", "reason", "status", "policy_version", "policy_revision", "ticket_status", "ticket_revision"}
STATES = [("DENY", "OPEN", 0), ("REQUIRE_APPROVAL", "OPEN", 0), ("ALLOW", "CLOSED", 1)]


def unique(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate key")
        result[key] = value
    return result


def read(path):
    with path.open("rb") as stream:
        data = stream.read(32769)
    if len(data) > 32768:
        raise ValueError("oversized sample")
    return json.loads(data.decode("utf8"), object_pairs_hook=unique)


def digest(body):
    data = json.dumps(body, sort_keys=True, ensure_ascii=True, separators=(",", ":"), allow_nan=False).encode("ascii")
    return hashlib.sha256(DOMAIN + data).hexdigest()


def verify(records, checkpoint, pinned=None):
    if type(records) is not list or len(records) != 3:
        raise ValueError("expected three ordered records")
    previous = "0" * 64
    for seq, (row, state) in enumerate(zip(records, STATES), 1):
        if type(row) is not dict or set(row) != {"seq", "previous_sha256", "payload", "sha256"}:
            raise ValueError("wrong row fields")
        p = row["payload"]
        if type(p) is not dict or set(p) != FIELDS:
            raise ValueError("wrong payload fields")
        if not all(type(p[k]) is str and re.fullmatch(r"[A-Za-z0-9_.:+-]{1,96}", p[k])
                   for k in FIELDS - {"policy_revision", "ticket_revision"}):
            raise ValueError("invalid field value")
        if type(p["policy_revision"]) is not int or p["policy_revision"] != 1 or type(p["ticket_revision"]) is not int:
            raise ValueError("wrong revision")
        if (p["decision"], p["ticket_status"], p["ticket_revision"]) != state:
            raise ValueError("unexpected scenario transition")
        if type(row["seq"]) is not int or row["seq"] != seq or row["previous_sha256"] != previous:
            raise ValueError("broken sequence")
        previous = digest({k: row[k] for k in ("payload", "previous_sha256", "seq")})
        if row["sha256"] != previous:
            raise ValueError("record digest mismatch")
    if type(checkpoint) is not dict or set(checkpoint) != {"count", "tip_sha256"} or type(checkpoint["count"]) is not int or checkpoint != {"count": 3, "tip_sha256": previous}:
        raise ValueError("checkpoint mismatch")
    if pinned is not None and pinned != previous:
        raise ValueError("independent digest mismatch")
    return previous


if __name__ == "__main__":
    try:
        if len(sys.argv) > 2:
            raise ValueError("usage: python verify.py [trusted-tip-sha256]")
        tip = verify(read(HERE / "records.json"), read(HERE / "checkpoint.json"), sys.argv[1] if len(sys.argv) == 2 else None)
        print("Verified 3 linked sample records. SHA-256 tip", tip)
    except (ValueError, OSError, RecursionError) as err:
        print("Verification failed.", file=sys.stderr)
        sys.exit(1)

