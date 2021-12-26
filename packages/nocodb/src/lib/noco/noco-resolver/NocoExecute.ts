interface XcRequest {
  [key: string]: XcRequest | 1 | true;
}

const flattenArray = res => {
  return Array.isArray(res) ? res.flatMap(r => flattenArray(r)) : res;
};

const nocoExecute = async (
  requestObj: XcRequest,
  resolverObj,
  dataTree = {},
  args = null
): Promise<any> => {
  const res = [];
  // extract nested(lookup) recursively
  const extractNested = (path, o = {}, resolver = {}): any => {
    if (path.length) {
      const key = path[0];
      if (!o[key]) {
        if (typeof resolver[key] === 'function') {
          o[path[0]] = resolver[key](args);
        } else if (typeof resolver[key] === 'object') {
          o[path[0]] = Promise.resolve(resolver[key]);
        } else {
          o[path[0]] = Promise.resolve(resolver[key]);
        }
      } else if (typeof o[key] === 'function') {
        o[key] = o[key]();
      }

      return (o[path[0]] instanceof Promise
        ? o[path[0]]
        : Promise.resolve(o[path[0]])
      ).then(res1 => {
        if (Array.isArray(res1)) {
          return Promise.all(res1.map(r => extractNested(path.slice(1), r)));
        } else {
          return extractNested(path.slice(1), res1);
        }
      });
    } else {
      return Promise.resolve(o);
    }
  };

  // function for extracting field
  function extractField(key) {
    if (!resolverObj?.__proto__?.constructor?.__columnAliases?.[key]) {
      if (resolverObj) {
        // resolve if it's resolver function
        if (typeof resolverObj[key] === 'function') {
          res[key] = resolverObj[key](args);
        } else if (typeof resolverObj[key] === 'object') {
          res[key] = Promise.resolve(resolverObj[key]);
        } else {
          res[key] = Promise.resolve(resolverObj[key]);
        }
      }

      dataTree[key] = res[key];
    } else {
      // if nested extract the nested value
      res[key] = extractNested(
        resolverObj?.__proto__?.constructor?.__columnAliases?.[key]?.path,
        dataTree,
        resolverObj
      ).then(res => {
        return Promise.resolve(flattenArray(res));
      });
    }
  }

  let extractKeys = Object.keys(requestObj);
  if (!extractKeys?.length) extractKeys = Object.keys(requestObj);

  for (const key of extractKeys) {
    extractField(key);

    if (requestObj[key] && typeof requestObj[key] === 'object') {
      res[key] = res[key].then(res1 => {
        if (Array.isArray(res1)) {
          return Promise.all(
            res1.map(r =>
              nocoExecute(requestObj[key] as XcRequest, r, (dataTree[key] = {}))
            )
          );
        } else {
          return nocoExecute(
            requestObj[key] as XcRequest,
            res1,
            (dataTree[key] = {})
          );
        }
      });
    }
  }

  const out = {};
  for (const [k, v] of Object.entries(res)) {
    if (k in requestObj) out[k] = await v;
  }

  return out;
};

export { nocoExecute };
