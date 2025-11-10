# Campify - Student Data Management System

This is a Next.js application built with Firebase Studio. It's a prototype for a student data management system called "Campify".

## Running the Project Locally

To run this project on your local machine using VS Code, please follow these steps.

### Prerequisites

1.  **Node.js:** Make sure you have Node.js installed on your computer. It is not installed "on" or "in" VS Code, but on your operating system (like Windows or macOS). You can download it from [nodejs.org](https://nodejs.org/). Version 18 or higher is recommended.
2.  **Code Editor:** VS Code is the recommended code editor for this project.

### Setup Instructions

1.  **Download the Code:**
    First, you'll need a copy of the project files on your local machine.

2.  **Open in VS Code:**
    Open the project folder in Visual Studio Code.

3.  **Install Dependencies:**
    Open the integrated terminal in VS Code (`View` > `Terminal` or `Ctrl+\` `). Then, run the following command to install all the necessary packages for the project:
    ```bash
    npm install
    ```

4.  **Run the Project Locally:**
    The application requires two separate processes to run at the same time: the Next.js web server and the Genkit AI server (which powers the chatbot and other AI features).

    You will need to open **two** integrated terminals in VS Code.

    *   **In your first terminal**, run the following command to start the web application:
        ```bash
        npm run dev:local
        ```

    *   **In your second terminal**, run the following command to start the AI server:
        ```bash
        npm run genkit:watch
        ```

5.  **View the Application:**
    The web server will start on `http://localhost:3000`. Open this URL in your web browser to see the application running. With both servers running, all features, including the AI Helpdesk, will be fully functional.

### Verifying Local Data

To answer your question: yes, when you run the project locally using these steps, it will use the mock data defined inside the `src/lib/data.ts` file. It does **not** connect to a live cloud database, so it's perfect for safe local testing and development.

## Downloading the Code and Publishing to GitHub

### Step 1: Download the Source Code

In the Firebase Studio interface, look for a **"Download Code"** button, which is typically located in the top menu bar. Clicking this will download a `.zip` file containing the entire project source code to your computer.

Once downloaded, unzip the file to a folder on your local machine.

### Step 2: Publish to GitHub

After downloading and unzipping the code, you can publish it to your own GitHub repository.

1.  **Create a New Repository on GitHub:**
    Go to [GitHub](https://github.com) and create a new, empty repository. Do **not** initialize it with a README, .gitignore, or license file, as these already exist in the downloaded project.

2.  **Initialize Git in Your Local Project:**
    Open a terminal or command prompt, and navigate into the project folder you unzipped. Run the following commands:
    ```bash
    # Initialize a new Git repository
    git init

    # Add all the project files to the staging area
    git add .

    # Create your first commit
    git commit -m "Initial commit of Campify project"

    # Rename the default branch to 'main'
    git branch -M main
    ```

3.  **Link and Push to GitHub:**
    Replace `<YOUR_GITHUB_REPO_URL>` with the URL of the repository you created in step 2.1. You can find this on your new repository's page on GitHub.
    ```bash
    # Add your GitHub repository as the remote origin
    git remote add origin <YOUR_GITHUB_REPO_URL>

    # Push your code to the 'main' branch on GitHub
    git push -u origin main
    ```