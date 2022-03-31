# Run

If you are doing a git pull on same day - you will have to remove existing metadb as underlying metadb can differ

### Steps to run locally

#### Setting up running environment

- Clone `nocodb/nocodb` GitHub repo and checkout to `feat/v2` branch
  ```sh
  git clone https://github.com/nocodb/nocodb
  git checkout feat/v2
  cd nocodb
  ```
- Navigate to `nocodb-sdk` package folder, install and build the package
  ```sh
  cd packages/nocodb-sdk
  npm install
  npm run build
  ```

#### Running backend  

```sh
# Navigate to `nocodb` package and install dependencies
cd packages/nocodb
npm install
# require sqlite3
npm run watch:run
# if you have mysql, then use
# npm run watch:run:mysql
```

#### Running frontend

```sh
# Navigate to `nc-gui` package and install dependencies
cd packages/nocodb
npm install
npm run dev
```


