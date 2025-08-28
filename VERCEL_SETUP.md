# Vercel Deployment Setup Guide

## Environment Variables

To deploy this server successfully on Vercel, you need to set up the following environment variables in your Vercel project settings:

### Required Environment Variables

1. **MONGODB_URI**
   - Your MongoDB connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - You can use MongoDB Atlas for a free cloud database

2. **JWT_SECRET**
   - A secure random string for JWT token signing
   - Example: `your-super-secret-jwt-key-here-make-it-long-and-random`

3. **NODE_ENV**
   - Set to `production` (this is automatically set by Vercel)

### Optional Environment Variables

4. **PORT**
   - Server port (Vercel sets this automatically)
   - Default: `3000`

5. **ALLOWED_ORIGINS**
   - Comma-separated list of allowed CORS origins
   - Example: `https://your-website.vercel.app,https://paydayexpress.ca`

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with the following settings:
   - **Name**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Production (and Preview if needed)
   - **Encrypt**: Yes (recommended)

5. Repeat for `JWT_SECRET` and other variables

## MongoDB Setup (if you don't have one)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Replace `<username>`, `<password>`, and `<database>` with your values

## Testing the Deployment

After setting up environment variables:

1. **Check the dashboard**: Visit `http://localhost:3002/`
2. **Check health endpoint**: Visit `http://localhost:3002/api/health`
3. **Check API docs**: Visit `http://localhost:3002/api-docs`

## Troubleshooting

### 500 Internal Server Error
- Check if all required environment variables are set
- Check Vercel function logs for specific error messages
- Ensure MongoDB URI is correct and accessible

### Database Connection Issues
- Verify MongoDB Atlas network access settings
- Check if IP whitelist includes Vercel's IPs (or set to 0.0.0.0/0 for testing)
- Ensure database user has proper permissions

### CORS Issues
- Update `ALLOWED_ORIGINS` to include your frontend domain
- Check browser console for CORS error messages

## Support

If you continue to have issues:
1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set correctly
3. Test the API endpoints using the health check endpoint 