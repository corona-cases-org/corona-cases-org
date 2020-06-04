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

## Downloading new data

Download latest datasets from Wikipedia and regenerate data.json:

```
node index.js
```
