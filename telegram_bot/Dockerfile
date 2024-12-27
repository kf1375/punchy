FROM python:3.12-slim
WORKDIR /usr/src
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "-m", "app.bot"]