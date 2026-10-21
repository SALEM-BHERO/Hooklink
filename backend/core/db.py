import asyncio
import os

from motor.motor_asyncio import AsyncIOMotorClient


class _Database:
    """Lazily binds a Motor client to the running event loop (safe for serverless)."""

    _client = None
    _loop = None

    def _db(self):
        loop = asyncio.get_running_loop()
        if self._loop is not loop:
            if self._client is not None:
                self._client.close()
            self._client = AsyncIOMotorClient(os.environ["MONGO_URL"])
            self._loop = loop
        return self._client[os.environ["DB_NAME"]]

    def __getattr__(self, name):
        return getattr(self._db(), name)


db = _Database()
