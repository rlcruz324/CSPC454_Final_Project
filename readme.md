------------------------------------------------------------------
Lucky Star Estates
CSPC 454 – Final Project
Author: Raquel Cruz
App URL: https://main.d128j42sisig7m.amplifyapp.com/
(Will likely take down by the 20th)

------------------------------------------------------------------

Note
------------------------------------------------------------------
I am not entirely sure it can run locally on any other pc. I had to do a lot of debugging that I didnt record in my notes.txt. Plus I had to change some things because I am running this on Debian Linux. Let me know if you have issues. 

------------------------------------------------------------------

PROJECT OVERVIEW
------------------------------------------------------------------
Warning this will not run if Cognito is not set up.

Lucky Star Estates is a full-stack real estate web application made based on the following tutorial.
https://www.youtube.com/watch?v=X1zCAPLvMtw&t=7930s
Tenants can browse properties, apply for rentals, and manage favorites.
Managers can create and manage property listings and review applications.

Tech Stack:
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit
- Backend: Express.js, Prisma ORM
- Authentication: AWS Cognito
- Database: PostgreSQL
- Hosting: AWS Amplify (frontend), AWS EC2 (backend)
- Storage: AWS S3
- Maps: Mapbox GL

Repository Structure:
CSPC454_Final_Project
|- frontend
|- backend
|- README.txt

------------------------------------------------------------------
PREREQUISITES
------------------------------------------------------------------
Required:
- Node.js (v18 recommended)
- npm
- Git
- PostgreSQL
- pgAdmin (optional but recommended)
- AWS account with Cognito
- Mapbox account


------------------------------------------------------------------
POSTGRESQL DATABASE SETUP (LOCAL)
------------------------------------------------------------------

1. Install PostgreSQL

Download from:
https://www.postgresql.org/download/

Installer Setup (This will be diffrent depending on OS)

Select Components:
PostgreSQL Server
pgAdmin 4
Stack Builder
Command Line Tools

Make a superuser named postgres. 
Make a passwork and save it.

Port number: 5432

Default Local

Chose PostgreSQL 16 on port 5432

Please select the applications you would like to install. (Dont Skip This)
Special Extensions:
PostGIS 3.4 for PostgreSQL


2. Verify installation

psql --version

3. Start PostgreSQL service

For windows
Make sure PostGre is running
sc query postgresql
net start postgresql-x64-16

I used Linux so this is how I started it:
sudo systemctl status postgresql
sudo systemctl start postgresql

In the tutorial, EdRoh found a file called pg_ctl and clicked it to run it.

4. Install pgadmin.

https://www.pgadmin.org/download/

5. Open pgadmin.
In the Object Explorer click Server -> Local PostgreSQL
Right click Local PostgreSQL and create new database.

6. Database connection URL format
Replace superusername with your username.
Replace password with your password.
Replace databasename with your database.
DATABASE_URL="postgresql://superusername:password@localhost:5432/databasename?schema=public"

7. Create a .env in backend

Add this to it with your above URL.
DATABASE_URL="postgresql://devuser:1234@localhost:5432/test?schema=public"

------------------------------------------------------------------
BACKEND SETUP
------------------------------------------------------------------

1. Navigate to backend

cd backend

2. Install dependencies

npm install

3. Prisma setup

Generate Prisma client:
npx prisma generate

Run migrations:
npx prisma migrate dev --name init

Seed database:
npm run seed
(You may need to run this twice.)

4. Run backend

npm run dev

Backend runs at:
http://localhost:3001

------------------------------------------------------------------
FRONTEND SETUP
------------------------------------------------------------------

1. Navigate to frontend

cd client

2. Install dependencies

npm install


------------------------------------------------------------------
AUTHENTICATION (AWS COGNITO)
------------------------------------------------------------------
- Uses AWS Cognito User Pools
- Amplify Authenticator handles login/signup
- Roles stored as custom attribute
- Some routes require authentication

Note:
If Cognito is not configured, the app will not load.

AWS COGNITO SETUP GUIDE

Lucky Star Estates uses AWS Cognito for user authentication.
This section explains how to recreate the Cognito setup.


REQUIREMENTS

1. AWS Account
2. AWS Console access
3. Region: us-west-2 (recommended)


AWS COGNITO QUICK SETUP

1. Sign in to the AWS Console

2. Navigate to Amazon Cognito

3. Click Create user pool

4. Configure the user pool:
   - Application type: Single-page application (SPA)
   - Required sign-in attribute: Email
   - Create the user pool

5. After creation, rename the User Pool:
   lucky-star-estates_cognito-userpool

6. Open the User Pool and navigate to App clients

7. Create a new App Client with the following settings:
   - App client name: lucky-star-estates_cognito-appclient
   - App type: Single-page application (SPA)

8. Navigate to Sign-up experience

9. Add a custom attribute:
   - Name: role
   - Type: String
   - Mutable: Yes
   - Save changes

10. Record the following values for later configuration:
    - User Pool ID
    - App Client ID



CONFIGURE FRONTEND ENVIRONMENT VARIABLES

1. Create a file in frontend named .env
2. Add the following values:

NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=us-west-youruserpoolid
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=yourclientid



------------------------------------------------------------------
MAPBOX SETUP
------------------------------------------------------------------
1. Create a Mapbox account
2. On the lefthand bar click style editor
3. On the righthand bar click Find inspiration in the style gallery.
4. Pick a map. Any map. Click it.
5. Click + Add to your Studio.
6. Open the lefthand bar. On the lefthand bar click Style editor.
7. Find your map and click on the 3 dots on the right of it. Then copy your Style URL
8. In vscode search mapbox://style and replace the instance with your Style URL
9. Generate an access token
10. Add token to the frontend .env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

------------------------------------------------------------------
RUN THE APP (Hopefully).
------------------------------------------------------------------
1. Open Terminal.
2. Run the following.
cd backend
npm run seed
npm run dev
1. Open another Terminal.
2. Run the following.
cd frontend
npm run dev

(fingers crossed)

------------------------------------------------------------------
KNOWN ISSUES
------------------------------------------------------------------
- Search only supports full addresses or coordinates
- Brief 404 flash during sign-in redirect
- Some Next.js promise warnings on manager pages
- Property image rendering from S3 may be inconsistent
- Add Property feature may be partially unstable
- Some UI buttons have low contrast


