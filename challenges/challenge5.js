const findByGeoWithExcessCapacity = async (lat, lng, radius, radiusUnit) => {  
    const client = redis.getClient();
      
    // Create a pipeline to send multiple commands in one round trip.
    const setOperationsPipeline = client.batch();
      
    // Get sites within the radius and store them in a temporary sorted set.
    const sitesInRadiusSortedSetKey = keyGenerator.getTemporaryKey();
      
    setOperationsPipeline.georadiusAsync(
      keyGenerator.getSiteGeoKey(),
      lng,
      lat,
      radius,
      radiusUnit.toLowerCase(),
      'STORE',
      sitesInRadiusSortedSetKey,
    );
      
    // Create a key for a temporary sorted set containing sites that fell
    // within the radius and their current capacities.
    const sitesInRadiusCapacitySortedSetKey = keyGenerator.getTemporaryKey();
      
    // START Challenge #5
    setOperationsPipeline.zinterstore(
      sitesInRadiusCapacitySortedSetKey,
      2,
      sitesInRadiusSortedSetKey,
      keyGenerator.getCapacityRankingKey(),
      'WEIGHTS',
      0,
      1,
    );
    // END Challenge #5
      
    // Expire the temporary sorted sets after 30 seconds, so that we
    // don't leave old keys on the server that we no longer need.
    setOperationsPipeline.expire(sitesInRadiusSortedSetKey, 30);
    setOperationsPipeline.expire(sitesInRadiusCapacitySortedSetKey, 30);
      
    // Execute the set operations commands, we do not need to
    // use the responses.
    await setOperationsPipeline.execAsync();
      
    // Get sites IDs with enough capacity from the temporary
    // sorted set and store them in siteIds.
    const siteIds = await client.zrangebyscoreAsync(
      sitesInRadiusCapacitySortedSetKey,
      capacityThreshold,
      '+inf',
    );
      
    // Populate array with site details, use pipeline for efficiency.
    const siteHashPipeline = client.batch();
      
    for (const siteId of siteIds) {
      const siteKey = keyGenerator.getSiteHashKey(siteId);
      siteHashPipeline.hgetall(siteKey);
    }
      
    const siteHashes = await siteHashPipeline.execAsync();
      
    const sitesWithCapacity = [];
      
    for (const siteHash of siteHashes) {
      // Ensure a result was found before processing it.
      if (siteHash) {
        // Call remap to remap the flat key/value representation
        // from the Redis hash into the site domain object format,
        // and convert any fields that a numerical from the Redis
        // string representations.
        sitesWithCapacity.push(remap(siteHash));
      }
    }
      
    return sitesWithCapacity;
  }; 

/*
The code that you needed to write for this challenge works as follows:

(See code in the above solution between the // START Challenge #5 and // END Challenge #5 comments)
Here, we use the ZINTERSTORE command, passing it the following arguments:
sitesInRadiusCapacitySortedSetKey - a temporary key used to create an interim sorted set to store the results of calling ZINTERSTORE.
2 - the number of arguments to follow that represent the key names of sorted sets to perform the intersection operation on.
sitesInRadiusSortedSetKey - the key name where the sorted set of sites that are in the specified radius are held.
keyGenerator.getCapacityRankingKey() - the key name where the sorted set of sites and their capacities are held.
'WEIGHTS' - indicating that the following two arguments are the weights to use when merging the scores for the sorted sets that are being insersected.
0 - weight used for the first sorted set in the intersection, set to 0 as we don't want the scores from sitesInRadiusSortedSetKey.
1 - weight used for the second sorted set in the intersection, set to 1 as we want to keep the scores relating to site capacity unchanged from the site capacity sorted set.
You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.
*/