FROM postgres:latest

ENV POSTGRES_USER=testiwhisk
ENV POSTGRES_PASSWORD=eT1wDCKu
ENV POSTGRES_DB=database

# This will execute schema.sql when the container is initialized
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose the Postgres port
EXPOSE 5432