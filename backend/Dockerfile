# backend/Dockerfile (простая версия)

FROM python:3.12-slim

WORKDIR /app

# Системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Зависимости
COPY req.txt .
RUN pip install --no-cache-dir -r req.txt

# Пользователь
RUN useradd --create-home appuser && chown -R appuser:appuser /app
USER appuser

# Код
COPY --chown=appuser:appuser . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]