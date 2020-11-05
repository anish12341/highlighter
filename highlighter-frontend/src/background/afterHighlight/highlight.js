/**
 * Method to post highlight
 */
const postHighlight = async (url = '', data = {}, accesstoken = '') => {
  // Default options are marked with *
  console.log("I want to send post", data);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `bearer ${accesstoken}`
    },
    body: JSON.stringify(data)
  });
  let resJson = await response.json();
  console.log("I want to send post::", resJson);
  return resJson;
};

module.exports = {postHighlight};