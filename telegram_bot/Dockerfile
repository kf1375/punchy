FROM python:3.12-slim

WORKDIR /usr/src
COPY . .

RUN apt-get update && \
    apt-get install -y build-essential libzbar-dev && \
    pip install zbar

RUN pip install -r requirements.txt

CMD ["python", "-m", "app.bot"]