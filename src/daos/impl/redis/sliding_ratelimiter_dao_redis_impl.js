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

  //const transaction = client.multi();
  let result; 
  result = await client.zaddAsync("XXX", currentTimestamp, `${currentTimestamp}-${random}`)
  console.log(`result 1 = ${result}`)
  result = await client.zremrangebyscoreAsync("XXX", 0, currentTimestamp - opts.interval);
  console.log(`result 2 = ${result}`)
  result = await client.zcardAsync("XXX")
  console.log(`result 3 = ${result}`)
  //return -2;
  return result; 
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
