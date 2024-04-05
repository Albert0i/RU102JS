
const findAll = async () => {
    // START CHALLENGE #1
    const client = redis.getClient();
      
    const siteIds = await client.smembersAsync(keyGenerator.getSiteIDsKey());
    const sites = [];
      
    for (const siteId of siteIds) {
      const siteHash = await client.hgetallAsync(siteId);
      
      if (siteHash) {
        // Call remap to remap the flat key/value representation
        // from the Redis hash into the site domain object format,
        // and convert any fields that a numerical from the Redis
        // string representations.
        sites.push(remap(siteHash));
      }
    }
      
    return sites;
    // END CHALLENGE #1
  };

  /*
    The code works as follows:

    First, get the Redis client instance.
    Then use the SMEMBERS command to get all members of the set that stores the solar site IDs.
    Next, loop over the solar site IDs, getting the site details for each from the Redis hash that it is stored in, using the HGETALL command.
    Finally, use the remap() helper function to create a correctly formatted site object, adding it to the array of sites to return.
    You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.   
  */