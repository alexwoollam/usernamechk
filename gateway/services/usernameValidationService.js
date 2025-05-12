import {Filter} from 'bad-words';

const validateLength = (username) => {
  if (username.length < 4 || username.length > 14) {
    throw new Error('Username must be between 4 and 14 characters');
  }
};

const validateOffensiveWords = (username) => {
  const filter = new Filter();
  const badWords = filter.list;

  const normalised = username.toLowerCase().replace(/[^a-z]/g, '');

  for (const word of badWords) {
    if (normalised.includes(word)) {
      throw new Error('Username contains inappropriate language');
    }
  }
};


const validateUsername = (username) => {
  validateLength(username);
  validateOffensiveWords(username);
};

export { validateUsername };
