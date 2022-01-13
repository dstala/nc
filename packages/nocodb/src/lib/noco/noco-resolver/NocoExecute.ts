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
  const extractNested = (path, dataTreeObj: any = {}, resolver = {}): any => {
    if (path.length) {
      const key = path[0];
      if (!dataTreeObj[key]) {
        if (typeof resolver[key] === 'function') {
          dataTreeObj[path[0]] = resolver[key](args);
        } else if (typeof resolver[key] === 'object') {
          dataTreeObj[path[0]] = Promise.resolve(resolver[key]);
        } else {
          if (typeof dataTreeObj === 'object') {
            dataTreeObj[path[0]] = Promise.resolve(resolver[key]);
          }
        }
      } else if (typeof dataTreeObj[key] === 'function') {
        dataTreeObj.__proto__ = {
          ...dataTreeObj.__proto__,
          [key]: dataTreeObj[key]()
        };
      }

      // todo: handle lookup

      return (dataTreeObj[path[0]] instanceof Promise
        ? dataTreeObj[path[0]]
        : Promise.resolve(dataTreeObj[path[0]])
      ).then(res1 => {
        if (Array.isArray(res1)) {
          return Promise.all(res1.map(r => extractNested(path.slice(1), r)));
        } else {
          return extractNested(path.slice(1), res1);
        }
      });
    } else {
      return Promise.resolve(dataTreeObj);
    }
  };

  // function for extracting field
  function extractField(key) {
    if (!resolverObj?.__proto__?.__columnAliases?.[key]) {
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
        resolverObj?.__proto__?.__columnAliases?.[key]?.path,
        dataTree,
        resolverObj
      ).then(res => {
        return Promise.resolve(flattenArray(res));
      });
    }
  }

  let extractKeys = Object.keys(requestObj);
  if (!extractKeys?.length) extractKeys = Object.keys(requestObj);

  const out: any = {};
  const resolPromises = [];
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
    if (res[key]) {
      resolPromises.push(
        (async () => {
          out[key] = await res[key];
        })()
      );
    }
  }

  await Promise.all(resolPromises);

  return out;
};

export { nocoExecute };
