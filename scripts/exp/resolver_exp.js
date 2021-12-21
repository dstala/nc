const nestResolver = {
  text1: 'level 1',
  async text2() {
    return 'level 1 resolver'
  },
  nested1: {
    text3: 'level 2 - 1',
    async text4() {
      return 'level 2 - 1 resolver'
    },
    nested2: {
      text5: 'level 3 - 1',
      async text6() {
        return 'level 3 - 1 resolver'
      },
    },
  },
  nested2: {
    text7: 'level 2 - 2',
    title: 'level 2 - 2',
    async text8() {
      return 'level 2 - 2 resolver '
    },
  },
  async nested3() {
    return {
      text9: 'level 3 - 2',
      async text10() {
        return 'level 3 - 2 resolver '
      },
    }
  }
};


const req = {
  text: 1,
  text1: 1,
  nested2: {
    text8: 1
  },
  nested3: {
    text10: 1
  }
}


const reqExecutor = async (reqObj, resObj, res = {}, prefix = '') => {
  for (const key of Object.keys(reqObj)) {
    if (key in resObj) {
      if (typeof resObj[key] === 'function') {
        res[key] = await resObj[key].call(res);
        console.log(prefix + res[key])
      } else if (typeof resObj[key] === 'object') {
        res[key] = resObj[key]
        console.log(prefix + res[key])
      } else {
        res[key] = resObj[key]
        console.log(prefix + res[key])
      }
    }
    if (reqObj[key] && typeof reqObj[key] === 'object') {
      res[key] = await reqExecutor(reqObj[key], res[key], {}, prefix + '\t')
    }
  }

  return res
}

(async () => {
  console.log(JSON.stringify(await reqExecutor(req, nestResolver),0,2))
})().catch(e => console.log(e)).finally(() => process.exit(0))
