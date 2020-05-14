/**
 * Method to post highlight
 */
const postHighlight = async (url = '', data = {}) => {
  // Default options are marked with *
  console.log("I want to send post");
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

module.exports = {postHighlight};