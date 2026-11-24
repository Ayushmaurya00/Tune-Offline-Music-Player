# 🌐 Tune Landing Page & Download Hub (Self-Hosting Guide)

This directory contains the standalone, high-performance product landing page and download hub for **Tune**. It is 100% static, client-side, dependency-free, and ready to deploy anywhere in seconds.

---

## 📁 Directory Contents

- `index.html` — The complete landing page featuring:
  - Smart OS Auto-Detection (Windows vs. Android vs. other platforms)
  - Animated live audio equalizer canvas
  - Hero player preview & feature showcase
  - Direct download links for `.exe` (Windows) and `.apk` (Android)
  - Comparison matrix (Tune vs. Streaming & Generic Players)
  - Interactive FAQ accordion

---

## 🚀 How to Host It Yourself

You can host this website on any static web host, cloud provider, or your own server:

### 1. Instant Drag-and-Drop (Netlify Drop — Free)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this `website/` folder directly onto the browser window.
3. Your site is instantly live with free HTTPS and a custom domain option!

---

### 2. Vercel (Free)
- **Via Vercel CLI**:
  ```bash
  cd website
  npx vercel
  ```
- **Via Vercel Web Dashboard**:
  1. Import your GitHub repository `Tune-Offline-Music-Player`.
  2. Set **Root Directory** to `website`.
  3. Click **Deploy**.

---

### 3. Cloudflare Pages (Free)
1. Log in to Cloudflare Dashboard > **Workers & Pages**.
2. Connect your GitHub repository.
3. Set **Root directory** to `website`.
4. Build command: *(leave empty)*
5. Output directory: *(leave empty)*
6. Click **Save and Deploy**.

---

### 4. Custom VPS / Nginx / Apache / cPanel / Shared Hosting
Simply copy `index.html` to your server's web root:
- **Nginx**: `/var/www/html/` or your site's `root` block.
- **Apache / cPanel**: `public_html/`.

---

## 💻 Local Preview

To test and view the website locally before deploying:

- **Using Node / npx**:
  ```bash
  npx serve website
  ```
- **Using Python**:
  ```bash
  cd website
  python -m http.server 8000
  ```
- Or simply double-click `index.html` to open it in your default web browser.

---

## ⚙️ Customizing Links

Open `index.html` in any text editor to customize:
- Release URLs (replace `https://github.com/Ayushmaurya00/Tune-Offline-Music-Player/releases/latest` with your own hosted binaries if desired).
- Web Player URL (replace `https://ayushmaurya00.github.io/Tune-Offline-Music-Player/` in the PWA card if your web player is hosted elsewhere).
