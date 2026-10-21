# Cold-start seed race + migration check (iteration 7). Run: /root/.venv/bin/python coldstart_race_check.py
import asyncio
import os
import subprocess
import sys
import time

import httpx
from pymongo import MongoClient

MONGO = "mongodb://localhost:27017"
DBN = "hooklink_fresh"
UV = "/root/.venv/bin/uvicorn"
mc = MongoClient(MONGO)


def start(port):
    env = dict(os.environ, MONGO_URL=MONGO, DB_NAME=DBN, CORS_ORIGINS="*", DAILY_GENERATION_LIMIT="5")
    return subprocess.Popen([UV, "api.index:app", "--port", str(port), "--log-level", "warning"], cwd="/app", env=env,
                            stdout=subprocess.DEVNULL, stderr=open(f"/tmp/uv_{port}.log", "w"))


def wait_up(port):
    # wait for TCP without hitting /api (so first real requests are cold)
    import socket
    for _ in range(100):
        try:
            socket.create_connection(("127.0.0.1", port), 0.2).close()
            return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("server not up")


async def fire(ports, n):
    paths = ["/api/library", "/api/library", "/api/", "/api/usage"]
    async with httpx.AsyncClient(timeout=30) as c:
        async def one(i):
            p = ports[i % len(ports)]
            path = paths[i % len(paths)]
            try:
                r = await c.get(f"http://127.0.0.1:{p}{path}")
                tot = r.json().get("total") if path == "/api/library" and r.status_code == 200 else None
                return path, r.status_code, tot
            except Exception as e:
                return path, "EXC", str(e)
        return await asyncio.gather(*[one(i) for i in range(n)])


def state():
    col = mc[DBN].library_hooks
    idx = col.index_information()
    nums = sorted(d["number"] for d in col.find({}, {"number": 1}))
    return col.count_documents({}), idx.get("number_1", {}).get("unique", False), nums == list(range(1, 31))


def run(ports, n, label, prep=None):
    mc.drop_database(DBN)
    if prep:
        prep()
    procs = [start(p) for p in ports]
    try:
        for p in ports:
            wait_up(p)
        res = asyncio.run(fire(ports, n))
        time.sleep(0.5)
        count, uniq, exact = state()
        totals = sorted({r[2] for r in res if r[0] == "/api/library"}, key=str)
        bad = [r for r in res if r[1] != 200]
        ok = count == 30 and uniq and exact and all(t == 30 for t in totals) and not bad
        print(f"{'PASS' if ok else 'FAIL'} {label}: docs={count} unique={uniq} nums1..30={exact} totals={totals} non200={bad[:3]}")
        return ok
    finally:
        for pr in procs:
            pr.terminate()
            pr.wait()


def make_dupes():
    col = mc[DBN].library_hooks
    col.create_index("number")  # non-unique
    docs = [{"number": i, "category": "curiosity-gap", "text": f"dup {i}", "platforms": []} for i in range(1, 31)]
    for _ in range(3):
        col.insert_many([dict(d) for d in docs])
    col.insert_many([{"number": 31 + i, "text": "extra"} for i in range(5)])
    print(f"  prepped dupes: {col.count_documents({})} docs, idx={col.index_information().get('number_1')}")


def make_unique_with_extra():
    col = mc[DBN].library_hooks
    col.create_index("number", unique=True)
    col.insert_many([{"number": 40 + i, "text": "extra"} for i in range(3)])


results = []
for i, n in enumerate([20, 30, 50, 50, 40]):
    results.append(run([8099], n, f"single-proc run{i+1} n={n}"))
for i in range(4):
    results.append(run([8099, 8098], 50, f"two-proc run{i+1} n=50"))
for i in range(2):
    results.append(run([8099], 30, f"migration single-proc run{i+1}", make_dupes))
results.append(run([8099, 8098], 50, "migration two-proc", make_dupes))
results.append(run([8099], 20, "unique idx + extra >30", make_unique_with_extra))
# verify seeded text (not dup text) after migration
mc.drop_database(DBN)
print(f"\nTOTAL {sum(results)}/{len(results)} passed")
print("dbs left:", [d for d in mc.list_database_names() if d.startswith("hooklink_fresh")])
sys.exit(0 if all(results) else 1)
