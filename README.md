Flashcard Learning App (Individual)

Project Summary

The Flashcard Learning App is a full-stack single-page application (SPA) designed to help users create, manage, and study flashcards efficiently. It includes user authentication, role-based access control (user/admin), live search functionality, and a study tracking system.

The system demonstrates full CRUD operations on multiple entities and follows a modern client-server architecture using Node.js, Express, and MongoDB.



Technical Stack
Frontend
- HTML
- Javascript
- CSS

Backend
- Node.js
- Express.js

Database
- MongoDB
- Mongoose (ODM)

Authentication
- JSON Web Token
- bcrypt (password hashing)

Styling
- Custom CSS

Routing
- Routing is handled using Express REST API endpoints for CRUD operations



Features
- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control (User / Admin)
- Full CRUD functionality (Create, Read, Update, Delete flashcards)
- Simple responsive user interface
- Manage mode
    - Add new flashcards 
    - View all flashcards stored in database
    - Edit existing flashcards (Update)
    - Delete flashcards (Delete)
    - System message when there are no cards
    - Live search bar filtering
- Study mode
    - Flip cards
    - System message when all cards have have been completed
    - System message if there are no cards
    - Mark card as complete
- Admin mode
    - View all registered users
    - View study history of all users



Folder Structure

The project is organised into a public folder, which contains all frontend files including the HTML, JavaScript, and CSS used to build the user interface. The server folder contains all backend-related code and is structured into subfolders with models handling Flashcard, User and StudyHistory, routes handling auth, and middleware managing auth. The root directory also includes the package.json file for managing dependencies and the node_modules folder which is automatically generated when installing packages alongside database exports for flashcards and users.




Setup Instructions

1. Clone the repository
   git clone <repo-link>

2. Install dependencies
   npm install

3. Start MongoDB
   Ensure MongoDB is running locally on:
   mongodb://127.0.0.1:27017/flashcards

4. Run the backend server
   npm start

5. Open the app in browser
   http://localhost:3000

