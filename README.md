# Cricket Score Management Web App

A web application made using Node.js, Express.js, and MongoDB where users can manage their cricket scores. Users can start a match and record the score after the match, with all stats saved for future visibility.

## Features

- **Start a Match**: Users can start a new cricket match.
- **Record Scores**: Users can record the score after each match.
- **View Stats**: Users can view their past match stats.
- **Responsive Design**: Works on both desktop and mobile devices.

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Render

## Prerequisites

- Node.js (v14.x or later)
- MongoDB (v4.x or later)

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/koushik8686/cricket.git
    cd cricket
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following:
    ```env
    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    ```

4. **Run the application**:
    ```bash
    npm start
    ```

5. **Access the application**:
    Open your browser and go to `http://localhost:3000`.

## Deployment

The application is deployed using Render. You can access it [here](https://cricket-hijh.onrender.com/).

## Usage

1. **Start a Match**: Navigate to the "Start Match" page and enter match details.
2. **Record Scores**: After the match, go to the "Record Scores" page and enter the scores.
3. **View Stats**: Visit the "Stats" page to view past match stats.

## API Endpoints

- **Matches**
  - `POST /creatematch`: Start a new match
  - `GET /matches`: Get all matches
  - `GET /matche/:id`: Get a single match by ID
  - `PUT /match/:id/scorecard`: Record score for a match

## Contributing

Feel free to open issues or submit pull requests. We welcome all contributions that improve the app!

## License

This project is licensed under the MIT License.
