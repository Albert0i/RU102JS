const insert = async (meterReading) => {
    // Unpack meterReading into array of alternating key
    // names and values for addition to the stream.
    const fields = objectToArray(meterReading);
      
    const client = redis.getClient();
    const pipeline = client.batch();
      
    // START Challenge #6
    pipeline.xadd(keyGenerator.getGlobalFeedKey(), 'MAXLEN', '~', globalMaxFeedLength, '*', ...fields);
    pipeline.xadd(keyGenerator.getFeedKey(meterReading.siteId), 'MAXLEN', '~', siteMaxFeedLength, '*', ...fields);
    // END Challenge #6
      
    await pipeline.execAsync();
  };

/*
The code works as follows:

The helper function objectToArray unpacks the meterReading object into an array of alternating key names and values.
We then get the Redis client instance, and begin a pipeline.
Inside the pipeline, the code makes two calls to the XADD command.
The first adds a new entry to the global feed, trimming the length of the stream to approximately the value of globalMaxFeedLength.
The second adds a new entry to the site specific feed for the site that meterReading is for, trimming the length of that stream to approximately the value of siteMaxFeedLength.
Both calls to XADD use * as the new the stream entry ID. This means that Redis will allocate the new entry a timestamp based ID automatically.
The pipeline is then sent to Redis in a single network round trip.
You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.
*/