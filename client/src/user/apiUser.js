
export const getUser = (userId) => {
  return fetch('/user/' + userId)
    .then(
       response => response.json()
    );
}

export const editPhoto = (photo) => {
  return fetch('/user/editPhoto', {
	  method: 'PUT',
	  headers: {
        Accept: 'application/json',
      },
      body: photo
  }).then(response => response.json());
}

export const getUsers = () => {
  return fetch('/user/users')
    .then(response => response.json());
}

export const follow = (userId) => {
  return fetch('/user/follow', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userId}),
  }).then(response => response.json());
}

export const unfollow = (userId) => {
  return fetch('/user/unfollow', {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({userId})
  }).then(response => response.json());
}

export const getFollowing = (userId) => {
  return fetch(`/user/${userId}/following`)
    .then(response => response.json());
}

export const getFollowers = (userId) => {
  return fetch(`/user/${userId}/followers`)
    .then(response => response.json());
}