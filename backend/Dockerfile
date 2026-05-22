# Base image
FROM python:3.11-slim

# Install uv for fast dependency installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies without installing the project itself
RUN uv sync --frozen --no-cache

# Copy project files
COPY . .

# Expose port (default 8000)
EXPOSE 8000

# Set environment path to use virtualenv created by uv
ENV PATH="/app/.venv/bin:$PATH"

# Run the backend
CMD ["python", "main.py"]
