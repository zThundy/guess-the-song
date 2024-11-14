const BASE_URL = 'https://localhost';

export function getBase() {
  fetch(`${BASE_URL}`)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
}
