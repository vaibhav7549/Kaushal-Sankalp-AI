import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.seed.generator import run_seed
from app.core.database import init_db

async def main():
    print("Initializing DB...")
    await init_db()
    print("Running seeder...")
    await run_seed()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
