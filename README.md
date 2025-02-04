# ChatX

ChatX is a real-time chat application that enables seamless communication between users. The project is composed of a backend server running on **port 5000**, a frontend client running on **port 3000**, and a locally hosted **MongoDB** instance on **port 27017**. Additionally, ChatX integrates with the Groq API—make sure to replace the placeholder with your own Groq API key in the frontend.

[ChatX Interface](https://github.com/user-attachments/assets/572a2dea-5661-47ff-933e-e2d7adc28c0a)

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Screenshots](#screenshots)
- [License](#license)
- [Contributing](#contributing)
- [Contact](#contact)

## Features

- **Real-Time Messaging:** Chat with other users instantly.
- **User Authentication:** Secure login/signup with user management.
- **Responsive UI:** A clean and user-friendly interface optimized for all devices.
- **Groq API Integration:** Use Groq API to enhance chat functionalities (requires your own API key).
- **MongoDB Storage:** Persistent data storage using a locally running MongoDB instance.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher)  
  [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or [Yarn](https://yarnpkg.com/)
- **MongoDB** Community Edition (running locally)  
  [Download MongoDB](https://www.mongodb.com/try/download/community)
- **Groq API Key** (obtain your own API key from [Groq](https://groq.com/))

## Installation

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/DIVYANSHKATHURIA/ChatX.git
   ```

2. Navigate to the backend directory:

   ```bash
   cd ChatX/backend
   ```

3. Install backend dependencies:

   ```bash
   npm install
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory and add your **Groq API Key**:

   ```env
   REACT_APP_GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
   ```

   Make sure to replace `YOUR_GROQ_API_KEY_HERE` with your actual API key.

## Configuration

- **Backend Server Port:** `5000`
- **Frontend Client Port:** `3000`
- **MongoDB Port:** `27017` (running locally)
- **Groq API Key:** Set in `frontend/.env` as shown above

## Running the Application

### 1. Start MongoDB

Ensure that MongoDB is running on your machine. If you installed MongoDB locally, you can typically start it with:

```bash
mongod --port 27017
```

### 2. Start the Backend Server

From the `backend` directory, run:

```bash
npm start
```

The backend will be available at: [http://localhost:5000](http://localhost:5000)

### 3. Start the Frontend Client

From the `frontend` directory, run:

```bash
npm start
```

The frontend will be available at: [http://localhost:3000](http://localhost:3000)

## Screenshots

Below is an image showcasing the ChatX interface:

![Screenshot (60)](https://github.com/user-attachments/assets/26583d4a-c019-4cdb-98e4-355c94dc5649)

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you have ideas, bug fixes, or improvements, please open an issue or submit a pull request.

## Contact

For any questions or further assistance, feel free to open an issue on GitHub or reach out directly.

---

Happy chatting with **ChatX**!
