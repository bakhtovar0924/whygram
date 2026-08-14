# Project Structure

```
whygram.com/
├── dist
│   ├── assets
│   │   ├── Chat-COYeF3aD.js
│   │   ├── FollowButton-De8hTytt.js
│   │   ├── Home-CEAea-5l.js
│   │   ├── index-CiVx8DqF.js
│   │   ├── index-DnH6bOab.css
│   │   ├── Login-lX7Px9H3.js
│   │   ├── Profile-YF-BYge1.js
│   │   ├── Reels-sXu4HFSr.js
│   │   ├── Register-C5p3N3S5.js
│   │   ├── Settings-BZvd_vEE.js
│   │   ├── TextField-BxXPmWVh.js
│   │   ├── Top-gmCS-Pwl.js
│   │   └── usersApi-CwMkZY2j.js
│   └── index.html
├── server
│   └── db.json
├── src
│   ├── app
│   │   ├── App.jsx
│   │   └── store.js
│   ├── entities
│   │   ├── message
│   │   │   └── messagesApi.js
│   │   ├── post
│   │   │   └── postsApi.js
│   │   └── user
│   │       └── usersApi.js
│   ├── features
│   │   ├── auth
│   │   │   ├── authApi.js
│   │   │   ├── AuthContext.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── chat
│   │   │   └── useConversations.js
│   │   ├── feed
│   │   │   └── useFeed.js
│   │   ├── follow
│   │   │   ├── ui
│   │   │   │   └── FollowButton.jsx
│   │   │   └── followsApi.js
│   │   ├── settings
│   │   │   └── settingsApi.js
│   │   └── theme
│   │       └── themeSlice.js
│   ├── pages
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── Login.jsx
│   │   │   └── register
│   │   │       └── Register.jsx
│   │   ├── chat
│   │   │   └── Chat.jsx
│   │   ├── home
│   │   │   └── Home.jsx
│   │   ├── profile
│   │   │   └── Profile.jsx
│   │   ├── reels
│   │   │   └── Reels.jsx
│   │   ├── settings
│   │   │   └── Settings.jsx
│   │   └── top
│   │       └── Top.jsx
│   ├── shared
│   │   ├── api
│   │   │   └── axios.js
│   │   ├── config
│   │   │   └── appConfig.js
│   │   ├── lib
│   │   │   ├── compressMedia.js
│   │   │   ├── formatCount.js
│   │   │   ├── fuzzy.js
│   │   │   ├── groupStories.js
│   │   │   └── readFileAsDataURL.js
│   │   └── ui
│   │       └── Avatar.jsx
│   ├── widgets
│   │   ├── chat
│   │   │   ├── chat-list
│   │   │   │   └── ChatList.jsx
│   │   │   ├── chat-thread
│   │   │   │   └── ChatThread.jsx
│   │   │   └── chat-window
│   │   │       └── ChatWindow.jsx
│   │   ├── layout
│   │   │   └── Layout.jsx
│   │   ├── posts
│   │   │   ├── comments-modal
│   │   │   │   └── CommentsModal.jsx
│   │   │   └── post-card
│   │   │       └── PostCard.jsx
│   │   ├── profile
│   │   │   ├── lib
│   │   │   │   └── formatProfileCount.js
│   │   │   ├── profile-grid
│   │   │   │   └── ProfileGrid.jsx
│   │   │   ├── profile-header
│   │   │   │   └── ProfileHeader.jsx
│   │   │   ├── profile-highlights
│   │   │   │   └── ProfileHighlights.jsx
│   │   │   └── profile-viewer
│   │   │       └── ProfileViewer.jsx
│   │   ├── reels
│   │   │   └── reel-card
│   │   │       └── ReelCard.jsx
│   │   ├── settings
│   │   │   ├── lib
│   │   │   │   └── fieldClass.js
│   │   │   ├── privacy-settings
│   │   │   │   └── PrivacySettings.jsx
│   │   │   └── profile-settings
│   │   │       └── ProfileSettings.jsx
│   │   └── stories
│   │       ├── add-story-modal
│   │       │   └── AddStoryModal.jsx
│   │       ├── stories-bar
│   │       │   └── StoriesBar.jsx
│   │       └── story-viewer
│   │           └── StoryViewer.jsx
│   ├── index.css
│   └── main.jsx
├── codebundle.md
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── vite.config.js
└── whygram.com.7z
```
