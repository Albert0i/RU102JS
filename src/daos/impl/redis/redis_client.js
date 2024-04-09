const redis = require('redis');
const bluebird = require('bluebird');
const config = require('better-config');

// Add extra definitions for RedisTimeSeries commands.
redis.addCommand('ts.add'); // redis.ts_addAsync
redis.addCommand('ts.range'); // redis.ts_rangeAsync

// Promisify all the functions exported by node_redis.
bluebird.promisifyAll(redis);

// Create a client and connect to Redis using configuration
// from config.json.
const clientConfig = {
  host: config.get('dataStores.redis.host'),
  port: config.get('dataStores.redis.port'),
};

if (config.get('dataStores.redis.password')) {
  clientConfig.password = config.get('dataStores.redis.password');
}

const client = redis.createClient(clientConfig);

// This is a catch all basic error handler.
client.on('error', error => { 
      console.log(error) 
    });
client.on('ready', () => { 
      //console.log(`Successfully connected to host "${config.get('dataStores.redis.host')}" on port "${config.get('dataStores.redis.port')}"`)
      //console.log('Redis client is ready...')
    } ) 
client.on('end', () => { 
      //console.log('Redis connection is closed.')
    } ) 
client.on('reconnecting', (o) => {
      //console.log('Redis client is reconnecting!')
      //console.log(`Attempt number: ${o.attempt}.`)
      //console.log(`Milliseconds sence last attempt: ${o.delay}.`) 
    } ) 

module.exports = {
  /**
   * Get the application's connected Redis client instance.
   *
   * @returns {Object} - a connected node_redis client instance.
   */
  getClient: () => client,
};
