# Run
```
# build xc-lib-private
git clone https://github.com/nocodb/xc-lib-private
npm install
cd xc-lib-private
npm run build

# build nc-common
git clone https://github.com/nocodb/nc
cd nc/packages/nc-common
npm install
npm build

# build frontend
cd ../packages/nc-gui
npm install
npm run dev

# build backend
cd ../packages/nocodb
npm install
npm run watch:run

```