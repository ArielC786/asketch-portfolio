# Deployment Guide

## 1. Push to GitHub

1.  **Create a Repository:**
    *   Go to [GitHub.com](https://github.com/) and sign in.
    *   Click the **+** icon in the top right and select **New repository**.
    *   Name it `asketch-portfolio` (or whatever you prefer).
    *   **Do not** check "Initialize with README", "Add .gitignore", or "Choose a license" (we already did this locally).
    *   Click **Create repository**.

2.  **Push Code:**
    *   Copy the commands under **"…or push an existing repository from the command line"**.
    *   Run them in your terminal (I've already initialized the repo for you):
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/asketch-portfolio.git
        git branch -M main
        git push -u origin main
        ```

## 2. Deploy to Vercel

1.  **Import Project:**
    *   Go to [Vercel.com](https://vercel.com/) and sign in (you can use your GitHub account).
    *   Click **Add New...** -> **Project**.
    *   In the "Import Git Repository" section, find your `asketch-portfolio` repo and click **Import**.

2.  **Configure & Deploy:**
    *   **Framework Preset:** Select "Other" (since this is plain HTML/CSS/JS).
    *   **Root Directory:** Leave as `./`.
    *   Click **Deploy**.

3.  **Done!**
    *   Vercel will build your site and give you a live URL (e.g., `https://asketch-portfolio.vercel.app`).
    *   Any time you push changes to GitHub, Vercel will automatically update your site.
