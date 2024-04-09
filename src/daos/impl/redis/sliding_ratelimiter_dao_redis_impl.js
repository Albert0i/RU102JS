const redis = require('./redis_client');
/* eslint-disable no-unused-vars */
const keyGenerator = require('./redis_key_generator');
const timeUtils = require('../../../utils/time_utils');

/* eslint-enable */

/* eslint-disable no-unused-vars */

// Challenge 7
const hitSlidingWindow = async (name, opts) => {
  const client = redis.getClient();

  // START Challenge #7 (2024/04/10)    
  // [limiter]:[windowSize]:[name]:[maxHits]
  const key = keyGenerator.getRateLimiterKey2(name, opts.interval, opts.maxHits);
  // key = test:ratelimiter_dao_redis_impl:limiter:10000:testresource:5
  //console.log(`key = ${key}`)  
  const currentTimestamp = Date.now();
  //console.log('Current timestamp:', currentTimestamp);
  const random = Math.floor(Math.random() * 1000) + 1;
  //console.log('random: ', random)

  // *** single step non-transaction version  *** 
  let result; 
  result = await client.zaddAsync(key, currentTimestamp, `${currentTimestamp}-${random}`)
  //console.log(`result 1 = ${result}`)
  result = await client.zremrangebyscoreAsync(key, 0, currentTimestamp - opts.interval);
  //console.log(`result 2 = ${result}`)
  result = await client.zcardAsync(key)  
  const hits = parseInt(result, 10)
  //console.log(`hits = ${hits}`)
  let hitsRemaining;

  if (hits > opts.maxHits) {
    // Too many hits.
    hitsRemaining = -1;
  } else {
    // Return number of hits remaining.
    hitsRemaining = opts.maxHits - hits;
  }
  // *** transaction version  *** 
  


  return hitsRemaining;
  //return -2;
  // END Challenge #7 (2024/04/10)
};

/* eslint-enable */

module.exports = {
  /**
   * Record a hit against a unique resource that is being
   * rate limited.  Will return 0 when the resource has hit
   * the rate limit.
   * @param {string} name - the unique name of the resource.
   * @param {Object} opts - object containing interval and maxHits details:
   *   {
   *     interval: 1,
   *     maxHits: 5
   *   }
   * @returns {Promise} - Promise that resolves to number of hits remaining,
   *   or 0 if the rate limit has been exceeded..
   */
  hit: hitSlidingWindow,
};
