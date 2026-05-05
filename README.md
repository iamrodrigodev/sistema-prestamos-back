docker run --name pg-sistema-prestamos -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=sistema_prestamos -p 5433:5433 -d postgres:15-alpine
Get-Content db.sql | docker exec -i