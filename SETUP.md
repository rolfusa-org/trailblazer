# Setup & Deployment Guide

Complete guide for setting up the Togethering multi-flavor repository and GitHub Pages deployment.

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Daily Development Workflow](#daily-development-workflow)
3. [Local Development](#local-development)
4. [Configuration](#configuration)
5. [Troubleshooting](#troubleshooting)

## Initial Setup (One-Time)

### 1. Repository Structure

The repository uses a branch-based multi-flavor architecture:

- **`main`**: Landing page, documentation, and GitHub Actions workflow
- **`flavor-html`**: Pure HTML/CSS/JS implementation
- **`flavor-pwa`**: Progressive Web App implementation
- **`flavor-nextjs`**: Next.js implementation (planned)
- **`gh-pages`**: Auto-generated deployment branch (don't edit directly)

### 2. Enable GitHub Pages

1. Go to your repository on GitHub/Yahoo Git
2. Navigate to **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

**Note**: The `gh-pages` branch will be automatically created by GitHub Actions on first deployment.

### 3. Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
3. Click **Save**

### 4. Trigger First Deployment

```bash
# Push any of the branches to trigger deployment
git push origin main
git push origin flavor-html
git push origin flavor-pwa
```

Go to **Actions** tab to watch the deployment progress.

## Daily Development Workflow

### Working on a Flavor

```bash
# Switch to your flavor branch
git checkout flavor-html

# Make your changes
# ... edit files ...

# Test locally
python3 -m http.server 8001
# Visit http://localhost:8001

# Commit with descriptive message (use Conventional Commits)
git add .
git commit -m "feat: add user profile feature"

# Push to trigger auto-deployment
git push origin flavor-html
```

### Creating a New Version

When you're ready to release a new version:

```bash
# On your flavor branch, after committing changes
git tag -a v1.2.0 -m "Release v1.2.0: User profiles and settings"
git push origin v1.2.0

# Update CHANGELOG.md
vim CHANGELOG.md
# Add your release notes under a new version heading

git add CHANGELOG.md
git commit -m "docs: update changelog for v1.2.0"
git push origin flavor-html
```

The GitHub Action will automatically:
1. Detect the new tag
2. Generate `version.json` with version info
3. Deploy to GitHub Pages
4. The version badge in the app will update automatically

### Conventional Commits

Use these prefixes for clear commit messages:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting (no logic change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```bash
git commit -m "feat: add QR code history feature"
git commit -m "fix: camera permission on iOS Safari"
git commit -m "docs: update README with new features"
```

## Local Development

### Running Locally

```bash
# On any flavor branch
python3 -m http.server 8001

# Or with npm
npx http-server -p 8001

# Or with PHP
php -S localhost:8001

# Visit: http://localhost:8001
```

### Testing Landing Page Locally

```bash
git checkout main

# Run server
python3 -m http.server 8000

# Visit: http://localhost:8000
# Note: Links to flavors won't work locally without full setup
# You'll see an alert with instructions to checkout flavor branches
```

### Full Local Testing (All Flavors Together)

To test the complete multi-flavor experience locally:

```bash
# Create a local gh-pages simulation
mkdir -p /tmp/togethering-test
cd /tmp/togethering-test

# Copy main branch files
git clone <your-repo> temp
cd temp
git checkout main
cp index.html config.json /tmp/togethering-test/
cd /tmp/togethering-test && rm -rf temp

# Clone each flavor
git clone -b flavor-html <your-repo> html
git clone -b flavor-pwa <your-repo> pwa
# git clone -b flavor-nextjs <your-repo> nextjs

# Run server
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## Configuration

### Change Default Flavor

Edit `config.json` on main branch:

```json
{
  "defaultFlavor": "pwa"  // Change from "html" to "pwa"
}
```

Commit and push - the landing page will update.

### Add New Flavor

1. **Create new branch:**
```bash
git checkout -b flavor-mynewflavor
# Add your implementation
git add .
git commit -m "feat: initial mynewflavor implementation"
git push origin flavor-mynewflavor
```

2. **Update config.json on main:**
```json
{
  "flavors": {
    "mynewflavor": {
      "name": "My New Flavor",
      "shortName": "New",
      "description": "Description here",
      "status": "beta"
    }
  }
}
```

3. **Update GitHub Actions workflow** (`.github/workflows/deploy.yml`):
Add checkout step for new flavor.

### Flavor Status Options

- `"active"`: Green "Live" badge, clickable
- `"beta"`: Orange "Beta" badge, clickable
- `"coming-soon"`: Gray badge, not clickable

## Troubleshooting

### GitHub Action Fails

**Check the logs:**
1. Go to repository → Actions tab
2. Click on the failed workflow
3. Expand the failed step to see error

**Common issues:**

| Issue | Solution |
|-------|----------|
| Missing branch | Ensure all flavor branches exist: `git branch -a` |
| Permission denied | Check Actions permissions in Settings → Actions |
| Syntax error | Validate YAML syntax in workflow file |
| Checkout failed | Branch may not exist on remote |

### Version Not Updating

**Checklist:**
- [ ] Did you create and push the tag? `git push origin --tags`
- [ ] Is version.json being generated? Check gh-pages branch
- [ ] Clear browser cache: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- [ ] Check GitHub Actions logs for errors
- [ ] Verify tag format matches: `v1.2.3` (lowercase v)

### Flavor Not Loading

**Check:**
1. Does the flavor branch exist? `git branch -a`
2. Is there an `index.html` in the flavor branch?
3. Check browser console for errors (F12)
4. Verify path in config.json matches directory name
5. Ensure version.json exists in flavor directory

### Page Shows 404

**Possible causes:**
1. GitHub Pages not enabled - check Settings → Pages
2. gh-pages branch doesn't exist - trigger a deployment
3. Waiting for first deployment - can take 1-2 minutes
4. Wrong repository URL in config

### Double-Click Not Working

If the home button double-click isn't switching flavors:

1. Check if `localStorage.getItem('togetheringReturnUrl')` is set
2. Verify you're at the home screen (grid menu visible)
3. Try adjusting `doubleClickDelay` in script.js (default 300ms)
4. Check browser console for JavaScript errors

## Advanced Topics

### Manual Deployment

If you need to manually build the gh-pages branch:

```bash
# This is rarely needed - GitHub Actions handles it automatically
git checkout --orphan gh-pages
git rm -rf .

# Manually construct the site
# ... copy files from each branch ...

git add .
git commit -m "manual: deploy all flavors"
git push -f origin gh-pages
```

### Keeping Branches in Sync

Flavors are independent, but if you need shared assets:

```bash
# Option 1: Cherry-pick specific commits
git checkout flavor-html
git cherry-pick <commit-hash-from-flavor-pwa>

# Option 2: Merge specific files
git checkout flavor-pwa -- path/to/shared-file.js
git commit -m "chore: sync shared file from flavor-pwa"
```

### Custom Domain

To use a custom domain with GitHub Pages:

1. Add `CNAME` file to main branch
2. Configure DNS settings
3. Enable HTTPS in GitHub Pages settings

## Getting Help

- **GitHub Actions Documentation**: https://docs.github.com/actions
- **GitHub Pages Documentation**: https://docs.github.com/pages
- **Project Issues**: https://git.ouryahoo.com/ljzhang/togethering-demo/issues
- **Yahoo Builder Community**: Reach out to the community

## Appendix: File Structure Reference

### Main Branch
```
main/
├── index.html          # Landing page with flavor selector
├── config.json         # Flavor configuration
├── README.md          # Project overview
├── SETUP.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml  # Deployment automation
```

### Flavor Branch (example: flavor-html)
```
flavor-html/
├── index.html          # App HTML
├── script.js           # App JavaScript (includes flavor switcher)
├── styles.css          # App styles (includes version badge styles)
├── version.json        # Auto-generated version info
├── CHANGELOG.md       # Version history
└── js/                # Libraries
    └── ...
```

### gh-pages Branch (auto-generated)
```
gh-pages/
├── index.html          # Landing page from main
├── config.json         # Config from main
├── html/              # Complete flavor-html content
│   ├── index.html
│   ├── version.json
│   └── ...
├── pwa/               # Complete flavor-pwa content
│   └── ...
└── nextjs/            # Complete flavor-nextjs content
    └── ...
```

---

**Last updated: 2025-10-22**

Need help? Open an issue or reach out to the Yahoo Builder Community!

