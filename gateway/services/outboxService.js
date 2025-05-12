import { pool } from './dbConnection.js';
import { v4 as uuidv4 } from 'uuid';

export const saveToOutbox = async (topic, payload, sent = false) => {

  const id = uuidv4();

  const query = `
    INSERT INTO outbox (id, topic, payload, sent, sent_datetime)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const values = [
    id,
    topic,
    payload,
    false,
    new Date()
  ];

  await pool.query(query, values);

  return id;
};
