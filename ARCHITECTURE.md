# Multi-Flavor Multi-Version Architecture - Requirements & Design Documentation

**Project**: ROLF Trailblazer (Reference Implementation)  
**Created**: 2025-10-23  
**Purpose**: Configuration-driven system for managing multiple app implementations with version control

---

## Table of Contents

1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [Architecture Design](#architecture-design)
4. [Git Strategy](#git-strategy)
5. [Configuration System](#configuration-system)
6. [Deployment Workflow](#deployment-workflow)
7. [UI/UX Components](#uiux-components)
8. [File Structure](#file-structure)
9. [Implementation Details](#implementation-details)
10. [Developer Workflows](#developer-workflows)

---

## Overview

### Problem Statement
Need a system to:
- Showcase multiple implementation approaches of the same application ("flavors")
- Maintain multiple versions of each flavor for comparison and rollback
- Provide easy version/flavor switching in the UI
- Control what gets deployed through configuration
- Minimize code duplication and maintenance overhead
- Support independent development of each flavor

### Solution
A configuration-driven, Git-based architecture where:
- **Main branch** controls what gets deployed via `flavors-config.json`
- **Feature branches** contain actual app implementations
- **Git tags** mark specific versions (using branch-specific naming)
- **Shared components** are maintained centrally and fetched by all flavors
- **GitHub Actions** automates deployment based on configuration
- **GitHub Pages** hosts the multi-version, multi-flavor site

---

## Core Concepts

### 1. Flavors
**Definition**: Different implementation approaches of the same application concept.

**Purpose**: 
- Compare different technical stacks (HTML/CSS/JS vs PWA vs React)
- Test alternative UI/UX approaches
- Demonstrate evolution of features

**Example Flavors**:
- Feature A: Baseline implementation
- Feature B: Alternative approach
- Feature C: Experimental features

### 2. Versions
**Definition**: Snapshots of a flavor at specific points in time.

**Purpose**:
- Allow users to compare current vs previous versions
- Enable rollback if issues arise
- Document evolution over time

**Versioning Scheme**: Semantic Versioning (e.g., v0.1.0, v0.2.0)

### 3. Configuration-Driven Deployment
**Definition**: Single source of truth (`flavors-config.json`) controls what gets deployed.

**Benefits**:
- Atomic deployments (one config change = complete update)
- No accidental deploys from feature branches
- Easy to add/remove versions without touching code
- Storage-efficient (only deploy what's configured)

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  main branch                                             │
│  ├── flavors-config.json  ← Single source of truth      │
│  ├── index.html            ← Landing page (selector)    │
│  ├── shared/               ← Shared components          │
│  │   ├── flavor-switcher.js                             │
│  │   └── flavor-switcher.css                            │
│  ├── README.md                                           │
│  ├── SETUP.md                                            │
│  └── .github/workflows/deploy.yml                       │
│                                                          │
│  feature-a branch                                        │
│  ├── index.html            ← App UI                     │
│  ├── script.js             ← App logic                  │
│  ├── styles.css            ← App styling                │
│  ├── version.json          ← Version metadata           │
│  └── CHANGELOG.md          ← Version history            │
│                                                          │
│  feature-b branch          (same structure)              │
│  feature-c branch          (same structure)              │
│                                                          │
│  Tags (Global to repo):                                 │
│  ├── v0.1.0               ← Points to feature-a         │
│  ├── feature-a-v0.2.0     ← Branch-specific tag         │
│  ├── feature-b-v0.2.0     ← Branch-specific tag         │
│  └── feature-c-v0.2.0     ← Branch-specific tag         │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                  GitHub Actions Workflow
                  (Triggered by push to main)
                           │
                           ▼
                  ┌──────────────────┐
                  │ Read config.json │
                  │ For each flavor: │
                  │ - Checkout tag   │
                  │ - Copy to deploy │
                  └──────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  gh-pages    │
                    │  (Deployed)  │
                    └──────────────┘
                           │
                           ▼
                  GitHub Pages Hosting
            https://org.github.io/repo/
```

### Deployment Structure

**On GitHub Pages** (gh-pages branch):
```
/
├── index.html                    # Landing page (flavor selector)
├── flavors-config.json           # Configuration manifest
├── shared/                       # Shared components
│   ├── flavor-switcher.js       # Version/flavor switcher
│   └── flavor-switcher.css      # Switcher styling
├── feature-a/                    # Flavor A namespace
│   ├── v0.2.0/                  # Version 0.2.0 (Latest)
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── styles.css
│   │   ├── version.json
│   │   └── CHANGELOG.md
│   └── v0.1.0/                  # Version 0.1.0 (Stable)
│       └── (same files)
├── feature-b/                    # Flavor B namespace
│   ├── v0.2.0/
│   └── v0.1.0/
└── feature-c/                    # Flavor C namespace
    ├── v0.2.0/
    └── v0.1.0/
```

**Key Design Decisions**:
1. **Nested structure**: `{flavor}/{version}/` for clear organization
2. **Shared at root**: `shared/` accessible via `../../shared/` from any version
3. **Config at root**: Single config controls entire site
4. **Landing page**: Entry point for flavor selection

---

## Git Strategy

### Branch Structure

#### Main Branch
**Purpose**: Control center and documentation

**Contents**:
- `flavors-config.json` - Deployment configuration
- `index.html` - Landing page
- `shared/` - Shared components
- `README.md` - Project documentation
- `SETUP.md` - Deployment guide
- `.github/workflows/deploy.yml` - CI/CD workflow

**Workflow**:
- Push to `main` → Triggers deployment
- Never contains app code (only infrastructure)

#### Feature Branches (feature-a, feature-b, feature-c)
**Purpose**: Actual app implementations

**Contents**:
- `index.html` - App UI
- `script.js` - App logic
- `styles.css` - App styling
- `version.json` - Version metadata
- `CHANGELOG.md` - Version history
- (Optional) Assets, libraries, etc.

**Workflow**:
- Develop in feature branch
- Tag when ready for release
- Update `main` config to publish

#### gh-pages Branch
**Purpose**: Deployed site (auto-generated)

**Management**: 
- Created and managed by GitHub Actions
- Force-orphan (no history) to keep it clean
- Never manually edited

### Tagging Strategy

#### Problem: Git Tags are Global
**Issue**: Can't have the same tag name (e.g., `v0.2.0`) pointing to different commits.

**Solution**: Branch-specific tag naming convention

#### Tag Naming Convention

**Format**: `{branch}-v{semver}` for version-specific tags

**Examples**:
```
v0.1.0              → Points to feature-a (initial release)
feature-a-v0.2.0    → Points to feature-a latest
feature-b-v0.2.0    → Points to feature-b latest
feature-c-v0.2.0    → Points to feature-c latest
```

**When to use branch-specific vs generic**:
- First release: Can use generic `v0.1.0` if all features start together
- Subsequent releases: Must use branch-specific (e.g., `feature-a-v0.2.0`)
- Different timelines: Always use branch-specific

**Tag Creation Workflow**:
```bash
# On feature-a branch
git checkout feature-a
git tag feature-a-v0.2.0
# Don't push yet - update config first!

# On main branch
git checkout main
# Edit flavors-config.json to add the new version
git commit -m "deploy: publish feature-a v0.2.0"

# Push everything
git push origin main
git push origin feature-a
git push origin --tags
```

---

## Configuration System

### flavors-config.json Structure

**Location**: `main` branch, root directory

**Purpose**: Single source of truth for all deployments

**Complete Schema**:

```json
{
  "version": "2.0",
  "lastUpdated": "2025-10-23",
  
  "project": {
    "name": "ROLF Trailblazer",
    "description": "Exploration with safety and privacy in mind",
    "repository": "https://github.com/rolfusa-org/trailblazer"
  },
  
  "flavors": [
    {
      "key": "feature-a",                    // Unique identifier
      "name": "Feature A",                   // Display name
      "shortName": "Feature A",              // Abbreviated name
      "icon": "fa-rocket",                   // FontAwesome icon
      "description": "Baseline implementation for exploration features.",
      "branch": "feature-a",                 // Git branch name
      "status": "active",                    // Status type (see below)
      "visible": true,                       // Show in UI?
      
      "versions": [
        {
          "version": "0.2.0",                // Semver version
          "tag": "feature-a-v0.2.0",         // Git tag to checkout
          "label": "Latest",                 // Display label
          "isDefault": true,                 // Default for this flavor?
          "deployPath": "feature-a/v0.2.0",  // Deploy location
          "releaseDate": "2025-10-23"        // Release date
        },
        {
          "version": "0.1.0",
          "tag": "v0.1.0",
          "label": "Stable",
          "isDefault": false,
          "deployPath": "feature-a/v0.1.0",
          "releaseDate": "2025-10-23"
        }
      ]
    }
    // ... more flavors
  ],
  
  "statusTypes": {
    "active": {
      "label": "Live",
      "color": "#48bb78",
      "clickable": true
    },
    "beta": {
      "label": "Beta",
      "color": "#ed8936",
      "clickable": true
    },
    "development": {
      "label": "In Development",
      "color": "#cbd5e0",
      "clickable": true
    },
    "coming-soon": {
      "label": "Coming Soon",
      "color": "#cbd5e0",
      "clickable": false
    }
  }
}
```

### Configuration Fields Explained

#### Flavor Object
- **`key`**: Unique ID for URL routing and internal reference
- **`name`**: Full display name shown in UI
- **`shortName`**: Used in compact displays
- **`icon`**: FontAwesome class (e.g., `fa-rocket`)
- **`description`**: Shown on landing page cards
- **`branch`**: Git branch containing the code
- **`status`**: One of the keys from `statusTypes`
- **`visible`**: If `false`, hidden from UI (but can still be accessed via URL)

#### Version Object
- **`version`**: Semantic version number (displayed to users)
- **`tag`**: Git tag to checkout (must exist in repo!)
- **`label`**: UI label (e.g., "Latest", "Stable", "Beta")
- **`isDefault`**: If `true`, this version opens by default
- **`deployPath`**: Where to deploy (relative to site root)
- **`releaseDate`**: ISO date or human-readable date

#### Status Types
- **`label`**: Displayed in UI badge
- **`color`**: Hex color for badge background
- **`clickable`**: If `false`, card is disabled in UI

### Configuration Usage Patterns

#### Adding a New Version
```json
{
  "versions": [
    {
      "version": "0.3.0",              // NEW VERSION
      "tag": "feature-a-v0.3.0",       // Create this tag first!
      "label": "Latest",
      "isDefault": true,                // Make this the default
      "deployPath": "feature-a/v0.3.0",
      "releaseDate": "2025-10-24"
    },
    {
      "version": "0.2.0",              // OLD LATEST
      "tag": "feature-a-v0.2.0",
      "label": "Stable",
      "isDefault": false,               // No longer default
      "deployPath": "feature-a/v0.2.0",
      "releaseDate": "2025-10-23"
    }
    // Can keep or remove v0.1.0 depending on needs
  ]
}
```

#### Retiring a Version
```json
{
  "versions": [
    {
      "version": "0.3.0",
      "tag": "feature-a-v0.3.0",
      "label": "Latest",
      "isDefault": true,
      "deployPath": "feature-a/v0.3.0",
      "releaseDate": "2025-10-24"
    }
    // v0.2.0 and v0.1.0 removed - won't be deployed
    // Tags still exist in Git for rollback if needed
  ]
}
```

#### Temporarily Hiding a Flavor
```json
{
  "key": "feature-b",
  "visible": false,              // Hidden from landing page
  "status": "development",       // Shows "In Development" if accessed directly
  "versions": [...]              // Versions still deployed, just not advertised
}
```

---

## Deployment Workflow

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

**Trigger**: Push to `main` branch

**Process**:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]  # Only main triggers deployment
  workflow_dispatch:      # Manual trigger option

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      # 1. Setup
      - name: Checkout and setup
        run: |
          git clone --depth 50 $REPO repo
          cd repo
      
      # 2. Install tools
      - name: Install dependencies
        run: sudo apt-get install -y jq tree rsync
      
      # 3. Parse config and checkout versions
      - name: Parse config and checkout versions
        run: |
          CONFIG="repo/flavors-config.json"
          FLAVOR_COUNT=$(jq '.flavors | length' $CONFIG)
          
          for ((i=0; i<$FLAVOR_COUNT; i++)); do
            FLAVOR_KEY=$(jq -r ".flavors[$i].key" $CONFIG)
            VERSION_COUNT=$(jq ".flavors[$i].versions | length" $CONFIG)
            
            for ((j=0; j<$VERSION_COUNT; j++)); do
              TAG=$(jq -r ".flavors[$i].versions[$j].tag" $CONFIG)
              CHECKOUT_DIR="checkout_${FLAVOR_KEY}_${VERSION}"
              
              # Clone specific tag
              git clone --depth 1 --branch $TAG $REPO $CHECKOUT_DIR
            done
          done
      
      # 4. Generate version.json for each checkout
      - name: Generate version metadata
        run: |
          # For each checkout, create version.json with:
          # - version, date, commit, buildNumber, flavor, tag
          # Using jq to create JSON
      
      # 5. Build deployment structure
      - name: Build deployment structure
        run: |
          mkdir -p deploy
          
          # Copy main branch files
          cp repo/index.html deploy/
          cp repo/flavors-config.json deploy/
          cp -r repo/shared deploy/
          
          # Copy each version to its deployPath
          for checkout in checkout_*; do
            # Parse flavor and version from directory name
            # Get deployPath from config
            # Copy to deploy/{deployPath}/
          done
      
      # 6. Deploy to gh-pages
      - name: Deploy to GitHub Pages
        run: |
          cd deploy
          git init
          git checkout -b gh-pages
          git add -A
          git commit -m "deploy: update from main @ $SHA"
          git push --force $REPO gh-pages
```

### Workflow Key Points

1. **Config-Driven**: Reads `flavors-config.json` to determine what to deploy
2. **Tag-Based**: Checks out specific Git tags for each version
3. **Nested Structure**: Creates `{flavor}/{version}/` directories
4. **Version Metadata**: Auto-generates `version.json` for each deployed version
5. **Force Push**: Uses `--force` on gh-pages to keep it clean (orphan branch)
6. **Error Handling**: Uses `continue-on-error` for missing branches/tags

---

## UI/UX Components

### 1. Landing Page (Flavor Selector)

**File**: `index.html` in `main` branch

**Purpose**: Entry point where users choose a flavor

**Features**:
- Dynamically loads flavors from `flavors-config.json`
- Shows status badges (Live, Beta, Coming Soon)
- Displays version numbers
- Cards are clickable (if status.clickable == true)
- Mobile-optimized grid layout

**Behavior**:
- On click → Navigate to `/{deployPath}/`
- localStorage saves last selected flavor
- Can accept `?flavor=key` query parameter

**Key Code Pattern**:
```javascript
async function init() {
  const config = await fetch('./flavors-config.json').then(r => r.json());
  const visibleFlavors = config.flavors.filter(f => f.visible);
  
  visibleFlavors.forEach(flavor => {
    const defaultVersion = flavor.versions.find(v => v.isDefault);
    // Build card for flavor
    // On click: navigate to defaultVersion.deployPath
  });
}
```

### 2. Shared Components

**Location**: `shared/` directory in `main` branch

**Loaded by**: All feature version pages

**Components**:
- `flavor-switcher.js` - Version/flavor switcher logic
- `flavor-switcher.css` - Switcher styling

#### flavor-switcher.js Features

**Version Badge**:
- Displays current version (loaded from `version.json`)
- Clickable → Opens changelog modal
- Icon: Tag icon
- Position: Top navigation bar

**Flavor Switcher Button**:
- Icon: Flask icon
- Clickable → Opens switcher modal
- Position: Top navigation bar, next to version badge

**Changelog Modal**:
- Fetches `CHANGELOG.md` from current directory
- Converts Markdown to HTML (client-side)
- Scrollable content
- Close via button, backdrop click, or ESC key
- Mobile-optimized

**Version/Flavor Switcher Modal**:
- Fetches `flavors-config.json` from root
- Groups versions by flavor
- Shows current selection
- Lists all available versions
- Clicking version → Navigate to that deployPath
- Mobile-optimized

**Path Detection**:
```javascript
function detectCurrentPath() {
  const path = window.location.pathname;
  const match = path.match(/\/(feature-a|feature-b|feature-c)\/(v[\d.]+)\//);
  
  if (match) {
    return {
      flavor: match[1],
      version: match[2],
      basePath: `/${match[1]}/${match[2]}`,
      isNested: true
    };
  }
  
  return { flavor: 'unknown', version: 'unknown', isNested: false };
}
```

### 3. Feature Version Pages

**Location**: `{flavor}/{version}/` in gh-pages

**Files**:
- `index.html` - App UI (loads shared components)
- `script.js` - App logic
- `styles.css` - App styling
- `version.json` - Metadata
- `CHANGELOG.md` - Version history

**Shared Component Integration**:
```html
<head>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="../../shared/flavor-switcher.css">
</head>
<body>
  <!-- App content -->
  <script src="script.js"></script>
  <script src="../../shared/flavor-switcher.js"></script>
</body>
```

**Relative Path Logic**:
- From `feature-a/v0.2.0/index.html`:
  - To shared: `../../shared/`
  - To root config: `../../flavors-config.json`
  - To own files: `./script.js`, `./version.json`

---

## File Structure

### Complete Repository Structure

```
repository/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # CI/CD workflow
│
├── main branch/
│   ├── index.html                        # Landing page
│   ├── flavors-config.json               # Configuration
│   ├── shared/                           # Shared components
│   │   ├── flavor-switcher.js
│   │   └── flavor-switcher.css
│   ├── README.md                         # Project overview
│   ├── SETUP.md                          # Setup instructions
│   └── ARCHITECTURE.md                   # This document
│
├── feature-a branch/
│   ├── index.html                        # App UI
│   ├── script.js                         # App logic
│   ├── styles.css                        # App styling
│   ├── version.json                      # Version metadata
│   ├── CHANGELOG.md                      # Version history
│   └── (optional) assets/, js/, etc.
│
├── feature-b branch/                     # Same structure as feature-a
├── feature-c branch/                     # Same structure as feature-a
│
└── gh-pages branch/ (auto-generated)
    ├── index.html                        # From main
    ├── flavors-config.json               # From main
    ├── shared/                           # From main
    │   ├── flavor-switcher.js
    │   └── flavor-switcher.css
    ├── feature-a/
    │   ├── v0.2.0/                       # From tag feature-a-v0.2.0
    │   │   ├── index.html
    │   │   ├── script.js
    │   │   ├── styles.css
    │   │   ├── version.json              # Auto-generated by workflow
    │   │   └── CHANGELOG.md
    │   └── v0.1.0/                       # From tag v0.1.0
    │       └── (same files)
    ├── feature-b/
    │   ├── v0.2.0/
    │   └── v0.1.0/
    └── feature-c/
        ├── v0.2.0/
        └── v0.1.0/
```

### File Descriptions

#### version.json
**Purpose**: Metadata about the deployed version

**Auto-generated by workflow**

**Schema**:
```json
{
  "version": "0.2.0",
  "date": "2025-10-23",
  "commit": "abc123",
  "buildNumber": 42,
  "flavor": "Feature A",
  "tag": "feature-a-v0.2.0"
}
```

#### CHANGELOG.md
**Purpose**: Document changes for each version

**Format**: Keep a Changelog format

**Structure**:
```markdown
# Changelog - Feature A

## [0.2.0] - 2025-10-23

### Changed
- Version milestone update
- Enhanced documentation

### Technical
- Added branch-specific tag: `feature-a-v0.2.0`

## [0.1.0] - 2025-10-23

### Added
- Initial release
- Core features

---

[0.2.0]: https://github.com/org/repo/releases/tag/feature-a-v0.2.0
[0.1.0]: https://github.com/org/repo/releases/tag/v0.1.0
```

---

## Implementation Details

### Critical Implementation Notes

#### 1. Git Tag Limitations
**Problem**: Git tags are global to the repository. You cannot have the same tag name pointing to different commits.

**Impact**: If you try to tag multiple branches with `v0.2.0`, only the first will succeed.

**Solution**: Use branch-specific tag naming: `feature-a-v0.2.0`, `feature-b-v0.2.0`

#### 2. Relative Path Consistency
**Problem**: Shared components must be referenced with correct relative paths from nested version directories.

**Solution**: Always use `../../shared/` from version pages (`feature-a/v0.2.0/` → `../../` gets to root)

#### 3. Config Changes Trigger Deployment
**Design**: Push to `main` branch triggers the workflow, not push to feature branches or tags.

**Rationale**: Prevents accidental deployments. Explicit control via config update.

#### 4. Storage Efficiency
**Design**: Only versions listed in config are deployed.

**Benefit**: Can have 100 tags in Git, but only deploy 2-3 versions, saving storage and build time.

#### 5. Workflow Must Install jq
**Requirement**: Workflow uses `jq` for JSON parsing in bash scripts.

**Installation**: `sudo apt-get install -y jq`

#### 6. Version.json Generation
**When**: During workflow execution, not stored in feature branches.

**Why**: Ensures accurate metadata (commit hash, build number) at deployment time.

#### 7. Force Orphan on gh-pages
**Why**: Keeps gh-pages branch clean without history bloat.

**Trade-off**: Can't see deployment history in gh-pages branch, but that's okay since main branch tracks config changes.

### Common Pitfalls

#### Pitfall 1: Forgetting to Push Tags
**Problem**: Config references `feature-a-v0.2.0` but tag not pushed to remote.

**Result**: Workflow fails to checkout, version not deployed.

**Solution**: Always push tags: `git push origin --tags`

#### Pitfall 2: Tag Name Mismatch
**Problem**: Config says `"tag": "feature-a-v0.2.0"` but actual tag is `v0.2.0`

**Result**: Workflow can't find tag, skips that version.

**Solution**: Double-check tag names match exactly (case-sensitive).

#### Pitfall 3: isDefault on Multiple Versions
**Problem**: Two versions in same flavor have `"isDefault": true`

**Result**: Undefined behavior (last one wins).

**Solution**: Only one version per flavor should have `isDefault: true`.

#### Pitfall 4: Missing Shared Components
**Problem**: Feature branch doesn't load shared components.

**Result**: No version/flavor switcher, broken UI.

**Solution**: Every feature's `index.html` must include:
```html
<link rel="stylesheet" href="../../shared/flavor-switcher.css">
<script src="../../shared/flavor-switcher.js"></script>
```

#### Pitfall 5: Circular References in Landing Page
**Problem**: Landing page tries to load itself as a flavor.

**Result**: Infinite redirect or confusion.

**Solution**: Landing page is at root, flavors are at `{flavor}/{version}/`. Never mix.

---

## Developer Workflows

### Workflow 1: Create New Feature Branch

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature-d

# 3. Remove main-specific files
rm -rf .github shared flavors-config.json SETUP.md

# 4. Copy template from existing feature
git checkout feature-a -- index.html script.js styles.css

# 5. Customize for new feature
# Edit files, change branding, implement features

# 6. Create version files
cat > version.json <<EOF
{
  "version": "0.1.0",
  "date": "$(date +%Y-%m-%d)",
  "commit": "initial",
  "buildNumber": 1,
  "flavor": "Feature D"
}
EOF

cat > CHANGELOG.md <<EOF
# Changelog - Feature D

## [0.1.0] - $(date +%Y-%m-%d)

### Added
- Initial release of Feature D

---

[0.1.0]: https://github.com/org/repo/releases/tag/v0.1.0
EOF

# 7. Commit and tag
git add -A
git commit -m "feat: Feature D v0.1.0 - initial release"
git tag v0.1.0

# 8. Push (but don't deploy yet)
git push origin feature-d
git push origin --tags

# 9. Update main config to publish
git checkout main
# Edit flavors-config.json, add Feature D with version 0.1.0
git commit -m "deploy: publish Feature D v0.1.0"
git push origin main  # ← This triggers deployment
```

### Workflow 2: Release New Version of Existing Feature

```bash
# 1. Checkout feature branch
git checkout feature-a
git pull origin feature-a

# 2. Make changes
# Edit files, add features, fix bugs

# 3. Update CHANGELOG.md
# Add new version section at top

# 4. Commit changes
git add -A
git commit -m "feat: add new feature X"

# 5. Tag new version
git tag feature-a-v0.3.0

# 6. Push
git push origin feature-a
git push origin --tags

# 7. Update main config
git checkout main
git pull origin main

# Edit flavors-config.json:
# - Add new version 0.3.0 to feature-a.versions
# - Set isDefault: true for new version
# - Change old default to isDefault: false
# - Optionally remove oldest version

git commit -m "deploy: publish feature-a v0.3.0"
git push origin main  # ← Triggers deployment
```

### Workflow 3: Rollback a Version

```bash
# Option A: Remove from config (recommended)
git checkout main
# Edit flavors-config.json, remove the problematic version
git commit -m "deploy: retire feature-a v0.3.0 (issues found)"
git push origin main

# Option B: Change default to older version
git checkout main
# Edit flavors-config.json:
# - Set isDefault: true on v0.2.0
# - Set isDefault: false on v0.3.0
git commit -m "deploy: rollback feature-a default to v0.2.0"
git push origin main

# Option C: Delete tag and redeploy
git tag -d feature-a-v0.3.0
git push origin :refs/tags/feature-a-v0.3.0  # Delete remote tag
# Update config to remove v0.3.0
git push origin main
```

### Workflow 4: Update Shared Components

```bash
# 1. Checkout main
git checkout main
git pull origin main

# 2. Edit shared components
# Modify shared/flavor-switcher.js or shared/flavor-switcher.css

# 3. Commit
git commit -am "feat: enhance version switcher UI"

# 4. Push
git push origin main  # ← Triggers redeployment

# All versions will now use updated shared components!
```

### Workflow 5: Sync Shared Components to Local Testing

```bash
# When testing a feature branch locally, you need shared/ directory

# Option 1: Temporarily copy for testing
git checkout feature-a
git checkout main -- shared/
# Test locally
# Don't commit shared/ to feature branch

# Option 2: Set up local symlink
cd /path/to/repo
git checkout feature-a
ln -s ../shared shared  # Symlink to main's shared
# Add shared/ to .gitignore for feature branches
```

---

## Advanced Topics

### Multi-Environment Support

**Concept**: Deploy to different environments (staging, production)

**Implementation**:
```json
{
  "environments": {
    "staging": {
      "baseUrl": "https://staging.example.com",
      "deploySuffix": "-staging"
    },
    "production": {
      "baseUrl": "https://example.com",
      "deploySuffix": ""
    }
  }
}
```

Workflow can check environment and adjust deployment paths accordingly.

### Automatic Version Incrementing

**Concept**: Auto-increment version numbers based on commit messages.

**Implementation**: Add a workflow step that:
1. Parses commits since last tag
2. Determines bump type (major/minor/patch) from conventional commits
3. Creates new tag
4. Updates config

**Tools**: semantic-release, standard-version

### Analytics Integration

**Concept**: Track which versions/flavors users are viewing.

**Implementation**: Add analytics snippet to shared components:
```javascript
// In flavor-switcher.js
const currentPath = detectCurrentPath();
analytics.track('flavor_view', {
  flavor: currentPath.flavor,
  version: currentPath.version
});
```

### A/B Testing

**Concept**: Randomly assign users to different versions.

**Implementation**: Landing page randomly selects a version:
```javascript
const versions = flavor.versions.filter(v => v.abTest === true);
const randomVersion = versions[Math.floor(Math.random() * versions.length)];
```

---

## Troubleshooting Guide

### Workflow Fails: "Tag not found"

**Symptoms**: GitHub Actions fails with "fatal: couldn't find remote ref refs/tags/feature-a-v0.2.0"

**Cause**: Tag referenced in config doesn't exist in remote repository.

**Solution**:
```bash
# Check local tags
git tag -l

# Check remote tags
git ls-remote --tags origin

# Push missing tags
git push origin --tags
```

### Version Page Shows 404

**Symptoms**: Clicking a flavor on landing page gives 404 error.

**Causes**:
1. Workflow failed to deploy that version
2. `deployPath` in config doesn't match actual deployed path
3. GitHub Pages not enabled

**Solution**:
1. Check GitHub Actions logs for errors
2. Verify `deployPath` matches: `{flavor}/v{version}`
3. Enable GitHub Pages: Settings → Pages → Source: gh-pages branch

### Shared Components Not Loading

**Symptoms**: Version switcher missing, no version badge.

**Causes**:
1. Incorrect relative path in feature's `index.html`
2. Shared files not in gh-pages branch

**Solution**:
1. Verify path is `../../shared/` from `{flavor}/{version}/index.html`
2. Check gh-pages branch has `shared/` directory at root
3. Verify workflow copies shared files: `cp -r main/shared deploy/`

### Changelog Shows "Not Available"

**Symptoms**: Clicking version badge shows "Changelog not available"

**Causes**:
1. CHANGELOG.md missing from feature branch
2. CHANGELOG.md not deployed to gh-pages
3. Incorrect filename (case-sensitive)

**Solution**:
1. Add CHANGELOG.md to feature branch
2. Ensure workflow copies all files from tag checkout
3. Verify filename is exactly `CHANGELOG.md` (not `changelog.md`)

### Version Switcher Shows Wrong Current Version

**Symptoms**: Version badge shows wrong version, or "v?"

**Causes**:
1. version.json not found
2. version.json malformed
3. Path detection regex failing

**Solution**:
1. Check `{flavor}/{version}/version.json` exists and loads
2. Validate JSON syntax
3. Test path detection: `console.log(detectCurrentPath())`

### Landing Page Shows No Flavors

**Symptoms**: Landing page loads but shows empty grid.

**Causes**:
1. flavors-config.json not loading (404)
2. All flavors have `visible: false`
3. JavaScript error preventing rendering

**Solution**:
1. Verify `flavors-config.json` exists at root of gh-pages
2. Check at least one flavor has `"visible": true`
3. Open browser console, check for JavaScript errors

---

## Maintenance Checklist

### Daily Maintenance
- [ ] Monitor GitHub Actions for failed workflows
- [ ] Check GitHub Pages site is accessible
- [ ] Review any error reports from users

### Weekly Maintenance
- [ ] Review and merge feature branch updates
- [ ] Check for outdated dependencies (if any)
- [ ] Verify all deployed versions still work

### Monthly Maintenance
- [ ] Review deployed versions, retire old ones if needed
- [ ] Update documentation (README, CHANGELOG)
- [ ] Check GitHub storage usage
- [ ] Review analytics (if implemented)

### Quarterly Maintenance
- [ ] Major version updates (if planned)
- [ ] Review and refactor shared components
- [ ] Audit flavors-config.json for accuracy
- [ ] Update branch protection rules
- [ ] Review and update workflows for security

---

## Security Considerations

### 1. Branch Protection
**Recommendation**: Protect `main` branch
- Require pull request reviews
- Require status checks (linting, tests)
- Prevent force-push
- Prevent deletion

### 2. Workflow Permissions
**Current**: `contents: write` for deployment

**Best Practice**: Use `GITHUB_TOKEN` with minimal scope

### 3. Input Validation
**Risk**: Config injection if flavors-config.json is user-editable

**Mitigation**: 
- Schema validation in workflow
- Sanitize paths (no `../` escapes)
- Whitelist allowed characters in deployPath

### 4. Dependency Management
**Risk**: Compromised external resources (CDNs, libraries)

**Mitigation**:
- Use Subresource Integrity (SRI) for CDN resources
- Vendor critical dependencies
- Regular security audits

---

## Performance Considerations

### Build Time Optimization
**Current**: Workflow clones entire repo for each tag

**Optimization**: Use shallow clones (`--depth 1`) ✅ Already implemented

### GitHub Pages Caching
**Recommendation**: Add cache headers

**Implementation**: Create `_headers` file in deploy directory:
```
/*
  Cache-Control: public, max-age=3600
  
/shared/*
  Cache-Control: public, max-age=86400
  
/*/v*/*
  Cache-Control: public, max-age=604800
```

### Client-Side Performance
**Current**: Fetches config on every page load

**Optimization**:
- Use localStorage caching
- Add `Cache-Control` headers
- Minimize config file size

---

## Future Enhancements

### Potential Improvements

1. **Automated Changelog Generation**
   - Parse conventional commits
   - Auto-generate CHANGELOG.md
   - Include in workflow

2. **Version Comparison View**
   - Side-by-side comparison of two versions
   - Diff highlighting
   - Feature matrix

3. **User Preferences**
   - Remember last viewed version
   - Dark/light theme
   - Accessibility settings

4. **RSS/Atom Feed**
   - Subscribe to flavor updates
   - Release notifications
   - Changelog feed

5. **API Endpoint**
   - Programmatic access to version info
   - Latest version lookup
   - Changelog API

6. **Automated Testing**
   - Visual regression tests
   - E2E tests for each version
   - Cross-browser testing

---

## Conclusion

This architecture provides a robust, maintainable system for managing multiple implementations with version control. Key benefits:

- **Configuration-driven**: Single source of truth
- **Storage-efficient**: Only deploy what's needed
- **Developer-friendly**: Clear workflows and processes
- **User-friendly**: Easy version/flavor switching
- **Maintainable**: Centralized shared components
- **Scalable**: Add flavors/versions without code changes

The system is production-ready and can be adapted to various project types beyond web applications.

---

## Appendix: Quick Reference

### Key Commands

```bash
# Create new version
git tag {flavor}-v{version}
git push origin --tags

# Deploy
git checkout main
# Edit flavors-config.json
git push origin main

# Rollback
# Edit flavors-config.json, remove version
git push origin main

# View deployed site
open https://{org}.github.io/{repo}/

# Check workflow status
gh run list --workflow=deploy.yml
```

### Key Files

- `flavors-config.json` - Controls deployment
- `shared/flavor-switcher.js` - Version/flavor switcher
- `version.json` - Version metadata (auto-generated)
- `CHANGELOG.md` - Version history
- `.github/workflows/deploy.yml` - CI/CD pipeline

### Key URLs

- Landing page: `https://{org}.github.io/{repo}/`
- Specific version: `https://{org}.github.io/{repo}/{flavor}/v{version}/`
- Config: `https://{org}.github.io/{repo}/flavors-config.json`

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-23  
**Maintainer**: Generated by AI based on implementation discussion

