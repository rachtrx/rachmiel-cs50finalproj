# INVENTORY - rachmiel-cs50finalproj

#### Video Demo: 

## This project was build with WSL2 on Windows, so commands below are in Bash

## IMPORTANT: Docker is required to run this project!
- This is because PostgreSQL is used instead of SQLite, and PostgreSQL can be easily run within a Docker container.
- flask run will not work because some SQL queries do not work on SQLite

## This web application runs on docker, where 3 services (containers) are created: 
- an Nginx reverse proxy forwards requests to the web server, and serves static content
- a Web server is exposed via Gunicorn
- A database server that runs PostgreSQL

# Steps after installing Docker:

- git clone https://github.com/rachtrx/rachmiel-cs50finalproj.git
- python3 -m venv venv
- . venv/bin/activate
- cd rachmiel-cs50finalproj

### Create .env files
- remove all the .example extension for the env files, which would result in .env.dev, .env.prod, and .env.prod.db

## BUILD (choose between Prod or Dev)

### Production: If there is already a volume in Docker with the database, ignore create_db
- npm install 
- npm run build:parcel 
- npm run build:css 
- docker-compose -f docker-compose.prod.yml up -d --build 
- docker-compose -f docker-compose.prod.yml exec web flask create_db
- docker-compose -f docker-compose.prod.yml exec web flask seed_db
- navigate to 127.0.0.1:80
- login with email: test@test.com and password: 1234


### Development: Resets the database by default - see entrypoint.sh
- npm install
- npm run start
- npm run watch:sass
- docker-compose -f docker-compose.yml up -d --build 
- navigate to 127.0.0.1:5001
- login with email: test@test.com and password: 1234

### Testing:
#### Create Device:
- Devices can be added in 3 ways:
  - Onboard Device (initially the home page when database is empty, supports only Excel bulk upload)
  - Register Model -> Register Device (supports individual and bulk upload)
  - Register Device -> Onboard Device (same as Onboard Device)
  - Get the sample onboard excel file from https://1drv.ms/x/s!AteVrZk2S_HiiZAq8qLRmY1P1BqB4w?e=l9ddb3
#### Create User:
- Users can be added in 2 ways:
  - Onboard Device (User can be added via onboard if they are currently loaning a device, bulk upload)
  - Create User (supports individual and bulk upload)
#### Loan Device
  - Devices can only be loaned individually to have a strict workflow in device movement. Loan forms are automatically generated but can also be submitted without the form
#### Return Device
  - Devicess can only be returned individually for the same reason. If the user signed when loaning, it can be downloaded again to complete the form. Upon submission, the previous loan form is replaced by the new return form. Can also be submitted without the form
#### Condemn Device / Remove User
  - Devices can be condemned and Users can be removed both individually and in bulk
#### Devices, Users, Events
  - There are 3 main overviews in the navigation bar: Devices (also Show All Devices), Users (also Show All Users) and History.
  - Able to filter based on multiple factors to find target Device / User / Event
  - Able to export data into Excel
#### Show Device / Show User
  - Provides comprehensive details of each user and device, including a timeline of events relevant to each Device / User
#### Dashboard
  - The homepage provides administrators with a broad overview of the top devices, users, budget etc, to get an understanding of the entire school inventory

## CLEANUP

### To remove all tables,
- docker-compose -f docker-compose.prod.yml exec web python manage.py remove_db (PROD) 
- docker-compose -f docker-compose.yml exec web python manage.py remove_db (DEV)

### To remove all docker containers, images and volumes,
- docker-compose -f docker-compose.prod.yml down -v --rmi all


## Other notes and for future reference:

### Use Alembic for database migration (not too sure about how this works)

### To view the tables from the terminal:
- docker-compose exec db psql --username= --dbname=


# ABOUT THIS PROJECT

This project was created in order to keep track of my school's inventory. As many of the inventory records are stored in Excel files which grow over time, it gets difficult to keep track of each asset and its corresponding user / location / status / age. This application seeks to encapsulate all neccessary information about each device in my school's inventory. 

Unfortunately, due to time constraints, I was unable to complete the authentication part of Flask, and the Estate Management section in Javascript is just a possibie eextension in the future, hence they are empty. For now, this application is fully capable of keeping trask of all tangible devices and users in the school belonging to the IT department

## Technical Decisions

### Design challenges:
There were many challenges in the creation of this application, but the biggest challenge was when my Python code became too huge and I had no choice but to research on how to create Blueprints and use a more clean approach in SQL queries through SQLAlchemy. 

Both my Flask and Javascript uses the MVC architecture

For Flask, I eventually created multiple blueprints, to split my views, APIs, forms and models, so that I could segregate my website better. This required a huge change in my code syntax as it was no longer using CS50's raw SQL syntax, but it made my code way cleaner and easier to debug.

My javascript communicates with my Flask backend via async/await in many ways, including:
- generate search results when searching for models, devices and users in forms
- upload form data, including PDF files to store the signed loan and return forms, which will be stored one of the Docker volumes
- generate the overview markups for Devices, Users and Events

I was also eventually convinced to use PostgreSQL for my database instead of SQLite so that I could host everything within Docker containers so that this application can be more portable if it is eventually shifted to cloud. For now, it will run on premises. This required some changes in my code as well, as I needed to use psycopg to interact with my database, and some of the SQLAlchemy syntax were different from Sqlite.

### Implementation decisions:
Implementing this application was difficult as I was using Flask along with vanilla Javascript that did not seem to gel very well together. The background is that I took the 70 hour Javascript Udemy course by Jonas Schmedtmann right after I finished CS50 lectures, so I wanted to incorporate both Javascript and Flask together. 

However, I was faced with multiple problems because there were different ways to solve the same problem, such as:
- Whether to render my HTML purely from Flask, or render it dynamically from Javascript after the page loads. I eventually decided that for forms, I would generate it using Flask, whereas for overviews, I would generate it dynamically from Javascript. 
- Having to place my SVG file in the correct location so that I could load it from both Javascript and my HTML.
- Client side and server side validation, where I believe I made the mistake of submitting forms through JSON instead of the normal FormData type that browsers use, but I decided to leave it as such. In the future, I should probably not do such strict validation on c=the client side and leave it to the server side.

### New Technologies
For new technologies, I used a combination of Docker, Nginx and Gunicorn for the deployment of my application. Since I have a certificate in CCNA, it allowed me to quickly grasp the concept of running Docker and Nginx. For the code itself, I used SQLAlchemy instead of CS50's library to make queries, as well as a few 3rd party Javascript libraries, namely ChartJS, SheetJS and jsPDF.

These new deployment technologies will definitely be useful if I plan to run this application on any device that has Docker.

## Ethical Decisions
### What motivated you to complete this project? What features did you want to create and why?

I was an ICT Intern in my school when I finished CS50 lectures, so I requested a project from my superior that I could not only create my CS50 Final Project, but also improve the school environment I was working at. Having only 3 months before my University, this motivated me to submit this project and create the production environment before my internship ended.

Here are some main features:
- Provides insight into Users and Devices through a visually appealing dashboard run by ChartJS 
- Provides administrators the ability to register new devices and users, both indivdually and by bulk
- Users are grouped by their departments, and Devices are grouped by their Device Types, Models and Vendors
- Decent amount of error handling throughout the code to prevent duplicates / invalid values, which can be improved. 
- Integrates with SheetJS to export data for a more submersive view of all devices and events through Excel (eg. if audit checks are required).
- Enforces tight movement of devices between users, as users have to loan and return devices through this system, which renders a loan PDF document using jsPDF. 
- Devices and users can be removed as well after they have been condemned / resigned respectively

### Who are the intended users of your project? What do they want, need, or value?
This project was created exclusively for IT administrators in my department in my school

They would want to have a comprehensive and clean understanding of the school's fixed assets belonging to the IT department, including laptops, monitors, projectors, servers, network devices etc. This would require the use of a management system, capable of keeping track of all devices. 

Traditionally, the inventory is managed by manually keying in data into Excel sheets, detailing each device and updating it along the way. 
This can create errors and duplicates due to human error as it becomes an arduous task to locate each device. With this inventory application, it would unquestionably reduce the administrative overhead to edit each Excel file, providing IT staff more time to be more productive in other areas, such as looking into User and Access Management, System Administration, Cloud Migration and other aspects of IT in the school infrastructure.


### How does your project's impact on users change as the project scales up? 
- Due to the lack of authentication, unauthorised staff may be able to do port scanning and find my application, even though they do not have remote access to servers. There might also be the possiblility of duplicate data (I hope not) due to uppercase / lowercase / spacing issues
- There might be difficulty in keeping track of students devices, as they constantly change classes and hence devices tagged to them also change. Thia will require individual loan and return events for each device which may be time consuming. However, I have tried to mitigate this issue by allowing the user to return / loan another device instead of automatically redirecting them to the main page.
- I did not create a functionality to modify any data that is significant to a device / user, so administrators will have to ensure that they do not key in the wrong data.
- I believe there are tons of vulnerabilites in my code due to my lack of expertise, which malicious actors can use to exploit, thus I created this only for my school to use on premises for now.

