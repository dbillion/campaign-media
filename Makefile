# Define commands to build and run the Docker Compose services
.PHONY: up down build test backend frontend

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

test:
	pytest --maxfail=1 --disable-warnings -v

backend:
	@if [ "$(shell uname)" = "Linux" ] || [ "$(shell uname)" = "Darwin" ]; then \
		curl -LsSf https://astral.sh/uv/install.sh | sh; \
	elif [ "$(shell uname)" = "MINGW64_NT" ] || [ "$(shell uname)" = "MSYS_NT" ]; then \
		powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"; \
	fi
	uv venv
	source activate
	cd campaign-backend && uv pip install -r requirements.txt && uvicorn main:app --reload

frontend:
	@if [ "$(shell uname)" = "Linux" ] || [ "$(shell uname)" = "Darwin" ]; then \
		curl https://get.volta.sh | bash; \
	elif [ "$(shell uname)" = "MINGW64_NT" ] || [ "$(shell uname)" = "MSYS_NT" ]; then \
		winget install Volta.Volta; \
	fi
	volta install node@20
	volta install yarn@4.6
	cd campaign-frontend && yarn && yarn dev