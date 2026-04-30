# Build context: milan-be/ (set Render's Root Directory to milan-be).
# This image runs FastAPI on :5000. The frontend is deployed separately
# as a Render Static Site, so no FE build step is needed here.

FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 5000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
