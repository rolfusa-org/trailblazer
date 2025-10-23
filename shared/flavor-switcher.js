// ===== TOGETHERING SHARED COMPONENTS =====
// Flavor & Version Switcher + Changelog Modal
// Version: 2.0.0
// This file is shared across all flavor branches
// Supports nested version paths: /flavor/vX.Y.Z/

(function() {
    'use strict';
    
    // ===== PATH DETECTION =====
    // Parse URL to detect current flavor and version
    // Examples: /html/v1.0.0/ → {flavor: 'html', version: 'v1.0.0', basePath: '/html/v1.0.0'}
    function detectCurrentPath() {
        const path = window.location.pathname;
        const match = path.match(/\/(html|pwa|nextjs)\/(v[\d.]+)\//);
        
        if (match) {
            return {
                flavor: match[1],
                version: match[2],
                basePath: `/${match[1]}/${match[2]}`,
                isNested: true
            };
        }
        
        // Fallback for non-nested paths (local development)
        return {
            flavor: 'html',
            version: 'unknown',
            basePath: '',
            isNested: false
        };
    }
    
    const currentPath = detectCurrentPath();
    console.log('Current path:', currentPath);
    
    // ===== MODALS HTML =====
    // Create changelog modal
    const modalHTML = `
        <div id="changelogModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0, 0, 0, 0.8); z-index: 10000; padding: 20px; overflow-y: auto;">
            <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); position: relative; animation: slideIn 0.3s ease;">
                <div style="position: sticky; top: 0; background: linear-gradient(135deg, #54B9BE 0%, #4a9fa3 100%); 
                    color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; 
                    justify-content: space-between; align-items: center; z-index: 1;">
                    <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-history"></i> Changelog
                    </h2>
                    <button id="closeChangelogBtn" style="background: rgba(255, 255, 255, 0.2); 
                        border: none; color: white; width: 40px; height: 40px; border-radius: 50%; 
                        cursor: pointer; font-size: 24px; display: flex; align-items: center; 
                        justify-content: center; transition: all 0.2s;" 
                        onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                        onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="changelogContent" style="padding: 30px; max-height: calc(90vh - 100px); 
                    overflow-y: auto; line-height: 1.6; color: #333;">
                    <div style="text-align: center; padding: 40px; color: #999;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
                        <p style="margin-top: 16px;">Loading changelog...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Create flavor & version switcher modal
    const switcherModalHTML = `
        <div id="flavorSwitcherModal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0, 0, 0, 0.8); z-index: 10001; padding: 20px; overflow-y: auto;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; 
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); position: relative; animation: slideIn 0.3s ease;">
                <div style="position: sticky; top: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; 
                    justify-content: space-between; align-items: center; z-index: 1;">
                    <h2 style="margin: 0; font-size: 24px; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-flask"></i> Switch Flavor & Version
                    </h2>
                    <button id="closeSwitcherBtn" style="background: rgba(255, 255, 255, 0.2); 
                        border: none; color: white; width: 40px; height: 40px; border-radius: 50%; 
                        cursor: pointer; font-size: 24px; display: flex; align-items: center; 
                        justify-content: center; transition: all 0.2s;" 
                        onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" 
                        onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="switcherContent" style="padding: 24px;">
                    <p style="text-align: center; color: #999; margin-bottom: 20px; font-size: 14px;">
                        Currently viewing: <strong id="currentFlavorVersion">Loading...</strong>
                    </p>
                    <div id="switcherOptions"></div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', switcherModalHTML);
    
    // ===== NAVIGATION BUTTONS =====
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
        // Flavor/Version switcher button
        const switcherBtn = document.createElement('button');
        switcherBtn.className = 'nav-btn flavor-switcher-btn';
        switcherBtn.title = 'Switch Flavor or Version';
        switcherBtn.id = 'flavorSwitcherBtn';
        switcherBtn.innerHTML = '<i class="fas fa-flask"></i>';
        switcherBtn.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 16px; cursor: pointer;';
        navActions.insertBefore(switcherBtn, navActions.firstChild);
        
        // Version badge
        const versionBadge = document.createElement('button');
        versionBadge.className = 'nav-btn version-badge';
        versionBadge.title = 'View Changelog';
        versionBadge.id = 'versionBadge';
        versionBadge.innerHTML = '<i class="fas fa-tag"></i> <span id="versionText">v?</span>';
        versionBadge.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 14px; cursor: pointer;';
        navActions.insertBefore(versionBadge, navActions.firstChild);
        
        // Load version info
        fetch('./version.json')
            .then(r => r.json())
            .then(data => {
                document.getElementById('versionText').textContent = `v${data.version}`;
                console.log('Version loaded:', data);
            })
            .catch(e => {
                console.log('Version info not available:', e);
                if (currentPath.version !== 'unknown') {
                    document.getElementById('versionText').textContent = currentPath.version;
                }
            });
        
        // Event listeners
        versionBadge.addEventListener('click', (e) => {
            e.preventDefault();
            showChangelog();
        });
        
        switcherBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSwitcher();
        });
    }
    
    // ===== CHANGELOG FUNCTIONS =====
    function showChangelog() {
        const modal = document.getElementById('changelogModal');
        const content = document.getElementById('changelogContent');
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Fetch changelog from current version path
        fetch('./CHANGELOG.md')
            .then(r => {
                if (!r.ok) throw new Error('Changelog not found');
                return r.text();
            })
            .then(markdown => {
                content.innerHTML = convertMarkdownToHTML(markdown);
            })
            .catch(err => {
                content.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #e53e3e;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
                        <p style="font-size: 18px; margin: 0;">Changelog not available</p>
                        <p style="color: #999; margin-top: 8px; font-size: 14px;">${err.message}</p>
                    </div>
                `;
            });
    }
    
    function convertMarkdownToHTML(markdown) {
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
        html = '<p>' + html + '</p>';
        
        return html;
    }
    
    function closeChangelog() {
        const modal = document.getElementById('changelogModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // ===== SWITCHER FUNCTIONS =====
    function showSwitcher() {
        const modal = document.getElementById('flavorSwitcherModal');
        const optionsContainer = document.getElementById('switcherOptions');
        const currentDisplay = document.getElementById('currentFlavorVersion');
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Show loading
        optionsContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        // Fetch config - try multiple paths for compatibility
        const configPath = currentPath.isNested ? '../../flavors-config.json' : '../flavors-config.json';
        
        fetch(configPath)
            .catch(() => fetch('./flavors-config.json'))
            .catch(() => fetch('../flavors-config.json'))
            .then(r => r.json())
            .then(config => {
                // Update current display
                const currentFlavor = config.flavors.find(f => f.key === currentPath.flavor);
                if (currentFlavor) {
                    currentDisplay.textContent = `${currentFlavor.name} ${currentPath.version}`;
                } else {
                    currentDisplay.textContent = `${currentPath.flavor} ${currentPath.version}`;
                }
                
                // Build switcher UI
                buildSwitcherUI(config, optionsContainer);
            })
            .catch(err => {
                console.error('Failed to load config:', err);
                optionsContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #e53e3e;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p style="margin-top: 10px;">Failed to load options</p>
                        <p style="font-size: 12px; color: #999; margin-top: 8px;">Config path: ${configPath}</p>
                    </div>
                `;
            });
    }
    
    function buildSwitcherUI(config, container) {
        container.innerHTML = '';
        
        const visibleFlavors = config.flavors.filter(f => f.visible && f.versions.length > 0);
        
        if (visibleFlavors.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999;">No flavors available</div>';
            return;
        }
        
        visibleFlavors.forEach(flavor => {
            const flavorSection = document.createElement('div');
            flavorSection.style.cssText = 'margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #eee;';
            
            // Flavor header
            const header = document.createElement('div');
            header.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 12px;';
            
            const statusInfo = config.statusTypes[flavor.status] || {};
            const statusBadge = `<span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: ${statusInfo.color}; color: white;">${statusInfo.label || flavor.status}</span>`;
            
            header.innerHTML = `
                <i class="fas ${flavor.icon}" style="font-size: 18px; color: #667eea;"></i>
                <strong style="font-size: 16px;">${flavor.name}</strong>
                ${statusBadge}
            `;
            flavorSection.appendChild(header);
            
            // Version list
            if (flavor.versions && flavor.versions.length > 0) {
                flavor.versions.forEach(version => {
                    const isCurrent = flavor.key === currentPath.flavor && version.version === currentPath.version.replace('v', '');
                    
                    const versionCard = document.createElement('div');
                    versionCard.style.cssText = `
                        padding: 12px 16px;
                        margin: 8px 0;
                        border-radius: 8px;
                        border: 2px solid ${isCurrent ? '#667eea' : '#e2e8f0'};
                        background: ${isCurrent ? '#f7fafc' : 'white'};
                        cursor: ${isCurrent ? 'default' : 'pointer'};
                        transition: all 0.2s;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    `;
                    
                    if (!isCurrent) {
                        versionCard.onmouseover = () => versionCard.style.borderColor = '#667eea';
                        versionCard.onmouseout = () => versionCard.style.borderColor = '#e2e8f0';
                        versionCard.onclick = () => switchTo(version.deployPath);
                    }
                    
                    const versionLabel = version.label ? ` <span style="color: #999; font-size: 12px;">(${version.label})</span>` : '';
                    const currentBadge = isCurrent ? '<span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: #667eea; color: white;">Current</span>' : '';
                    
                    versionCard.innerHTML = `
                        <div>
                            <strong>v${version.version}</strong>${versionLabel}
                            ${version.releaseDate ? `<div style="font-size: 12px; color: #999; margin-top: 2px;">${version.releaseDate}</div>` : ''}
                        </div>
                        ${currentBadge}
                    `;
                    
                    flavorSection.appendChild(versionCard);
                });
            }
            
            container.appendChild(flavorSection);
        });
    }
    
    function switchTo(deployPath) {
        const basePath = window.location.origin + window.location.pathname.split('/').slice(0, -3).join('/');
        const newURL = `${basePath}/${deployPath}/`;
        console.log('Switching to:', newURL);
        window.location.href = newURL;
    }
    
    function closeSwitcher() {
        const modal = document.getElementById('flavorSwitcherModal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    // ===== EVENT LISTENERS =====
    document.getElementById('closeChangelogBtn').addEventListener('click', closeChangelog);
    document.getElementById('closeSwitcherBtn').addEventListener('click', closeSwitcher);
    
    // Close on backdrop click
    document.getElementById('changelogModal').addEventListener('click', (e) => {
        if (e.target.id === 'changelogModal') closeChangelog();
    });
    
    document.getElementById('flavorSwitcherModal').addEventListener('click', (e) => {
        if (e.target.id === 'flavorSwitcherModal') closeSwitcher();
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const changelogModal = document.getElementById('changelogModal');
            const switcherModal = document.getElementById('flavorSwitcherModal');
            
            if (changelogModal.style.display === 'block') {
                closeChangelog();
            } else if (switcherModal.style.display === 'block') {
                closeSwitcher();
            }
        }
    });
    
    console.log('Togethering Shared Components v2.0 loaded');
})();
