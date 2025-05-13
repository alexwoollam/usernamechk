import pool from '../../services/dbConnection.js';

jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({
        release: jest.fn(),
        query: jest.fn().mockResolvedValue({ rows: [] }),
      }),
    })),
  };
});

describe('Database pool', () => {
  it('should create a pool with correct configuration', () => {
    expect(pool).toBeDefined();
    expect(pool.connect).toBeDefined();
    expect(pool.connect).toHaveBeenCalledTimes(0);
  });

  it('should successfully connect and query', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users');
    expect(client.query).toHaveBeenCalledWith('SELECT * FROM users');
    expect(result).toEqual({ rows: [] });
  });

  it('should handle connection release', async () => {
    const client = await pool.connect();
    await client.release();
    expect(client.release).toHaveBeenCalled();
  });
});
