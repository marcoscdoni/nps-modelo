# Open Graph Image

For the preview to work perfectly on WhatsApp, create an image called `og-image.jpg` in the `public/` folder with these characteristics:

## 📐 Image Specifications:

- **Size**: 1200x630 pixels (landscape format)
- **Format**: JPG or PNG
- **File size**: Maximum 300KB
- **Suggested content**:
  - Driving School Logo
  - Text: "Satisfaction Survey"
  - Subtext: "Your opinion matters!"
  - Background with brand colors

## 🎨 Layout Example:

```
┌─────────────────────────────────────────┐
│  [LOGO]     DRIVING SCHOOL              │
│                                         │
│     📊 SATISFACTION SURVEY              │
│                                         │
│    Your opinion is very important       │
│         to us!                          │
│                                         │
│    ⏱️ Takes only 3 minutes              │
└─────────────────────────────────────────┘
```

## 🚀 How to Add:

1. Create the image in Canva, Figma or Photoshop
2. Save as `og-image.jpg`
3. Place in the `public/og-image.jpg` folder
4. Commit and deploy

## 🔧 Quick Alternative:

If you don't have an image now, remove these lines from `index.html`:

```html
<meta property="og:image" content="https://survey.yourdomain.com/og-image.jpg" />
<meta property="twitter:image" content="https://survey.yourdomain.com/og-image.jpg" />
```

The preview will work with just title and description.

## ✅ Result on WhatsApp:

After the changes, the link will appear like this:

```
📊 Satisfaction Survey - Driving School
Your opinion is very important to us! Participate in our satisfaction survey. Takes only 3 minutes.
[IMAGE if available]
survey.yourdomain.com
```

Much more professional! 🎉