const findAll = async () => {
    const client = redis.getClient();
  
    const siteIds = await client.zrangeAsync(keyGenerator.getSiteGeoKey(), 0, -1);
    const sites = [];
  
    // OPTIONAL BONUS CHALLENGE: Optimize with a pipeline.
    if (siteIds.length > 0) {
      const pipeline = client.batch();
  
      for (const siteId of siteIds) {
        pipeline.hgetall(keyGenerator.getSiteHashKey(siteId));
      }
  
      // Get all of the site hashes in a single round trip.
      const siteHashes = await pipeline.execAsync();
  
      for (const siteHash of siteHashes) {
        // Call remap to remap the flat key/value representation
        // from the Redis hash into the site domain object format.
        sites.push(remap(siteHash));
      }
    }
    // END OPTIONAL BONUS CHALLENGE
    return sites;
  };

/*
The code works as follows:

First we get the Redis client and use that to run ZRANGE to get all of the site ID values. This code is unchanged.
If any site IDs are returned, we then take the following steps to optimize our need to call HGETALL against many keys:
Start a pipeline with client.batch()
For each site ID returned, add a call to HGETALL for that site ID in the pipeline.
Call execAsync on the pipeline to get an array of all the HGETALL responses back in a single network round trip to Redis.
As before, add the site hash values to the sites array, using the remap helper function to format the objects correctly.
You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.   
*/  