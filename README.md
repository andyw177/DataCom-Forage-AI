# Kudos App

This is a greenfield Node + React implementation of the Task 2 Kudos system.

## Structure

- `client/`: React + Vite frontend
- `server/`: Express API with seeded users and in-memory kudos storage

## Run Locally

1. Install dependencies:
   - `npm.cmd install --prefix "Task 2/server"`
   - `npm.cmd install --prefix "Task 2/client"`
2. Start the API:
   - `npm.cmd run dev --prefix "Task 2/server"`
3. Start the frontend in a second terminal:
   - `npm.cmd run dev --prefix "Task 2/client"`
4. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Demo Notes

- The app seeds a small set of users, including an admin.
- Use the "Signed in as" control in the UI to switch between a regular employee and an admin.
- Data is stored in memory for this exercise, so restarting the server resets the sample data.

https://github.com/andyw177/DataCom-Forage-AI
