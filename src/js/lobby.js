import "../css/style.css";
import { v4 as uuidv4 } from 'uuid';

let form = document.getElementById('lobby__form');

let displayName = sessionStorage.getItem('display_name')

if (displayName) {
  form.name.value = displayName;
}

console.log("first")

form.addEventListener('submit', (e) => {
  console.log("here")
  e.preventDefault();

  sessionStorage.setItem('display_name', e.target.name.value)

  let inviteCode = e.target.room.value;
  if (!inviteCode) {
    inviteCode = uuidv4();
  }
  window.location = `index.html?room=${inviteCode}`;
})