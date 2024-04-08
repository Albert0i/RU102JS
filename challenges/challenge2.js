const insertMetric = async (siteId, metricValue, metricName, timestamp) => {
    const client = redis.getClient();
      
    const metricKey = keyGenerator.getDayMetricKey(siteId, metricName, timestamp);
    const minuteOfDay = timeUtils.getMinuteOfDay(timestamp);
      
    // START Challenge #2
      
    await client.zaddAsync(metricKey, minuteOfDay, formatMeasurementMinute(metricValue, minuteOfDay));
    await client.expireAsync(metricKey, metricExpirationSeconds);
      
    // END Challenge #2
  };

  /*
    The code works as follows:

    The first three lines were provided for you, and get the Redis client instance plus the name of the Redis key to be used for the metric, and the minute of the day.
    The ZADD command then adds an entry to the sorted set whose key is metricKey. The score added is the minute of the day, and the value is the string <value>:<minuteOfDay>.
    Recall that we have to store the value in the sorted set with the minute of day suffix to avoid duplicate values for the same day overwriting each other.
    Finally, we use EXPIRE to remove the sorted set at the point at which the application no longer requires access to it.
    Note that you can also use a pipeline to send both of these commands to Redis in a single round trip.
    You can find a copy of this solution on the "solutions" branch in the course GitHub repo, or in the "solutions" folder in the Docker container.
  
  */