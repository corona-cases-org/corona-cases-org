# corona-cases.org

## Local development

Install dependencies:

```
npm install
```

Start the Broccoli server for client code:

```
broccoli serve
```

And start the server in a separate terminal:

```
nodemon server.js
```

## Update datasets

Download new data from [coronadatascraper.com](https://coronadatascraper.com/)
into the `data` directory:

```
npm run build:data
```
