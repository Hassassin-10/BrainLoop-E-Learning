# 🧠 BrainLoop

**BrainLoop** is an interactive, AI-powered educational platform that integrates video-based learning, AR labs, quizzes, and a smart chatbot to enhance the personalized learning experience for students.


## 🚀 Features

- 🔐 **Secure Authentication**
  - Google, Email/Password, or Barcode-based login
  - Role-based access control using Student IDs (e.g., `8918`, `8946`, etc.)

- 🎓 **Course Management**
  - View courses, mark modules as completed
  - Admins (e.g., `8918`) can create, edit, and delete courses

- 🎥 **Video Learning**
  - Embedded YouTube/MP4 videos (not redirected)
  - Progress tracking for each student

- 💬 **Real-time Doubt Resolution**
  - Chat-based doubt asking per module
  - Doubts can be pinned and replied to in real time
  - Student-to-student chat (e.g., `8918` and `8946`)

- 🧪 **Interactive AR Labs**
  - Redirects to real physics/math lab simulations from:
    - [PhET Colorado](https://phet.colorado.edu)
    - [OPhysics](https://ophysics.com)
    - [Falstad](https://www.falstad.com/mathphysics.html)
    - [VisualGo](https://visualgo.net)

- 💳 **Payments**
  - Stripe (Test Mode) integration for course purchases
  - Alternative Razorpay-like options considered

- 🤖 **AI Chatbot**
  - Persistent chatbot available on all pages
  - Positioned on the bottom-right of the screen

- 📄 **Feedback System**
  - Students can submit feedback per course/module
  - Feedback is linked to student ID and timestamped

- 👤 **Profile Management**
  - Shows name, email, student ID

- 🌌 **3D Spline Background**
  - Interactive background using Spline3D behind the landing message

---

## 🧱 Tech Stack

- **Frontend**: Next.js, Tailwind CSS, TypeScript
- **Backend**: Firebase (Firestore, Realtime DB, Auth)
- **3D Graphics**: [Spline](https://spline.design)
- **Payment Gateway**: Stripe (Test Mode)
- **Authentication**: Firebase Auth + custom student ID logic

---

## 🛠️ Setup Instructions

1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-org/brainloop.git
   cd brainloop
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Add Firebase Config**
   Create a `.env.local` and add:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Dev Server**
   ```bash
   npm run dev
   ```

---

## 📁 Folder Structure

```
/src
  /app              → Pages and routes
  /components       → Reusable UI components
  /contexts         → Auth & global state
  /data             → Mock course/video data
  /services         → Firebase/Firestore/Stripe logic
```

---

## ✅ Admin Privileges

Only the following Student IDs can perform admin actions:

- `8918` – Master Admin
- `8946`, `8904`, `STRITH23170` – Custom access (if configured)

---

## 📸 Screenshots

| Feature        | Screenshot |
| -------------- | ---------- |
| Login Page     | ✅ Google & Email Auth |
| AR Labs        | ✅ Interactive buttons to PhET, Falstad, etc. |
| Course Modules | ✅ Video progress + feedback system |
| Chatbot        | ✅ Visible across all pages, fixed bottom-right |
| Admin Panel    | ✅ Add/Edit/Delete courses |

---

## 🧪 Test Payments with Stripe

Use the following test card to simulate payments:

```
Card: 4242 4242 4242 4242
Exp: Any future date
CVV: 123
```

## 📜 License

MIT License. Free for educational and non-commercial use.

---

> "Unlock Your Learning Potential with BrainLoop" 🚀
