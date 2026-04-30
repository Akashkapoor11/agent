FROM postgres:16-alpine

COPY milan-ddl.sql /docker-entrypoint-initdb.d/01-ddl.sql
COPY milan-dml.sql /docker-entrypoint-initdb.d/02-dml.sql
