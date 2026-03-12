# Face Swap Live

## Monorepo Run Instructions

To run the monorepo application, follow the instructions below:

1. Make sure you have the required dependencies installed for both the server and mobile apps.
2. Navigate to the `apps/server` directory and run the server by executing:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
3. For the mobile app, go to `apps/mobile` and start the development server using:
   ```bash
   npx react-native start
   ```
4. You can build and run the mobile application on your preferred device.

Additional information and setup requirements can be found in the respective directories' README files.