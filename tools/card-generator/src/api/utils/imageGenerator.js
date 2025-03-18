/**
 * Generates a default image for a card based on its properties
 * @param {Object} card - The card object
 * @returns {String} - Data URL for the generated SVG image
 */
function generateCardImage(card) {
  // Create a data URL for an SVG image with the creature or concept
  const cardType = card.type || 'minion';
  const cardName = card.name || 'Unknown Card';
  const cardRarity = card.rarity || 'common';
  
  // Define colors based on card rarity for the background
  let bgColor, accentColor;
  switch (cardRarity) {
    case 'legendary':
      bgColor = '#FFD700'; // Gold
      accentColor = '#FF8C00'; // Dark Orange
      break;
    case 'epic':
      bgColor = '#9370DB'; // Medium Purple
      accentColor = '#4B0082'; // Indigo
      break;
    case 'rare':
      bgColor = '#4169E1'; // Royal Blue
      accentColor = '#0000CD'; // Medium Blue
      break;
    default: // common
      bgColor = '#708090'; // Slate Gray
      accentColor = '#2F4F4F'; // Dark Slate Gray
  }
  
  // Determine what kind of image to generate based on card type and name
  let imageContent = '';
  
  if (cardType === 'minion') {
    // Check for specific creature types in the name or description
    const description = card.description || '';
    const lowerName = cardName.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (lowerName.includes('dragon') || lowerDesc.includes('dragon')) {
      // Dragon
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Dragon Body -->
          <ellipse cx="0" cy="0" rx="80" ry="40" fill="${accentColor}" />
          
          <!-- Dragon Head -->
          <path d="M70,-10 Q100,-20 110,0 Q100,20 70,10 Z" fill="${accentColor}" />
          
          <!-- Dragon Snout -->
          <path d="M100,0 Q120,-5 130,0 Q120,5 100,0 Z" fill="${accentColor}" />
          
          <!-- Dragon Eye -->
          <circle cx="90" cy="-5" r="5" fill="red" />
          
          <!-- Dragon Wings -->
          <path d="M0,-20 Q-20,-80 -60,-60 Q-40,-30 0,-20" fill="${accentColor}" />
          <path d="M0,20 Q-20,80 -60,60 Q-40,30 0,20" fill="${accentColor}" />
          
          <!-- Dragon Tail -->
          <path d="M-70,0 Q-100,20 -120,-10 Q-110,-20 -70,0" fill="${accentColor}" />
          
          <!-- Dragon Legs -->
          <path d="M30,30 L40,70 L50,70 L40,30" fill="${accentColor}" />
          <path d="M-30,30 L-40,70 L-50,70 L-40,30" fill="${accentColor}" />
          
          <!-- Dragon Fire -->
          <path d="M130,0 Q150,-10 170,0 Q150,10 130,0" fill="orange" />
          <path d="M150,0 Q180,-15 200,0 Q180,15 150,0" fill="yellow" />
        </g>
      `;
    } else if (lowerName.includes('elemental') || lowerDesc.includes('elemental')) {
      // Elemental
      const elementType = lowerName.includes('fire') || lowerDesc.includes('fire') ? 'fire' : 
                         lowerName.includes('water') || lowerDesc.includes('water') ? 'water' :
                         lowerName.includes('earth') || lowerDesc.includes('earth') ? 'earth' :
                         lowerName.includes('air') || lowerDesc.includes('air') ? 'air' : 'generic';
      
      let elementColor, elementShape;
      switch (elementType) {
        case 'fire':
          elementColor = '#FF4500'; // Orange Red
          elementShape = `
            <g transform="translate(150, 150)">
              <!-- Fire Elemental -->
              <path d="M0,-80 Q30,-40 20,0 Q40,30 0,80 Q-40,30 -20,0 Q-30,-40 0,-80" fill="${elementColor}" />
              <path d="M0,-60 Q20,-30 10,0 Q30,20 0,60 Q-30,20 -10,0 Q-20,-30 0,-60" fill="yellow" />
              <circle cx="0" cy="0" r="20" fill="white" />
              
              <!-- Eyes -->
              <circle cx="-10" cy="-10" r="5" fill="black" />
              <circle cx="10" cy="-10" r="5" fill="black" />
              
              <!-- Mouth -->
              <path d="M-15,15 Q0,25 15,15" fill="none" stroke="black" stroke-width="2" />
              
              <!-- Fire Particles -->
              <circle cx="-40" cy="-40" r="5" fill="yellow" />
              <circle cx="40" cy="-30" r="6" fill="yellow" />
              <circle cx="30" cy="50" r="4" fill="yellow" />
              <circle cx="-30" cy="40" r="5" fill="yellow" />
            </g>
          `;
          break;
        case 'water':
          elementColor = '#1E90FF'; // Dodger Blue
          elementShape = `
            <g transform="translate(150, 150)">
              <!-- Water Elemental -->
              <path d="M0,-70 Q80,-50 80,0 Q80,70 0,70 Q-80,70 -80,0 Q-80,-50 0,-70" fill="${elementColor}" />
              <path d="M0,-50 Q60,-40 60,0 Q60,50 0,50 Q-60,50 -60,0 Q-60,-40 0,-50" fill="#00BFFF" />
              
              <!-- Eyes -->
              <circle cx="-20" cy="-10" r="8" fill="white" />
              <circle cx="20" cy="-10" r="8" fill="white" />
              <circle cx="-20" cy="-10" r="4" fill="black" />
              <circle cx="20" cy="-10" r="4" fill="black" />
              
              <!-- Mouth -->
              <path d="M-20,20 Q0,30 20,20" fill="none" stroke="white" stroke-width="3" />
              
              <!-- Water Droplets -->
              <circle cx="-50" cy="-30" r="10" fill="#00BFFF" opacity="0.7" />
              <circle cx="40" cy="30" r="15" fill="#00BFFF" opacity="0.7" />
              <circle cx="10" cy="-40" r="8" fill="#00BFFF" opacity="0.7" />
            </g>
          `;
          break;
        case 'earth':
          elementColor = '#8B4513'; // Saddle Brown
          elementShape = `
            <g transform="translate(150, 150)">
              <!-- Earth Elemental -->
              <path d="M-60,-40 L60,-40 L80,0 L60,40 L-60,40 L-80,0 Z" fill="${elementColor}" />
              
              <!-- Rock Texture -->
              <path d="M-40,-20 L-20,-30 L0,-20 L20,-30 L40,-20 L30,0 L40,20 L20,30 L0,20 L-20,30 L-40,20 L-30,0 Z" fill="#A0522D" />
              
              <!-- Eyes -->
              <circle cx="-25" cy="-10" r="8" fill="#FFD700" />
              <circle cx="25" cy="-10" r="8" fill="#FFD700" />
              
              <!-- Mouth -->
              <path d="M-20,20 L0,30 L20,20" fill="none" stroke="#FFD700" stroke-width="3" />
              
              <!-- Rocks -->
              <circle cx="-50" cy="0" r="15" fill="#A0522D" />
              <circle cx="50" cy="0" r="15" fill="#A0522D" />
              <circle cx="0" cy="-50" r="15" fill="#A0522D" />
            </g>
          `;
          break;
        case 'air':
          elementColor = '#E6E6FA'; // Lavender
          elementShape = `
            <g transform="translate(150, 150)">
              <!-- Air Elemental -->
              <path d="M0,-60 Q60,-40 70,0 Q60,40 0,60 Q-60,40 -70,0 Q-60,-40 0,-60" fill="${elementColor}" opacity="0.7" />
              
              <!-- Swirls -->
              <path d="M-30,-30 Q-10,-40 0,-20 Q10,0 30,-10" fill="none" stroke="white" stroke-width="3" />
              <path d="M30,30 Q10,40 0,20 Q-10,0 -30,10" fill="none" stroke="white" stroke-width="3" />
              
              <!-- Eyes -->
              <circle cx="-15" cy="-10" r="5" fill="white" />
              <circle cx="15" cy="-10" r="5" fill="white" />
              
              <!-- Mouth -->
              <path d="M-10,10 Q0,15 10,10" fill="none" stroke="white" stroke-width="2" />
            </g>
          `;
          break;
        default:
          elementColor = '#9370DB'; // Medium Purple
          elementShape = `
            <g transform="translate(150, 150)">
              <!-- Generic Elemental -->
              <circle cx="0" cy="0" r="70" fill="${elementColor}" opacity="0.7" />
              <circle cx="0" cy="0" r="50" fill="${accentColor}" opacity="0.8" />
              
              <!-- Energy Aura -->
              <circle cx="0" cy="0" r="90" fill="none" stroke="${elementColor}" stroke-width="5" opacity="0.5" />
              
              <!-- Eyes -->
              <circle cx="-20" cy="-20" r="10" fill="white" />
              <circle cx="20" cy="-20" r="10" fill="white" />
              <circle cx="-20" cy="-20" r="5" fill="black" />
              <circle cx="20" cy="-20" r="5" fill="black" />
              
              <!-- Mouth -->
              <path d="M-20,20 Q0,40 20,20" fill="none" stroke="white" stroke-width="3" />
              
              <!-- Energy Particles -->
              <circle cx="-40" cy="-40" r="5" fill="white" />
              <circle cx="40" cy="-30" r="6" fill="white" />
              <circle cx="30" cy="50" r="4" fill="white" />
              <circle cx="-30" cy="40" r="5" fill="white" />
            </g>
          `;
      }
      
      imageContent = elementShape;
    } else {
      // Generic creature based on stats
      const size = Math.min(100, Math.max(30, (card.attack || 1) * 10 + (card.health || 1) * 5));
      
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Creature Body -->
          <ellipse cx="0" cy="0" rx="${size}" ry="${size * 0.6}" fill="${accentColor}" />
          
          <!-- Creature Head -->
          <circle cx="${size * 0.7}" cy="0" r="${size * 0.3}" fill="${accentColor}" />
          
          <!-- Eyes -->
          <circle cx="${size * 0.8}" cy="${-size * 0.1}" r="${size * 0.08}" fill="white" />
          <circle cx="${size * 0.8}" cy="${size * 0.1}" r="${size * 0.08}" fill="white" />
          <circle cx="${size * 0.85}" cy="${-size * 0.1}" r="${size * 0.04}" fill="black" />
          <circle cx="${size * 0.85}" cy="${size * 0.1}" r="${size * 0.04}" fill="black" />
          
          <!-- Limbs -->
          <path d="M${-size * 0.3},${size * 0.5} L${-size * 0.1},${size} L${size * 0.2},${size * 0.5}" fill="${accentColor}" />
          <path d="M${-size * 0.3},${-size * 0.5} L${-size * 0.1},${-size} L${size * 0.2},${-size * 0.5}" fill="${accentColor}" />
          
          <!-- Tail or extra feature based on attack value -->
          ${(card.attack || 1) > 5 ? 
            `<path d="M${-size * 0.8},0 Q${-size * 1.2},${size * 0.5} ${-size * 1.5},0 Q${-size * 1.2},${-size * 0.5} ${-size * 0.8},0" fill="${accentColor}" />` : 
            `<path d="M${-size * 0.8},0 L${-size * 1.2},0" stroke="${accentColor}" stroke-width="${size * 0.1}" />`
          }
        </g>
      `;
    }
  } else if (cardType === 'spell') {
    // Generate a spell effect image
    const lowerName = cardName.toLowerCase();
    const description = card.description || '';
    const lowerDesc = description.toLowerCase();
    
    if (lowerName.includes('fire') || lowerName.includes('flame') || lowerDesc.includes('fire')) {
      // Fire spell
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Fire Spell -->
          <circle cx="0" cy="0" r="80" fill="#FF4500" opacity="0.3" />
          <circle cx="0" cy="0" r="60" fill="#FF8C00" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill="#FFA500" opacity="0.7" />
          
          <!-- Flame Tendrils -->
          <path d="M0,-40 Q20,-80 0,-100 Q-20,-80 0,-40" fill="#FF4500" />
          <path d="M40,0 Q80,-20 100,0 Q80,20 40,0" fill="#FF4500" />
          <path d="M0,40 Q20,80 0,100 Q-20,80 0,40" fill="#FF4500" />
          <path d="M-40,0 Q-80,-20 -100,0 Q-80,20 -40,0" fill="#FF4500" />
          
          <!-- Inner Flames -->
          <path d="M0,-20 Q10,-40 0,-50 Q-10,-40 0,-20" fill="#FFA500" />
          <path d="M20,0 Q40,-10 50,0 Q40,10 20,0" fill="#FFA500" />
          <path d="M0,20 Q10,40 0,50 Q-10,40 0,20" fill="#FFA500" />
          <path d="M-20,0 Q-40,-10 -50,0 Q-40,10 -20,0" fill="#FFA500" />
          
          <!-- Sparks -->
          <circle cx="30" cy="-30" r="5" fill="yellow" />
          <circle cx="-30" cy="30" r="5" fill="yellow" />
          <circle cx="30" cy="30" r="5" fill="yellow" />
          <circle cx="-30" cy="-30" r="5" fill="yellow" />
        </g>
      `;
    } else if (lowerName.includes('ice') || lowerName.includes('frost') || lowerDesc.includes('freeze')) {
      // Ice spell
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Ice Spell -->
          <circle cx="0" cy="0" r="80" fill="#ADD8E6" opacity="0.3" />
          <circle cx="0" cy="0" r="60" fill="#87CEEB" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill="#00BFFF" opacity="0.7" />
          
          <!-- Ice Crystals -->
          <path d="M0,-40 L15,-70 L0,-100 L-15,-70 Z" fill="#ADD8E6" />
          <path d="M40,0 L70,15 L100,0 L70,-15 Z" fill="#ADD8E6" />
          <path d="M0,40 L15,70 L0,100 L-15,70 Z" fill="#ADD8E6" />
          <path d="M-40,0 L-70,15 L-100,0 L-70,-15 Z" fill="#ADD8E6" />
          
          <!-- Smaller Ice Crystals -->
          <path d="M20,-20 L30,-35 L20,-50 L10,-35 Z" fill="#87CEEB" />
          <path d="M20,20 L35,30 L50,20 L35,10 Z" fill="#87CEEB" />
          <path d="M-20,20 L-30,35 L-20,50 L-10,35 Z" fill="#87CEEB" />
          <path d="M-20,-20 L-35,-30 L-50,-20 L-35,-10 Z" fill="#87CEEB" />
          
          <!-- Frost Particles -->
          <circle cx="25" cy="-25" r="3" fill="white" />
          <circle cx="-25" cy="25" r="3" fill="white" />
          <circle cx="25" cy="25" r="3" fill="white" />
          <circle cx="-25" cy="-25" r="3" fill="white" />
        </g>
      `;
    } else if (lowerName.includes('shadow') || lowerName.includes('dark') || lowerDesc.includes('shadow')) {
      // Shadow spell
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Shadow Spell -->
          <circle cx="0" cy="0" r="80" fill="#2F4F4F" opacity="0.5" />
          <circle cx="0" cy="0" r="60" fill="#483D8B" opacity="0.7" />
          <circle cx="0" cy="0" r="40" fill="#191970" opacity="0.9" />
          
          <!-- Shadow Tendrils -->
          <path d="M0,-40 Q30,-70 20,-100 Q0,-80 -20,-100 Q-30,-70 0,-40" fill="#483D8B" opacity="0.7" />
          <path d="M40,0 Q70,30 100,20 Q80,0 100,-20 Q70,-30 40,0" fill="#483D8B" opacity="0.7" />
          <path d="M0,40 Q30,70 20,100 Q0,80 -20,100 Q-30,70 0,40" fill="#483D8B" opacity="0.7" />
          <path d="M-40,0 Q-70,30 -100,20 Q-80,0 -100,-20 Q-70,-30 -40,0" fill="#483D8B" opacity="0.7" />
          
          <!-- Shadow Eyes -->
          <ellipse cx="-15" cy="-15" rx="8" ry="5" fill="#800080" opacity="0.8" />
          <ellipse cx="15" cy="-15" rx="8" ry="5" fill="#800080" opacity="0.8" />
          
          <!-- Shadow Particles -->
          <circle cx="30" cy="-30" r="5" fill="#483D8B" opacity="0.5" />
          <circle cx="-30" cy="30" r="5" fill="#483D8B" opacity="0.5" />
          <circle cx="30" cy="30" r="5" fill="#483D8B" opacity="0.5" />
          <circle cx="-30" cy="-30" r="5" fill="#483D8B" opacity="0.5" />
        </g>
      `;
    } else if (lowerName.includes('heal') || lowerName.includes('holy') || lowerDesc.includes('heal')) {
      // Holy/Healing spell
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Holy Spell -->
          <circle cx="0" cy="0" r="80" fill="#FFD700" opacity="0.3" />
          <circle cx="0" cy="0" r="60" fill="#FFA500" opacity="0.3" />
          <circle cx="0" cy="0" r="40" fill="#FFFFFF" opacity="0.7" />
          
          <!-- Light Rays -->
          <path d="M0,0 L0,-100 M0,0 L71,-71 M0,0 L100,0 M0,0 L71,71 M0,0 L0,100 M0,0 L-71,71 M0,0 L-100,0 M0,0 L-71,-71" stroke="#FFD700" stroke-width="5" opacity="0.7" />
          
          <!-- Inner Cross -->
          <path d="M0,-50 L0,50 M-50,0 L50,0" stroke="#FFFFFF" stroke-width="10" opacity="0.9" />
          
          <!-- Light Particles -->
          <circle cx="30" cy="-30" r="5" fill="white" />
          <circle cx="-30" cy="30" r="5" fill="white" />
          <circle cx="30" cy="30" r="5" fill="white" />
          <circle cx="-30" cy="-30" r="5" fill="white" />
        </g>
      `;
    } else {
      // Generic spell effect
      imageContent = `
        <g transform="translate(150, 150)">
          <!-- Generic Spell -->
          <circle cx="0" cy="0" r="80" fill="${accentColor}" opacity="0.3" />
          <circle cx="0" cy="0" r="60" fill="${accentColor}" opacity="0.5" />
          <circle cx="0" cy="0" r="40" fill="${accentColor}" opacity="0.7" />
          
          <!-- Magic Runes -->
          <circle cx="0" cy="0" r="70" fill="none" stroke="${accentColor}" stroke-width="2" />
          <circle cx="0" cy="0" r="50" fill="none" stroke="${accentColor}" stroke-width="2" />
          
          <!-- Rune Symbols -->
          <path d="M0,-20 L10,-40 L0,-60 L-10,-40 Z" fill="${accentColor}" />
          <path d="M20,0 L40,10 L60,0 L40,-10 Z" fill="${accentColor}" />
          <path d="M0,20 L10,40 L0,60 L-10,40 Z" fill="${accentColor}" />
          <path d="M-20,0 L-40,10 L-60,0 L-40,-10 Z" fill="${accentColor}" />
          
          <!-- Magic Particles -->
          <circle cx="30" cy="-30" r="5" fill="${accentColor}" />
          <circle cx="-30" cy="30" r="5" fill="${accentColor}" />
          <circle cx="30" cy="30" r="5" fill="${accentColor}" />
          <circle cx="-30" cy="-30" r="5" fill="${accentColor}" />
        </g>
      `;
    }
  } else {
    // Generic image for other card types
    imageContent = `
      <g transform="translate(150, 150)">
        <!-- Generic Image -->
        <circle cx="0" cy="0" r="80" fill="${accentColor}" opacity="0.5" />
        <circle cx="0" cy="0" r="60" fill="${accentColor}" opacity="0.7" />
        <circle cx="0" cy="0" r="40" fill="${accentColor}" opacity="0.9" />
        
        <!-- Decorative Elements -->
        <path d="M0,-80 L0,80 M-80,0 L80,0" stroke="${bgColor}" stroke-width="5" opacity="0.7" />
        <circle cx="0" cy="0" r="20" fill="${bgColor}" />
        
        <!-- Particles -->
        <circle cx="40" cy="-40" r="8" fill="${bgColor}" />
        <circle cx="-40" cy="40" r="8" fill="${bgColor}" />
        <circle cx="40" cy="40" r="8" fill="${bgColor}" />
        <circle cx="-40" cy="-40" r="8" fill="${bgColor}" />
      </g>
    `;
  }
  
  // Create SVG content
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <!-- Background -->
      <rect width="300" height="300" fill="${bgColor}" opacity="0.2" />
      
      <!-- Card Image Content -->
      ${imageContent}
    </svg>
  `;
  
  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  return dataUrl;
}

module.exports = {
  generateCardImage
}; 