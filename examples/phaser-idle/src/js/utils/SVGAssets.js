/**
 * SVG Assets for the game
 * This file contains SVG strings that can be used to create game assets
 */

export const SVG = {
    // Dough - a simple beige circle
    dough: `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#f5e6c8" stroke="#e6d2a8" stroke-width="4"/>
    </svg>
    `,
    
    // Progress bar background - a rounded rectangle
    progressBarBg: `
    <svg width="300" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="300" height="40" rx="10" ry="10" fill="#dddddd" stroke="#bbbbbb" stroke-width="2"/>
    </svg>
    `,
    
    // Progress bar fill - a rounded rectangle with yellow color
    progressBarFill: `
    <svg width="300" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="300" height="40" rx="10" ry="10" fill="#f8d568" stroke="#e8c558" stroke-width="2"/>
    </svg>
    `
};

/**
 * Creates a data URL from an SVG string
 * @param {string} svgString - The SVG string to convert
 * @returns {string} - A data URL that can be used as an image source
 */
export function svgToDataURL(svgString) {
    const encoded = encodeURIComponent(svgString)
        .replace(/'/g, '%27')
        .replace(/"/g, '%22');
    
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

/**
 * Preloads SVG assets into a Phaser scene
 * @param {Phaser.Scene} scene - The scene to load assets into
 */
export function preloadSVGAssets(scene) {
    // Load each SVG asset as a data URL
    Object.entries(SVG).forEach(([key, svg]) => {
        const dataURL = svgToDataURL(svg);
        scene.load.image(key, dataURL);
        console.log(`Loading SVG asset: ${key}`);
    });
} 