export const videos = [
  {
    id: 1,
    url: "https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-camera-on-a-running-track-32807-large.mp4",
    author: {
      name: "sarah_fitness",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true
    },
    caption: "Morning run vibes! 🏃‍♀️✨ #fitness #morning #running",
    music: "Original Sound - sarah_fitness",
    likes: 45200,
    comments: 342,
    shares: 1205,
    commentList: [
      { id: 1, author: "john_doe", avatar: "https://i.pravatar.cc/150?img=2", text: "Amazing energy! 🔥", likes: 234 },
      { id: 2, author: "fitness_guru", avatar: "https://i.pravatar.cc/150?img=3", text: "What time do you usually run?", likes: 56 },
      { id: 3, author: "runner_99", avatar: "https://i.pravatar.cc/150?img=4", text: "Goals! 💪", likes: 89 }
    ]
  },
  {
    id: 2,
    url: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
    author: {
      name: "neon_vibes",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false
    },
    caption: "City lights and late nights 🌃✨ #neon #nightlife #aesthetic",
    music: "Neon Lights - Synthwave Mix",
    likes: 89100,
    comments: 567,
    shares: 3400,
    commentList: [
      { id: 1, author: "night_owl", avatar: "https://i.pravatar.cc/150?img=6", text: "This aesthetic is everything 😍", likes: 445 },
      { id: 2, author: "photographer_jane", avatar: "https://i.pravatar.cc/150?img=7", text: "Where is this location?", likes: 123 },
      { id: 3, author: "cyber_punk", avatar: "https://i.pravatar.cc/150?img=8", text: "Blade Runner vibes!", likes: 67 }
    ]
  },
  {
    id: 3,
    url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
    author: {
      name: "ocean_dreams",
      avatar: "https://i.pravatar.cc/150?img=9",
      verified: true
    },
    caption: "Peaceful waves 🌊 #ocean #relax #nature",
    music: "Ocean Waves - Nature Sounds",
    likes: 123500,
    comments: 890,
    shares: 5600,
    commentList: [
      { id: 1, author: "beach_lover", avatar: "https://i.pravatar.cc/150?img=10", text: "So relaxing to watch 🌊", likes: 567 },
      { id: 2, author: "surfer_dude", avatar: "https://i.pravatar.cc/150?img=11", text: "Take me back to summer!", likes: 234 },
      { id: 3, author: "meditation_daily", avatar: "https://i.pravatar.cc/150?img=12", text: "Perfect for my morning meditation", likes: 189 }
    ]
  },
  {
    id: 4,
    url: "https://assets.mixkit.co/videos/preview/mixkit-dancer-on-a-dark-background-under-blue-light-1238-large.mp4",
    author: {
      name: "dance_queen",
      avatar: "https://i.pravatar.cc/150?img=13",
      verified: true
    },
    caption: "Dance like nobody's watching 💃 #dance #freestyle #expression",
    music: "Midnight Dancer - Electro Pop",
    likes: 67800,
    comments: 423,
    shares: 2100,
    commentList: [
      { id: 1, author: "dance_fan", avatar: "https://i.pravatar.cc/150?img=14", text: "Your moves are incredible! 🔥", likes: 334 },
      { id: 2, author: "choreo_master", avatar: "https://i.pravatar.cc/150?img=15", text: "Did you choreograph this yourself?", likes: 89 },
      { id: 3, author: "music_lover", avatar: "https://i.pravatar.cc/150?img=16", text: "Song name please? 🎵", likes: 156 }
    ]
  },
  {
    id: 5,
    url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4",
    author: {
      name: "city_explorer",
      avatar: "https://i.pravatar.cc/150?img=17",
      verified: false
    },
    caption: "The city never sleeps 🌆 #citylife #night #drone",
    music: "Urban Dreams - LoFi Hip Hop",
    likes: 94500,
    comments: 678,
    shares: 4200,
    commentList: [
      { id: 1, author: "drone_pilot", avatar: "https://i.pravatar.cc/150?img=18", text: "What drone do you use?", likes: 234 },
      { id: 2, author: "night_crawler", avatar: "https://i.pravatar.cc/150?img=19", text: "This is mesmerizing 😍", likes: 567 },
      { id: 3, author: "urban_photog", avatar: "https://i.pravatar.cc/150?img=20", text: "Perfect shot!", likes: 123 }
    ]
  }
];

export const currentUser = {
  name: "Your Name",
  handle: "@username",
  avatar: "https://i.pravatar.cc/150?img=33",
  bio: "✨ Creating content that inspires\n📍 Paris, France\n🔗 linktr.ee/username",
  followers: 12500,
  following: 450,
  likes: 89000,
  videos: [
    { id: 1, thumbnail: "https://picsum.photos/200/300?random=1", views: 12000 },
    { id: 2, thumbnail: "https://picsum.photos/200/300?random=2", views: 8500 },
    { id: 3, thumbnail: "https://picsum.photos/200/300?random=3", views: 23000 },
    { id: 4, thumbnail: "https://picsum.photos/200/300?random=4", views: 5600 },
    { id: 5, thumbnail: "https://picsum.photos/200/300?random=5", views: 18900 },
    { id: 6, thumbnail: "https://picsum.photos/200/300?random=6", views: 9200 }
  ]
};
