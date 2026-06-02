# Portfolio Admin Setup Guide

## What Has Been Created

I've set up a complete admin system for your portfolio with the following:

### Files Created:
1. **`.env.local`** - Environment configuration (needs your MongoDB URL and password)
2. **`lib/mongodb.js`** - MongoDB connection handler
3. **`models/PortfolioContent.js`** - Database schema for portfolio content
4. **`app/api/admin/login/route.js`** - Login API endpoint
5. **`app/api/content/route.js`** - Content management API endpoints
6. **`app/admin/login/page.js`** - Admin login page
7. **`app/admin/dashboard/page.js`** - Admin dashboard for editing content
8. **`hooks/usePortfolioContent.js`** - Hook for fetching content
9. **Updated `app/components/Header.jsx`** - Now fetches dynamic content

---

## Setup Instructions

### Step 1: Set Up MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new project and cluster
4. Get your connection string
5. Copy it to `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

### Step 2: Configure Admin Password
1. Open `.env.local`
2. Set your admin password:
   ```
   ADMIN_PASSWORD=your_secure_password_here
   ```

### Step 3: Run Your Application
```bash
npm run dev
```

### Step 4: Access Admin Section
1. Navigate to: `http://localhost:3000/admin/login`
2. Enter your admin password
3. You'll be redirected to the dashboard

---

## How to Use the Admin Dashboard

### Header Section
- **Name**: Your full name
- **Title**: Your professional title
- **Bio**: Your full biography/description

### About Section
- Edit your about page content

### Work & Certifications
- Full editing interfaces coming soon

---

## Important Notes

⚠️ **Security:**
- Keep your `.env.local` file secret (add to `.gitignore` if using git)
- Don't commit sensitive credentials to GitHub
- The password is simple for demo purposes - consider adding better auth later

🔄 **How It Works:**
1. Components fetch content from `/api/content` endpoint
2. Admin dashboard can update content via `/api/content` PUT endpoint
3. Data is stored in MongoDB
4. All components automatically display the latest content

---

## Updating Other Components

To make other sections (About, Work, Certifications) editable, update their components similarly:

```javascript
const [sectionData, setSectionData] = useState(defaultData);

useEffect(() => {
  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content?section=sectionname");
      if (response.ok) {
        const result = await response.json();
        setSectionData(result.data);
      }
    } catch (error) {
      console.log("Using default content");
    }
  };
  
  fetchContent();
}, []);
```

Then replace hardcoded content with `{sectionData.field}`

---

## Troubleshooting

**MongoDB Connection Error:**
- Verify your connection string in `.env.local`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure MongoDB is accessible from your network

**Login Not Working:**
- Check that `ADMIN_PASSWORD` is set in `.env.local`
- Clear browser localStorage: `localStorage.clear()`
- Restart the development server

**Content Not Loading:**
- Check browser console for errors
- Verify MongoDB connection
- Check API responses in Network tab (DevTools)

---

## Next Steps

1. ✅ Complete the MongoDB setup
2. ✅ Set admin password
3. ✅ Test the login page
4. ✅ Update header content
5. 📝 Add editing for other sections
6. 🔐 Consider upgrading auth system for production

---

Enjoy your new admin dashboard! 🎉
