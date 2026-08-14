import asyncio
import os
from app.main import app, lifespan

async def test():
    async with lifespan(app):
        pass

if __name__ == "__main__":
    asyncio.run(test())
