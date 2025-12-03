// Predefined users for the chat application
export const predefinedUsers = [
  // Existing users
  {
    id: "ronit63",
    name: "Ronit Sharma",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "online"
  },
  {
    id: "priya_patel",
    name: "Priya Patel",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "online"
  },
  // New users
  {
    id: "ananya_dev",
    name: "Ananya Gupta",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    status: "online"
  },
  {
    id: "arjun_designer",
    name: "Arjun Singh",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "away"
  },
  {
    id: "kavya_pm",
    name: "Kavya Reddy",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "online"
  },
  {
    id: "deepika_qa",
    name: "Deepika Joshi",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "busy"
  },
  {
    id: "vikram_backend",
    name: "Vikram Kumar",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    status: "online"
  },
  {
    id: "sneha_mobile",
    name: "Sneha Agarwal",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    status: "online"
  },
  {
    id: "rahul_devops",
    name: "Rahul Mehta",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    status: "away"
  },
  {
    id: "ishita_ux",
    name: "Ishita Verma",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "online"
  },
  {
    id: "amit_sales",
    name: "Amit Sharma",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "online"
  },
  {
    id: "neha_hr",
    name: "Neha Kapoor",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    status: "away"
  },
  {
    id: "karan_finance",
    name: "Karan Malhotra",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    status: "busy"
  },
  {
    id: "pooja_marketing",
    name: "Pooja Jain",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    status: "online"
  },
  {
    id: "rohit_support",
    name: "Rohit Gupta",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    status: "online"
  }
];

// Helper function to get user by ID
export const getUserById = (userId) => {
  return predefinedUsers.find(user => user.id === userId);
};

// Helper function to get all online users
export const getOnlineUsers = () => {
  return predefinedUsers.filter(user => user.status === "online");
};

// Helper function to get random user (for testing)
export const getRandomUser = () => {
  const randomIndex = Math.floor(Math.random() * predefinedUsers.length);
  return predefinedUsers[randomIndex];
};