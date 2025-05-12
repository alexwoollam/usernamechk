const express = require('express');
const redis = require('redis');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 80;

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());

const generateAlternativeUsernames = async (username) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates creative and unique alternative usernames based on the original one.',
        },
        {
          role: 'user',
          content: `Generate 3 creative alternative usernames for "${username}" that are unique, funny, catchy and child friendly.`,
        },
      ],
    });

    const alternatives = response.choices[0].message.content
      .split('\n')
      .map(item => item.trim().replace(/^\d+\.\s*/, ''))
      .filter(Boolean);

      console.log('Alts: ', alternatives);

    return alternatives;
  } catch (error) {
    console.error('Error generating alternatives:', error);
    return [];
  }
};

const startServer = async () => {
  try {
    client.on('error', err => console.error('Redis Client Error', err));
    await client.connect();

    app.post('/generate-username-alternatives', async (req, res) => {
      const { username } = req.body;

      if (!username) {
        return res.status(400).send({ message: 'Username is required.' });
      }

      try {
        const cached = await client.get(`username:${username}:alternatives`);
        if (cached) {
          return res.status(200).send({
            username,
            alternative_usernames: JSON.parse(cached),
            check_type: 'from_cache',
          });
        }

        const alternatives = await generateAlternativeUsernames(username);

        await client.setEx(`username:${username}:alternatives`, 3600, JSON.stringify(alternatives));

        return res.status(200).send({
          username,
          alternative_usernames: alternatives,
          check_type: 'generated',
        });
      } catch (err) {
        console.error('Redis or OpenAI error:', err);
        return res.status(500).send({ message: 'Server error.' });
      }
    });

    app.listen(port, () => {
      console.log(`Username check service is running on port ${port}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
