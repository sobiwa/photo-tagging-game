export default async function badWordsFilter(word) {
  // reached 85% quota 6/5/23
  return {'is-bad': false};
  const url =
    'https://neutrinoapi-bad-word-filter.p.rapidapi.com/bad-word-filter';
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': '5087ffc473mshbd965013183e0ccp1cf14ejsn3d235548f95a',
      'X-RapidAPI-Host': 'neutrinoapi-bad-word-filter.p.rapidapi.com',
    },
    body: new URLSearchParams({
      content: word
    }),
  };
  const response = await fetch(url, options);
  const result = await response.json();
  return result;
}
