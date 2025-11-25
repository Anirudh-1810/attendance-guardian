# Running the Mobile App in Android Studio

This guide provides step-by-step instructions on how to set up and run the mobile app on an Android emulator or physical device using Android Studio.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

1.  **Node.js and npm:** [Download and install Node.js](https://nodejs.org/), which includes npm (Node Package Manager).
2.  **Android Studio:** [Download and install Android Studio](https://developer.android.com/studio).
3.  **Android SDK:** Make sure you have the Android SDK installed, along with the necessary build tools and an emulator. You can set this up through the SDK Manager in Android Studio.

## Step 1: Install Dependencies

1.  **Navigate to the `mobile` directory:**
    Open your terminal and change your current directory to the `mobile` folder within the project.

    ```bash
    cd mobile
    ```

2.  **Install the required packages:**
    Run the following command to install all the necessary dependencies for the project.

    ```bash
    npm install
    ```

## Step 2: Open the Project in Android Studio

1.  **Launch Android Studio.**
2.  **Open the Android project:**
    - Click on "Open an Existing Project."
    - Navigate to the `mobile/android` directory within the project's root folder.
    - Select the `android` folder and click "OK."

3.  **Sync the project with Gradle:**
    Android Studio will automatically start syncing the project with Gradle. Wait for this process to complete.

## Step 3: Run the App

You can run the app in two ways:

### Option A: Using the Command Line (Recommended)

1.  **Start the Metro Bundler:**
    In your terminal (from the `mobile` directory), run the following command to start the Metro bundler, which is responsible for bundling the JavaScript code.

    ```bash
    npm start
    ```

2.  **Run the app on your device or emulator:**
    - Make sure you have an Android emulator running or a physical device connected.
    - Open a **new** terminal window (also in the `mobile` directory) and run the following command:

    ```bash
    npm run android
    ```

    This command will build the app and install it on your emulator or device.

### Option B: Using Android Studio's "Run" Button

1.  **Start the Metro Bundler:**
    You still need to start the Metro bundler first. In your terminal (from the `mobile` directory), run:

    ```bash
    npm start
    ```

2.  **Run the app from Android Studio:**
    - In the Android Studio toolbar, select the "app" configuration from the dropdown menu.
    - Choose your desired emulator or connected device.
    - Click the green "Run" button (the triangle icon).

The app should now be running on your selected device or emulator.
