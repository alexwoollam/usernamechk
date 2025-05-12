import redis from 'redis';

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

client.on('error', (err) => console.error('Redis Client Error:', err));

client.connect().catch((err) => {
  console.error('Error connecting to Redis:', err);
});

function isValidJson(data) {
  try {
    if (typeof data === 'string') {
      JSON.parse(data);
    }
    return typeof data === 'object' && data !== null;
  } catch (e) {
    return false;
  }
}

export const cacheMiddleware = (expireTime = 60) => async (req, res, next) => {
  let cacheKey = `${req.method}:${req.originalUrl}`;

  if (req.method === 'POST' || req.method === 'PUT') {
    cacheKey += `:${JSON.stringify(req.body)}`;
  }

  console.log('Cache middleware with key:', cacheKey);

  try {
    const data = await client.get(cacheKey);
    if (data) {
      res.set('X-Cache', 'HIT');
      const response_data = JSON.parse(JSON.parse(data));
      if (isValidJson(response_data)) {
        res.set('Content-Type', 'application/json');
        console.log('Cache HIT', response_data);
        return res.json(response_data);
      } else {
        console.log('Cache data is not valid JSON:', response_data);
      }
    }

    res.set('X-Cache', 'MISS');
    console.log('Cache MISS');

    const originalSend = res.send;
    res.send = async (body) => {
      const bodyToCache = JSON.stringify(body);

      await client.set(cacheKey, bodyToCache, {
        EX: expireTime,
      });

      originalSend.call(res, body);
    };

    next();

  } catch (err) {
    console.error('Error fetching cache:', err);
    next(); 
  }
};
