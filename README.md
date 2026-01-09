# MediSchedule

A medication tracking app that helps users manage their medications and never miss a dose.

## About

MediSchedule is my capstone project for Springboard's Full-Stack Web Development bootcamp. Users can create an account, add their medications with dosing times, and track their daily schedule.

## Features

- User login and account creation
- Add medications with dose, dates, and times
- "Generate Schedule" button to view daily medication schedule
- Automatic flagging of missed doses

## Tech Stack

- **Frontend**: React, Next.js
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

## Live App

[View on Vercel](https://medication-tracker-git-dev-brittahs-projects.vercel.app/login)

## Run Locally

1. Clone the repo
```bash
git clone https://github.com/BHaenelt/medication-tracker.git
cd medication-tracker
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the app
```bash
npm run dev
```

5. Open http://localhost:3000

## What I Learned

- Deploying a full-stack app to Vercel
- Working with MongoDB for user data and medication tracking
- Building authentication with JWT tokens
- Managing state in React with Next.js

---

## Future Enhancements

- Forgot password functionality
- Integration with external API for medication contraindication checking
- Email/SMS notifications for upcoming doses
- Medication refill reminders

**Author**: B - Springboard Bootcamp Graduate, December 2025