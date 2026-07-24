fetch('https://api.github.com/gists/public')
  .then(res => res.json())
  .then(data => console.log(data[0].files[Object.keys(data[0].files)[0]].raw_url))
  .catch(console.error);
