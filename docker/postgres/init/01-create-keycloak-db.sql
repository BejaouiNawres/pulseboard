-- Keycloak stores its realms, users and sessions in its own database
-- on the same Postgres instance. Runs only when the data volume is first created.
CREATE DATABASE keycloak;
