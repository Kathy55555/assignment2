Flashcard Learning App

Project Summary

The Flashcard Learning App is a single-page web application that allows users to create, manage, and study flashcards for revision purposes. Users can add, edit, and delete flashcards in Manage Mode, and switch to Study Mode to review cards interactively by flipping them and marking them as completed.

The application needs Node.js and MongoDB must be installed while the MongoDB service must be running. After installing dependencies with npm install, the server can be started using npm start, and the app will be accessible at http://localhost:3000.

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

Styling
- Custom CSS

Routing
- Routing is handled using Express REST API endpoints for CRUD operations

Features
- Single Page Application behavior (dynamic UI updates without page reload)
- Full CRUD functionality (Create, Read, Update, Delete flashcards)
- Manage mode
    - Add new flashcards 
    - View all flashcards stored in database
    - Edit existing flashcards (Update)
    - Delete flashcards (Delete), 
    - System message when there are no cards
- Study mode
    - Flip cards
    - Progress tracking with remaining cards displayed
    - System message when all cards have have been completed
    - System message if there are no cards
- Simple responsive user interface


Folder Structure
The project follows a clear separation between frontend and backend logic. The root folder flashcard-app/ contains the main project files. Inside the server/ directory, server.js handles the Express server setup and API routing, while the models/Flashcard.js file defines the MongoDB schema using Mongoose. The public/ directory contains all frontend files, including index.html for structure, style.css for styling and layout, and script.js for handling dynamic rendering, mode switching, and CRUD interactions. The README.md file provides documentation.

Challenges Faced

Handling the two interactive modes (Manage and Study) while keeping the UI dynamically updated without reloading the page was challenging, ensuring that the layout remained responsive and the CSS elements were placed correctly on the page even when switching between the mode were challenging. Also, designing the user interface to be clean, intuitive and aesthethic making sure that it was aligned with the assignment requirements was also a key challenge. 


