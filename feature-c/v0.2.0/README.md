# 🧭 ROLF Trailblazer

**Exploration with safety and privacy in mind**

A multi-feature platform for safe and private exploration, showcasing different implementation approaches through distinct feature branches.

---

## 🌟 Project Overview

ROLF Trailblazer is designed with a focus on:
- **Safety**: Built-in safeguards for secure exploration
- **Privacy**: User data protection at every level
- **Flexibility**: Multiple feature implementations to choose from
- **Transparency**: Open development with version control

## 🚀 Live Demo

**Landing Page**: [https://rolfusa-org.github.io/trailblazer/](https://rolfusa-org.github.io/trailblazer/)

### Available Features

| Feature | Status | Description | Latest Version |
|---------|--------|-------------|----------------|
| **Feature A** | 🟢 Live | Baseline implementation | v0.1.0 |
| **Feature B** | 🟠 Beta | Alternative approach | v0.1.0 |
| **Feature C** | 🔵 Development | Experimental features | v0.1.0 |

---

## 📋 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/rolfusa-org/trailblazer.git
   cd trailblazer
   ```

2. **Choose a feature branch**
   ```bash
   # For Feature A
   git checkout feature-a
   
   # For Feature B
   git checkout feature-b
   
   # For Feature C
   git checkout feature-c
   ```

3. **Run locally**
   ```bash
   python3 -m http.server 8000
   ```
   
   Open `http://localhost:8000/` in your browser.

4. **Test the landing page**
   ```bash
   git checkout main
   python3 -m http.server 8080
   ```
   
   Open `http://localhost:8080/` to see all features.

---

## 🏗️ Architecture

This project uses a **config-driven multi-feature architecture**:

### Branch Structure

```
main                    # Landing page + configuration
├── feature-a          # Feature A implementation
├── feature-b          # Feature B implementation
└── feature-c          # Feature C implementation
```

### Deployment Structure

When deployed to GitHub Pages:

```
https://rolfusa-org.github.io/trailblazer/
├── index.html                  # Landing page (feature selector)
├── flavors-config.json         # Configuration (controls what's deployed)
├── shared/                     # Shared components
│   ├── flavor-switcher.js     # Feature & version switcher
│   └── flavor-switcher.css    # Styling
├── feature-a/
│   └── v0.1.0/                # Feature A version 0.1.0
├── feature-b/
│   └── v0.1.0/                # Feature B version 0.1.0
└── feature-c/
    └── v0.1.0/                # Feature C version 0.1.0
```

### Key Files

- **`flavors-config.json`**: Single source of truth for features and versions
- **`shared/`**: Common UI components (feature switcher, changelog modal)
- **`.github/workflows/deploy.yml`**: Automated deployment workflow

---

## 🔄 Version Management

### Viewing Versions

Each feature displays its version in the UI. Click the version badge to see the changelog.

### Adding a New Version

1. **Develop in feature branch**
   ```bash
   git checkout feature-a
   # Make changes...
   git commit -m "feat: new feature"
   git tag v0.2.0
   git push origin feature-a --tags
   ```

2. **Publish via main branch**
   ```bash
   git checkout main
   # Edit flavors-config.json, add v0.2.0 to feature-a.versions
   git commit -m "deploy: publish feature-a v0.2.0"
   git push origin main  # ← Triggers automatic deployment
   ```

3. **GitHub Actions** automatically:
   - Reads configuration
   - Checks out specified version tags
   - Builds nested directory structure
   - Deploys to GitHub Pages

### Retiring a Version

Simply remove the version entry from `flavors-config.json` and push to `main`. The next deployment will exclude it.

---

## 🛠️ Development Workflow

### Feature Development

1. Create/switch to feature branch
2. Make changes
3. Test locally
4. Commit and tag when ready
5. Update `main` branch config to publish

### Configuration-Driven Deployment

The `main` branch controls **everything** that gets deployed:
- ✅ What features are visible
- ✅ What versions are available
- ✅ Feature status (active/beta/development)
- ✅ Version metadata

### Shared Components

Common UI elements are maintained in `main/shared/`:
- **Feature switcher**: Switch between features
- **Version switcher**: Switch between versions
- **Changelog modal**: View version history

Feature branches load these from the deployed site via relative paths.

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)**: Detailed setup and deployment guide
- **[Feature A CHANGELOG](https://github.com/rolfusa-org/trailblazer/blob/feature-a/CHANGELOG.md)**: Version history for Feature A
- **[Feature B CHANGELOG](https://github.com/rolfusa-org/trailblazer/blob/feature-b/CHANGELOG.md)**: Version history for Feature B
- **[Feature C CHANGELOG](https://github.com/rolfusa-org/trailblazer/blob/feature-c/CHANGELOG.md)**: Version history for Feature C

---

## 🤝 Contributing

This is a ROLF project focused on safe exploration. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

[Specify your license here]

---

## 🔗 Links

- **GitHub Repository**: https://github.com/rolfusa-org/trailblazer
- **GitHub Pages**: https://rolfusa-org.github.io/trailblazer/
- **ROLF Project**: [Link to main ROLF project]

---

**Built with safety and privacy in mind 🛡️**
