# Video Upload in Editor - Quick Guide

## ✅ What's Been Added

Your editor now supports **video uploads** with two methods:

### 1. **Upload Video Block** (Recommended)
- Drag the "Video" block from the Media category
- Double-click the video element to open Asset Manager
- Upload your video file (MP4, WebM, OGG)
- Video will be uploaded to backend and embedded

### 2. **Video URL Block**
- Drag the "Video URL" block from Media category
- Manually edit the `src` attribute to add video URL
- Good for external videos or already uploaded files

## 🎬 How to Use

1. **Start the backend server:**
   ```bash
   cd backend2
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend2
   npm run dev
   ```

3. **In the Editor:**
   - Open any page for editing
   - Look for "Video" block in the Media category
   - Drag it to the canvas
   - Double-click the video to upload a new file
   - Or use the traits panel to set video URL manually

## 🎛️ Video Controls

The video component supports these traits:
- **Video URL** - Direct link to video file
- **Autoplay** - Start playing automatically
- **Loop** - Repeat video continuously
- **Muted** - Start with sound off

## 📁 Supported Formats

Backend accepts:
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)

Max file size: **100MB**

## 🔧 Technical Details

- Videos are uploaded to: `backend2/uploads/`
- Accessible at: `http://localhost:5000/uploads/[filename]`
- Upload endpoint: `POST http://localhost:5000/api/upload`
- Uses Multer for file handling

## 🐛 Troubleshooting

**Video not uploading?**
- Check backend server is running on port 5000
- Check browser console for errors
- Verify file size is under 100MB
- Ensure file format is supported

**Video not playing?**
- Check the video URL is accessible
- Try opening the URL directly in browser
- Check browser console for CORS errors
- Verify video codec is supported by browser

**Double-click not working?**
- Make sure you're in edit mode (not preview)
- Try selecting the video first, then double-click
- Check if Asset Manager opens (look for modal)

## 💡 Tips

- Use MP4 format for best browser compatibility
- Keep videos under 50MB for better performance
- Consider using video hosting services (YouTube, Vimeo) for large files
- Test video playback in different browsers
