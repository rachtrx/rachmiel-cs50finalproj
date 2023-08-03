# rachmiel-cs50finalproj

## Install Docker


### Production: If there is already a volume in Docker with the database, there is no need to run create_db

- npm run build:parcel 
- npm run build:css 
- docker-compose -f docker-compose.prod.yml up -d --build 
- docker-compose -f docker-compose.prod.yml exec web python manage.py create_db 
- navigate to 127.0.0.1:1337


### Development: Resets the database by default - see entrypoint.sh

- npm install 
- npm run start 
- docker-compose -f docker-compose.yml up -d --build 
- navigate to 127.0.0.1:5001


### To remove all tables,

- docker-compose -f docker-compose.prod.yml exec web python manage.py remove_db (PROD) 
- docker-compose -f docker-compose.yml exec web python manage.py remove_db (DEV)


## Use Alembic for database migration (not too sure about how this works)


## To view the tables from the terminal:
- docker-compose exec db psql --username= --dbname=