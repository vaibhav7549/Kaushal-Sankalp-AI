.PHONY: dev backend frontend seed test audit

dev:
	@echo "Starting backend and frontend..."
	start cmd /k "cd backend && uvicorn app.main:app --reload --port 8000"
	start cmd /k "cd frontend && npm run dev"

seed:
	@echo "Running database seeder..."
	$env:PYTHONPATH="backend" && python scripts/seed_db.py

test:
	@echo "Running tests..."
	cd backend && pytest

audit:
	@echo "Running Lighthouse audit..."
	# (Requires lighthouse cli installed globally)
	npx lighthouse http://localhost:5173 --view
