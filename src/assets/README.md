# Assets Folder

This folder contains all static assets for the Claim Nest application.

## Structure

- `/animations/` - Lottie animation JSON files
- `/images/` - Static images (PNG, JPG, SVG)
- `/icons/` - Icon assets

## Usage

### Lottie Animations
Place your Lottie JSON files in the `/animations/` folder and import them like:

```javascript
import heroAnimation from '../assets/animations/hero-animation.json';
```

### Example
To use a Lottie animation in the HeroSection:

1. Save your JSON file as `hero-animation.json` in `/src/assets/animations/`
2. The HeroSection component will automatically use it

## Supported Formats

- **Animations**: `.json` (Lottie files)
- **Images**: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`
- **Icons**: `.svg`, `.png`
