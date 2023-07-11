import "../css/style.css"

import { v4 as uuidv4 } from 'uuid';
import AgoraRTC from "agora-rtc-sdk-ng"

const APP_ID = '82056f48886c478888445f2a538e535b'; /* insert Agora.io app id here */

// ...........................................
// ................room-rtc.js................
// ...........................................

let token = null;
let client;

//room.html?room=234
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if (!roomId) {
  roomId = 'main';
}

let displayName = sessionStorage.getItem('display_name');

if (!displayName) {
  window.location.href = "lobby.html";
  console.log("here")
}

let localTracks = [];
let remoteUsers = {};

let spotlight = document.getElementById("stream__box");

let joinRoomInit = async () => {
  client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  await client.join(APP_ID, roomId, token, uid);

  client.on('user-published', handleUserPublished);
  client.on('user-left', handleUserLeft);

  joinStream();
};

let joinStream = async () => {
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
    encoderConfig: {
      width: { min: 640, ideal: 3840, max: 3840 },
      height: { min: 480, ideal: 2160, max: 2160 }
    }
  });

  let player = `<div class="video__container" id="user-container-${uid}">
                  <div class="video-player" id="user-${uid}"></div>
                </div>`

  document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
  document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);

  localTracks[1].play(`user-${uid}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserPublished = async (user, mediaType) => {
  remoteUsers[user.uid] = user;

  await client.subscribe(user, mediaType);

  let player = document.getElementById(`user-container-${user.uid}`);

  if (player === null) {
    player = `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
              </div>`;
    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
    document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame);

  }

  if (spotlight.style.display) {
    let videoFrame = document.getElementById(`user-container-${user.uid}`)
    videoFrame.style.height = `${screen.width * 0.2}px`;
    videoFrame.style.width = `${screen.width * 0.2}px`;
  }

  if (mediaType === 'video') {
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();

  const isUser = isSpotlightUser(`user-container-${user.uid}`);

  if (isUser) {
    spotlight.style.display = null;

    let videoFrames = document.getElementsByClassName('video__container');
    for (let i = 0; videoFrames.length > i; i++) {
      videoFrames[i].style.height = `${screen.width * 0.3}px`;
      videoFrames[i].style.width = `${screen.width * 0.3}px`;
    }
  }
};

let toggleCamera = async (e) => {
  let button = e.currentTarget;

  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    button.classList.add("active")
  } else {
    await localTracks[1].setMuted(true);
    button.classList.remove("active")
  }
};

let toggleMic = async (e) => {
  let button = e.currentTarget;

  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    button.classList.add("active")
  } else {
    await localTracks[0].setMuted(true);
    button.classList.remove("active")
  }
};

document.getElementById("camera-btn").addEventListener("click", toggleCamera);
document.getElementById("mic-btn").addEventListener("click", toggleMic);

// ...........................................
// .................room.js...................
// ...........................................

let uid = sessionStorage.getItem('uid');
if (!uid) {
  uid = uuidv4();
  sessionStorage.setItem('uid', uid);
}

// let messagesContainer = document.getElementById('messages');
// messagesContainer.scrollTop = messagesContainer.scrollHeight;

const memberContainer = document.getElementById('members__container');
const memberButton = document.getElementById('members__button');

const chatContainer = document.getElementById('messages__container');
const chatButton = document.getElementById('chat__button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
  if (activeMemberContainer) {
    memberContainer.style.display = 'none';
  } else {
    memberContainer.style.display = 'block';
  }

  activeMemberContainer = !activeMemberContainer;
});

let activeChatContainer = false;

chatButton.addEventListener('click', () => {
  if (activeChatContainer) {
    chatContainer.style.display = 'none';
  } else {
    chatContainer.style.display = 'block';
  }

  activeChatContainer = !activeChatContainer;
});

let videoFrames = document.getElementsByClassName('video__container');
let spotlightUser = null;

export let expandVideoFrame = (e) => {

  let child = spotlight.children[0];
  if (child) {
    document.getElementById('streams__container').appendChild(child);
  }

  spotlight.style.display = 'block';
  spotlight.appendChild(e.currentTarget)
  spotlightUser = e.currentTarget.id

  for (let i = 0; videoFrames.length > i; i++) {

    if (videoFrames[i].id != spotlightUser) {
      videoFrames[i].style.height = `${screen.width * 0.2}px`;
      videoFrames[i].style.width = `${screen.width * 0.2}px`;
    }
  }
}

export const isSpotlightUser = (userId) => {
  return spotlightUser === userId;
}

for (let i = 0; videoFrames.length > i; i++) {
  videoFrames[i].addEventListener('click', expandVideoFrame);
}

let hideSpotlight = () => {
  spotlightUser = null;
  spotlight.style.display = null;

  let child = spotlight.children[0];
  document.getElementById('streams__container').appendChild(child);

  for (let i = 0; videoFrames.length > i; i++) {
    videoFrames[i].style.height = `${screen.width * 0.3}px`;
    videoFrames[i].style.width = `${screen.width * 0.3}px`;
  }
}

spotlight.addEventListener('click', hideSpotlight);

joinRoomInit();