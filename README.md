## Description

This is an Image Repository API built with NestJs (Typescript), MongoDB (Mongoose), and AWS S3 buckets for secure image storage.

---

## Setup

### Without Docker

This will require that you have MongoDB installed and running on your computer. If you have Docker and Docker-compose installed check the second method below.

-   Clone the repo, and then install dependencies using either npm

```bash
npm i
```

or yarn

```bash
yarn
```

The `ConfigService` uses environment variables found in a `.env` file in the root folder, so make sure to fill in the required variable in `.env.example` and then

```bash
cp .env.example .env
```

To start a development server on `localhost:3000` simply execute

```bash
yarn start:dev
```

or

```bash
npm run start:dev
```

### Docker

You can start 2 docker containers (the api and mongo) using the provided Dockerfile by executing

```bash
docker-compose up -d
```

This may take some time on first launch as it will pull the node and mongo images and install dependencies.

This will expose the API on `localhost:9001` and mongo on `localhost:27017`

---

## Environment

`ConfigService` loads the following environment variables to use in the app

**API_ENV** - either `dev` or `prod`, defaults to `dev`

**DB_URL** - URL of the MongoDB database

**JWT_SECRET_KEY** - secret key used to sign and decrypt the JSON Web tokens used for user authentication. Ideally a long random string

**JWT_EXPIRATION_TIME** - time that the issued access token is valid for. Defaults to 2 days (`2d`)

**AWS_S3_BUCKET** - The name of the AWS S3 bucket storage that the images should be stored on

**AWS_ACCESS_KEY_ID** - Access key ID that can be generated from the Management console -> Access keys

**AWS_SECRET_KEY** - Secret key generated along with the access key

---

## Usage

I recommend using Postman to send requests to the API:

### Access Token

-   The majority of the application is locked behind authentication which requires a valid JWT token.
-   Make an account/login to an existing one, by sending a `POST` request to either `/api/v1/user/register` or `/api/v1/user/login` respectively.
-   Copy the received `accessToken` into the Postman Authorization tab, select Bearer Token and paste the token on the right.

![postman-access-token](postman-access-token.png)

### Image Upload

-   To upload images, select the form-data option, and choose file in one of the key columns, and upload your image.
-   For each image uploaded, the endpoint expects a `tag` string. Due to Postman's limitations, multipart/form-data has an awkward syntax. Use tags[i] where i is the tag for the image i.
-   Also attach an `isPublic` boolean attribute for a request, indicating whether the images are public or private.

![postman-image-upload](postman-image-upload.png)

## Endpoints

### Public

```typescript
POST - "/api/v1/user/register"
req.headers["Content-type"]: "application/json"

POST - "/api/v1/user/login"
req.headers["Content-type"]: "application/json"
```

### Protected

All routes below need an authorization header
`req.headers["Authorization"]: "Bearer <TOKEN>"`

```typescript
POST - "/api/v1/images/upload"
req.headers["Content-type"]: "multipart/formdata"

PUT - "/api/v1/images/:id"
req.headers["Content-type"]: "application/json"

DELETE - "/api/v1/images/:id"

GET - "/api/v1/images/"

GET - "/api/v1/images/id/:id"

GET - "/api/v1/images/tag/:tag"
```

### Admin Only

This route does not serve much purpose but it showcases role based routes - only users with a `roles` property that includes `'ADMIN'` are authorized to access this path

```typescript
GET - '/api/v1/images/all';
```

## Testing

### Using Docker

```bash
# unit tests
$ docker exec -it nest yarn test

# end to end
$ docker exec -it nest yarn test:e2e
```

### Without Docker

```bash
# unit tests
$ npm run test

# end to end tests
$ npm run test:e2e
```

---
