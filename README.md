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

Tunnel mode allows anyone to open and test the Expo app without being on the same WiFi network—perfect for professors, classmates, and presentations.

Why Tunnel Mode?
	•	Allows public access to your development build
	•	Works anywhere (not restricted to your home network)
	•	Opens instantly inside the Expo Go app
	•	No installation or environment setup required for the viewer

⸻

How to Enable Tunnel Mode
	1.	Start your development server:
npx expo start

2.	When the Expo Dev Tools appear, press:
SHIFT + T
(Switches the connection mode to Tunnel)
3.	Expo will now generate a public link and QR code:
exp://yourname-yourproject.exp.direct
4.	Share the link with anyone.
They can scan it or open it in Expo Go.

⸻

Result
	•	Anyone can run your app on their phone instantly
	•	No WiFi restrictions
	•	No need to clone the repo or install dependencies
	•	Perfect for demos and project submissions


