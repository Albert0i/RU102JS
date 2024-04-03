const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
    const result = sum(1, 2)
    expect(typeof (result)).toBe('number');

    expect(result).toBe(3);
  }); 

test('adds 1 + 2 to equal 4', () => {
    const result = sum(1, 2)
    expect(typeof (result)).toBe('string');

    expect(result).toBe(4);
});

/*
   jest 
   https://jestjs.io/docs/getting-started

   npm run test sum
*/