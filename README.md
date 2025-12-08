🧥 Closet App (Virtual Closet & Outfit Planner)

Kloset is a full-stack web application that allows users to digitize their wardrobe, build outfits using drag-and-drop tools, and plan what to wear throughout the week. Users can upload clothing photos, organize them by category, create outfits, and schedule those outfits on a calendar.

⸻

🚀 Features
	•	Digital Closet – Upload clothing photos and organize them by category.
	•	Outfit Builder – Drag and drop clothing items to create custom outfits.
	•	Outfit Planner – Assign outfits to specific days using an interactive calendar.
	•	Sharing & Feedback – Share outfits with friends and collaborate on styling.
	•	Optional Extras – Background removal for clothing images, social posting, affiliate links, and more.

⸻

🛠️ Tech Stack

Frontend
	•	React (Vite + TypeScript)
	•	React Router
	•	Tailwind CSS
	•	React DnD / React-Konva (drag-and-drop outfit builder)

Backend
	•	Supabase (Auth, Postgres, Storage)
or Firebase (Firestore, Auth, Storage)

Other Tools
	•	React Calendar / React Big Calendar
	•	Zustand or Redux
	•	Optional: remove.bg API, Replicate API, OpenAI Images API

Project Structure
/src
  /components
  /pages
  /hooks
  /store
  /utils
  /services
  /assets

🔐 Authentication
	•	Supabase Auth handles sign-in / sign-up
	•	Protected routes via React Router
	•	User-specific clothing, outfits, and schedules
	•	RLS (Row Level Security) ensures users can only access their own data

⸻

🖼️ Image Upload Pipeline
	1.	User selects or takes a clothing photo
	2.	Image is converted to Base64
	3.	Base64 is sent to a Background Removal API (Replicate/remove.bg)
	4.	API returns a clean, cut-out PNG image
	5.	Processed image is uploaded to Supabase Storage
	6.	Clothing metadata (type, name, path) is saved to Postgres
	7.	Clothing item appears instantly in the UI

Development Setup

1. Clone the Repo
git clone https://github.com/Ahamadu1/Closet-app
cd Closet-app

2. Install Dependencies
npm install

3. Create Environment File
Create a .env file:
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_BGREMOVAL_API_KEY=optional

4. Start the App
npm run dev

🚀 Roadmap
	•	AI outfit recommendations
	•	Shared closets
	•	Bulk uploads
	•	AR try-on
	•	Smart auto-tagging

⸻

🤝 Contributing

Pull requests are welcome! Feel free to open issues for feature suggestions or bugs.

⸻

📄 License

MIT License.

🚀 Sharing the App Using Expo Tunnel

Option 1 — Open the Published Expo Version (Recommended)

This version works 24/7 and does not require my computer to be running.

Live Demo Link

📌 https://expo.dev/accounts/ahamadu123/projects/closetapp/updates/6db056f5-9550-428e-9b37-ab22278be69a

Steps

Install Expo Go on your phone

iPhone: App Store

Android: Play Store

Open the link above

Expo Go will automatically launch the app

No setup or installation required.

✅ Option 2 — Run the App via Expo Tunnel (During Development)

Tunnel mode allows anyone to run the app even if they are not on my WiFi network, as long as the development server is active.

Steps

Run the project in tunnel mode:

npx expo start --tunnel


A QR code and a public URL will appear

Open Expo Go

Scan the QR code or open the URL

The app loads directly in Expo Go

⚠️ Tunnel mode only works while my development server is running.

🛠️ Requirements

To run the app using either method, the viewer needs:

A smartphone with Expo Go installed

An internet connection

(Tunnel mode only) My development server must be active at the time of testing

The published version has no requirements other than Expo Go.

🧪 Troubleshooting
Expo Go shows a blank screen

Swipe down to refresh or restart Expo Go.

App does not load in tunnel mode

I may need to restart the development server and run:

npx expo start --tunnel

Published link not opening

Expo servers may temporarily cache updates — try reopening Expo Go.
