import { expect } from 'chai';
import 'mocha';
import NocoCache from './NocoCache';

describe('Memcache test', function() {
  before(function() {
    NocoCache.init({ driver: 'memory' });
  });

  it('Search pattern', async function() {
    await NocoCache.set('a', 1);
    await NocoCache.set('a1', 2);
    await NocoCache.set('a2', 3);
    await NocoCache.set('a3', 4);
    await NocoCache.set('b1', 5);
    await NocoCache.set('123', 5);
    await NocoCache.set('1223', 5);

    expect(await NocoCache.getAll('a*')).to.have.lengthOf(4);
    expect(await NocoCache.getAll('*1')).to.have.lengthOf(2);
    expect(await NocoCache.getAll('1*3')).to.have.lengthOf(2);
  });
});
