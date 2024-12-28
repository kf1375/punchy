FROM python:3.12-slim

WORKDIR /usr/src
COPY . .

RUN apt-get update && apt-get install -y --no-install-recommends \
    libzbar0 \
    zbar-tools \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install -r requirements.txt

CMD ["python", "-m", "app.bot"]