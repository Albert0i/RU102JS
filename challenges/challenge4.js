const getRank = async (siteId) => {
    // START Challenge #4
    const client = redis.getClient();
     
    const result = await client.zrevrankAsync(
      keyGenerator.getCapacityRankingKey(),
      `${siteId}`,
    );
      
    return result;
    // END Challenge #4
  };

/*
The code works as follows:

We use the ZREVRANK command to get the rank of the requested solar site.
ZREVRANK takes two arguments, the name of the key containing the capacity ranking sorted set and the site ID that we want the ranking for.
We use the getCapacityRankingKey function from the key generator utility to get the correct key name.

Finally, the function returns the rank associated with the requested site ID.
You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.
*/