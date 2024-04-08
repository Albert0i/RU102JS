const updateOptimized = async (meterReading) => {
    const client = redis.getClient();
    const key = keyGenerator.getSiteStatsKey(meterReading.siteId, meterReading.dateTime);
      
    // Load script if needed, uses cached SHA if already loaded.
    await compareAndUpdateScript.load();
      
    // START Challenge #3
    const transaction = client.multi();
      
    transaction.hset(key, 'lastReportingTime', timeUtils.getCurrentTimestamp());
    transaction.hincrby(key, 'meterReadingCount', 1);
    transaction.expire(key, weekSeconds);
      
    transaction.evalsha(compareAndUpdateScript.updateIfGreater(key, 'maxWhGenerated', meterReading.whGenerated));
    transaction.evalsha(compareAndUpdateScript.updateIfLess(key, 'minWhGenerated', meterReading.whGenerated));
    transaction.evalsha(compareAndUpdateScript.updateIfGreater(key, 'maxCapacity', meterReading.whGenerated - meterReading.whUsed));
      
    await transaction.execAsync();
    // END Challenge #3
  };

  /*
    The code works as follows:

    First, we begin a Redis transaction.
    As part of the transaction, we use the same HSET, HINCRBY and EXPIRE commands that were in the updateBasic implementation.
    The if statements from updateBasic that get, compare and set values from the Redis hashes used to store stats have been replaced with calls to the Lua script contained in the file compare_and_update_script.js.
    These compare and set operations are now performed atomically on the Redis server, removing the race condition.
    Finally, we call EXEC on the transaction to send all of the commands to Redis at once, minimizing network overhead.
    You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.
  
  */