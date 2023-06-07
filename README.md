Wood background from http://www.pixeden.com/graphic-web-backgrounds/wood-pattern-background
-not attribution required

# Photo-tagging-game
"Where's waldo" with 15th-16th century paintings by Hieronymous Bosch and Pieter Bruegel.

# Skills honed in creation:
- cursor tracking
- React-router-dom
  - Forms
  - actions
  - loaders
  - Links
- FIREBASE integration (firestore and authentication)
  - rules
  - user information storage
  - leaderboard management

# Highlights:
The biggest achievement of this project, in my opinion, is the use of Firebase.
While keeping a timer on the backend was part of the Ruby on Rails version of
this project for the Odin Project, it was not a part of the Javascript curriculum.
However, I did not want to make it too easy for users to litter the leaderboards
with their hacked scores. A timestamp is recorded to firebase at the start of a
game and at the end of it. The frontend time is then compared with the timestamps.
The rules coded in firebase console prevent tampering.

Additionally, I took authentication relatively seriously. Users are signed in
anonymously from the start. Their times are saved under that anonymous user id.
If they wish to be featured on the leaderboard, they need to sign up using either
the google pop-up, or manually enter their email and password. This will upgrade
their temporary anonymous account and transfer any scores, if present.

Through the email route, a verification email is sent. Users are redirected to
the account page where a verification button will be present depending on their
status. Once the link in the verification email is clicked, they can click the
'verify' button to complete the process. This triggers an evaluation of their
scores and updates the leaderboards if scores are eligible. Going the google
route will automatically register the email as verified and update leaderboards
accordingly.

# Firestore rules:
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {

  match /paintings/{painting} {
  allow read;
  }

  match /leaderboards/{leaderboard} {

    // with function in app to post scores once verified,
    // this prevents hacks to repeatedly repost.
    // iteration methods not available in firebase rules
    // tallying method allows edits of userName and photo
    function userScoreDuplicate() {
      let scores = request.resource.data.leaderboard;
      let id = request.auth.uid;
      return ((
        (scores[0].uid == id ? 1 : 0) +
        (scores[1].uid == id ? 1 : 0) +
        (scores[2].uid == id ? 1 : 0) +
        (scores[3].uid == id ? 1 : 0) +
        (scores[4].uid == id ? 1 : 0) +
        (scores[5].uid == id ? 1 : 0) +
        (scores[6].uid == id ? 1 : 0) +
        (scores[7].uid == id ? 1 : 0) +
        (scores[8].uid == id ? 1 : 0) +
        (scores[9].uid == id ? 1 : 0) +
        (scores[10].uid == id ? 1 : 0) +
        (scores[11].uid == id ? 1 : 0) +
        (scores[12].uid == id ? 1 : 0) +
        (scores[13].uid == id ? 1 : 0) +
        (scores[14].uid == id ? 1 : 0)
        ) > 1);
    }
    function scoreMatch() {
      let userData = get(/databases/$(database)/documents/users/$(request.auth.uid)/paintings/$(leaderboard)).data;
      let userMs = userData.end.toMillis() - userData.start.toMillis();
      let secondsMatch = ((userMs - userData.frontTime) < 8000) && ((userMs - userData.frontTime) < 8000);
      return userData.frontTime < resource.data.leaderboard[14].ms && secondsMatch;
    }
    allow read;
    allow update: if request.auth != null && request.auth.token.firebase.sign_in_provider != 'anonymous' && request.auth.token.email_verified && scoreMatch() && !userScoreDuplicate();
  }

  match /users/{userId} {
    allow read;
    allow write: if request.auth != null && request.auth.uid == userId && request.auth.token.firebase.sign_in_provider != 'anonymous';
    match /paintings/{paintingId} {
      function hasConcluded(){
        return resource.data.keys().hasAny(["end", "frontTime"])
      }
      allow read, create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId && !hasConcluded();
    }
  }
}
}
