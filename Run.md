# Run

If you are doing a git pull on same day - you will have to remove existing metadb as underlying metadb can differ

```
# build xc-lib-private
git clone https://github.com/nocodb/xc-lib-private
cd xc-lib-private
npm install
npm run build

# build nc-common
git clone https://github.com/nocodb/nc
cd nc/packages/nc-common
npm install
npm run build

# build backend
cd ../nocodb
npm install
# require sqlite3
npm run watch:run
# if you have mysql, then use 
# npm run watch:run:mysql

# build frontend
cd ../nc-gui
npm install
npm run dev
```