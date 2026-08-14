import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

async def test():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/forms")
        print(response.status_code)
        print(response.json())

if __name__ == "__main__":
    asyncio.run(test())
