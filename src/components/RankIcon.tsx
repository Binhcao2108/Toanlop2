import React from 'react';

interface RankIconProps {
  badgeId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<RankIconProps['size']>, string> = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-16 h-16',
};

interface Palette {
  id: string;
  outerStart: string;
  outerEnd: string;
  innerStart: string;
  innerEnd: string;
  accent: string;
  rim: string;
  glow: string;
  tierRank: number; // 0..8
}

function getPaletteForBadge(badgeId: string): Palette {
  switch (badgeId) {
    case 'b1':
    case 'b2':
      return {
        id: badgeId,
        outerStart: '#34d399',
        outerEnd: '#059669',
        innerStart: '#065f46',
        innerEnd: '#047857',
        accent: '#fde047',
        rim: '#a7f3d0',
        glow: '#10b981',
        tierRank: 1,
      };
    case 'b3':
    case 'b4':
    case 'b5':
      return {
        id: badgeId,
        outerStart: '#fb923c',
        outerEnd: '#b45309',
        innerStart: '#7c2d12',
        innerEnd: '#9a3412',
        accent: '#fef08a',
        rim: '#fed7aa',
        glow: '#f97316',
        tierRank: 2,
      };
    case 'b6':
    case 'b7':
    case 'b8':
      return {
        id: badgeId,
        outerStart: '#38bdf8',
        outerEnd: '#0369a1',
        innerStart: '#0c4a6e',
        innerEnd: '#075985',
        accent: '#e0f2fe',
        rim: '#bae6fd',
        glow: '#0ea5e9',
        tierRank: 3,
      };
    case 'b9':
    case 'b10':
    case 'b11':
      return {
        id: badgeId,
        outerStart: '#facc15',
        outerEnd: '#d97706',
        innerStart: '#78350f',
        innerEnd: '#b45309',
        accent: '#fef9c3',
        rim: '#fde68a',
        glow: '#eab308',
        tierRank: 4,
      };
    case 'b12':
    case 'b13':
    case 'b14':
      return {
        id: badgeId,
        outerStart: '#2dd4bf',
        outerEnd: '#0e7490',
        innerStart: '#134e4a',
        innerEnd: '#155e75',
        accent: '#cffafe',
        rim: '#99f6e4',
        glow: '#06b6d4',
        tierRank: 5,
      };
    case 'b15':
    case 'b16':
      return {
        id: badgeId,
        outerStart: '#818cf8',
        outerEnd: '#3730a3',
        innerStart: '#1e1b4b',
        innerEnd: '#312e81',
        accent: '#e0e7ff',
        rim: '#c7d2fe',
        glow: '#6366f1',
        tierRank: 6,
      };
    case 'b17':
    case 'b18':
      return {
        id: badgeId,
        outerStart: '#c084fc',
        outerEnd: '#6b21a8',
        innerStart: '#3b0764',
        innerEnd: '#581c87',
        accent: '#fde047',
        rim: '#e9d5ff',
        glow: '#a855f7',
        tierRank: 7,
      };
    case 'b19':
    case 'b20':
      return {
        id: badgeId,
        outerStart: '#fb7185',
        outerEnd: '#be123c',
        innerStart: '#4c0519',
        innerEnd: '#881337',
        accent: '#fde047',
        rim: '#fecdd3',
        glow: '#f43f5e',
        tierRank: 8,
      };
    case 'b21':
      return {
        id: badgeId,
        outerStart: '#f59e0b',
        outerEnd: '#db2777',
        innerStart: '#3b0764',
        innerEnd: '#be185d',
        accent: '#fef08a',
        rim: '#fde68a',
        glow: '#ec4899',
        tierRank: 9,
      };
    default:
      return {
        id: 'b0',
        outerStart: '#86efac',
        outerEnd: '#16a34a',
        innerStart: '#14532d',
        innerEnd: '#166534',
        accent: '#fef08a',
        rim: '#bbf7d0',
        glow: '#22c55e',
        tierRank: 0,
      };
  }
}

function renderCenterSymbol(badgeId: string, accent: string) {
  switch (badgeId) {
    case 'b1':
      // Rising Rookie Star with Laurel
      return (
        <g>
          <polygon
            points="32,16 35.8,24.2 44.8,25.3 38.1,31.5 39.9,40.4 32,35.9 24.1,40.4 25.9,31.5 19.2,25.3 28.2,24.2"
            fill={accent}
            stroke="#fff"
            strokeWidth="1.2"
          />
          <circle cx="32" cy="29" r="3.2" fill="#fff" opacity="0.85" />
        </g>
      );
    case 'b2':
      // Warrior Bee Crest
      return (
        <g>
          {/* Wings */}
          <ellipse cx="23" cy="26" rx="7" ry="4.2" transform="rotate(-25 23 26)" fill="#fff" opacity="0.85" />
          <ellipse cx="41" cy="26" rx="7" ry="4.2" transform="rotate(25 41 26)" fill="#fff" opacity="0.85" />
          {/* Body */}
          <ellipse cx="32" cy="31" rx="6.8" ry="8.5" fill="#facc15" stroke="#fff" strokeWidth="1.2" />
          <path d="M26 28 H38 M25.5 32 H38.5 M27 36 H37" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
          {/* Crown */}
          <polygon points="28,21 30,17 32,20 34,17 36,21" fill={accent} />
        </g>
      );
    case 'b3':
      // Lion Knight Shield & Mane
      return (
        <g>
          <polygon
            points="32,15 39,19 43,26 40,35 32,42 24,35 21,26 25,19"
            fill="#f59e0b"
            stroke="#fff"
            strokeWidth="1.4"
          />
          <polygon points="32,19 37,24 36,33 32,37 28,33 27,24" fill={accent} />
          <circle cx="29.5" cy="26.5" r="1.5" fill="#7c2d12" />
          <circle cx="34.5" cy="26.5" r="1.5" fill="#7c2d12" />
          <polygon points="32,29 30,32 34,32" fill="#7c2d12" />
        </g>
      );
    case 'b4':
      // Clever Fox Prodigy
      return (
        <g>
          <polygon points="21,18 28,25 23,34" fill="#fb923c" stroke="#fff" strokeWidth="1.2" />
          <polygon points="43,18 36,25 41,34" fill="#fb923c" stroke="#fff" strokeWidth="1.2" />
          <polygon points="22,23 42,23 38,36 32,41 26,36" fill="#f97316" stroke="#fff" strokeWidth="1.4" />
          <polygon points="22,28 32,41 29,28" fill="#fff" opacity="0.9" />
          <polygon points="42,28 32,41 35,28" fill="#fff" opacity="0.9" />
          <circle cx="28.5" cy="29" r="1.5" fill="#1e293b" />
          <circle cx="35.5" cy="29" r="1.5" fill="#1e293b" />
          <circle cx="32" cy="38.5" r="1.8" fill="#1e293b" />
        </g>
      );
    case 'b5':
      // Captain Helm / Compass Star
      return (
        <g>
          <circle cx="32" cy="29" r="9.5" fill="none" stroke={accent} strokeWidth="2.5" />
          <circle cx="32" cy="29" r="3.5" fill="#fff" />
          <path
            d="M32 15 V43 M18 29 H46 M22 19 L42 39 M42 19 L22 39"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
      );
    case 'b6':
      // Space Rocket Explorer
      return (
        <g>
          <path
            d="M32 15 C36 20 37.5 26 37.5 33 L26.5 33 C26.5 26 28 20 32 15 Z"
            fill="#fff"
            stroke="#bae6fd"
            strokeWidth="1.2"
          />
          <polygon points="26.5,29 21,35 26.5,35" fill="#38bdf8" />
          <polygon points="37.5,29 43,35 37.5,35" fill="#38bdf8" />
          <circle cx="32" cy="25.5" r="2.8" fill="#0284c7" stroke="#e0f2fe" strokeWidth="1.2" />
          <polygon points="28.5,34 32,42 35.5,34" fill="#facc15" />
        </g>
      );
    case 'b7':
      // Valedictorian Trophy Cup
      return (
        <g>
          <path
            d="M24 18 H40 V26 C40 31 36.5 34.5 32 34.5 C27.5 34.5 24 31 24 26 Z"
            fill="#facc15"
            stroke="#fff"
            strokeWidth="1.4"
          />
          <path d="M24 20 H20 C20 25 22 27 24 27 M40 20 H44 C44 25 42 27 40 27" fill="none" stroke="#fde047" strokeWidth="2" />
          <rect x="29.5" y="34.5" width="5" height="4.5" fill="#facc15" />
          <rect x="25" y="39" width="14" height="3" rx="1.5" fill="#fff" />
          <polygon points="32,21 33.4,24 36.6,24.4 34.2,26.6 34.8,29.8 32,28.2 29.2,29.8 29.8,26.6 27.4,24.4 30.6,24" fill="#fff" />
        </g>
      );
    case 'b8':
      // Royal Guardian Crossed Swords & Aegis Shield
      return (
        <g>
          <path d="M21 19 L43 40 M43 19 L21 40" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
          <path
            d="M32 17 L41 21 V29 C41 35 37 39.5 32 42 C27 39.5 23 35 23 29 V21 Z"
            fill="#38bdf8"
            stroke="#fff"
            strokeWidth="1.6"
          />
          <polygon points="32,21 35,28 32,37 29,28" fill="#fef08a" />
        </g>
      );
    case 'b9':
      // Lightning Blade Master
      return (
        <g>
          <polygon
            points="35,14 23,29 31,29 27,43 41,26 33,26"
            fill="#fef08a"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'b10':
      // Golden Eagle Soaring Wings
      return (
        <g>
          <path
            d="M16 22 L26 26 L32 17 L38 26 L48 22 L43 33 L32 41 L21 33 Z"
            fill="#fde047"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <polygon points="32,22 35.5,29 32,37 28.5,29" fill="#fff" />
        </g>
      );
    case 'b11':
      // Radiant Unicorn Horn & Star Halo
      return (
        <g>
          <polygon points="32,13 36,28 28,28" fill="#fff" stroke="#fde047" strokeWidth="1.3" />
          <path d="M24 30 Q32 24 40 30 Q38 39 32 42 Q26 39 24 30 Z" fill="#fef08a" stroke="#fff" strokeWidth="1.4" />
          <circle cx="24" cy="20" r="2" fill="#fff" />
          <circle cx="40" cy="20" r="2" fill="#fff" />
        </g>
      );
    case 'b12':
      // Archmage Arcane Crystal Orb & Staff
      return (
        <g>
          <polygon points="32,14 41,25 32,42 23,25" fill="#67e8f9" stroke="#fff" strokeWidth="1.5" />
          <polygon points="32,14 36,25 32,42 28,25" fill="#cffafe" opacity="0.85" />
          <circle cx="32" cy="25" r="3.5" fill="#fff" />
        </g>
      );
    case 'b13':
      // Super Cyber Robot Core
      return (
        <g>
          <polygon points="24,18 40,18 44,29 38,40 26,40 20,29" fill="#22d3ee" stroke="#fff" strokeWidth="1.6" />
          <rect x="24" y="24" width="16" height="5.5" rx="2.5" fill="#0f172a" stroke="#fff" strokeWidth="1" />
          <circle cx="28.5" cy="26.8" r="1.8" fill="#fde047" />
          <circle cx="35.5" cy="26.8" r="1.8" fill="#fde047" />
          <path d="M28 34 H36" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      );
    case 'b14':
      // Platinum Dragon Crest
      return (
        <g>
          <path
            d="M20 20 L27 24 L32 15 L37 24 L44 20 L41 33 L32 42 L23 33 Z"
            fill="#5eead4"
            stroke="#fff"
            strokeWidth="1.5"
          />
          <polygon points="28,27 32,31 36,27 35,35 32,39 29,35" fill="#0f172a" />
          <circle cx="29" cy="28" r="1.5" fill="#fef08a" />
          <circle cx="35" cy="28" r="1.5" fill="#fef08a" />
        </g>
      );
    case 'b15':
      // Thunder God Diamond Hammer & Bolts
      return (
        <g>
          <rect x="22" y="18" width="20" height="9" rx="2" fill="#c7d2fe" stroke="#fff" strokeWidth="1.5" />
          <rect x="29.5" y="27" width="5" height="14" rx="1.5" fill="#fde047" stroke="#fff" strokeWidth="1.2" />
          <polygon points="32,19 29,24 33,24 30,28 36,22 32,22" fill="#fde047" />
        </g>
      );
    case 'b16':
      // Diamond Monarch Crown
      return (
        <g>
          <polygon
            points="19,35 21,21 28,27 32,17 36,27 43,21 45,35"
            fill="#e0e7ff"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <rect x="20" y="35" width="24" height="4.5" rx="2" fill="#fde047" stroke="#fff" strokeWidth="1" />
          <polygon points="32,23 35,28 32,33 29,28" fill="#38bdf8" />
        </g>
      );
    case 'b17':
      // Millennial Supernova Star
      return (
        <g>
          <polygon
            points="32,12 35.5,24.5 48,28 35.5,31.5 32,44 28.5,31.5 16,28 28.5,24.5"
            fill="#fde047"
            stroke="#fff"
            strokeWidth="1.4"
          />
          <polygon
            points="22,18 29,25 42,18 35,28 42,38 29,31 22,38 27,28"
            fill="#f472b6"
            opacity="0.85"
          />
          <circle cx="32" cy="28" r="4.5" fill="#fff" />
        </g>
      );
    case 'b18':
      // Immortal Fire Phoenix
      return (
        <g>
          <path
            d="M15 24 C20 18 25 22 28 26 L32 14 L36 26 C39 22 44 18 49 24 C45 32 40 37 32 43 C24 37 19 32 15 24 Z"
            fill="#fb923c"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          <polygon points="32,19 36,29 32,39 28,29" fill="#fef08a" />
          <circle cx="32" cy="25" r="2.5" fill="#fff" />
        </g>
      );
    case 'b19':
      // Galaxy Commander Spiral Nebula
      return (
        <g>
          <ellipse
            cx="32"
            cy="28"
            rx="14"
            ry="6"
            transform="rotate(-28 32 28)"
            fill="none"
            stroke="#fde047"
            strokeWidth="2.4"
          />
          <ellipse
            cx="32"
            cy="28"
            rx="14"
            ry="6"
            transform="rotate(28 32 28)"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.4"
          />
          <circle cx="32" cy="28" r="5.5" fill="#fff" stroke="#fde047" strokeWidth="1.5" />
        </g>
      );
    case 'b20':
      // Supreme Cosmic Sovereign Trident & Halo
      return (
        <g>
          <circle cx="32" cy="28" r="12" fill="none" stroke="#fde047" strokeWidth="1.6" strokeDasharray="3 2" />
          <path
            d="M32 14 V42 M23 19 V27 C23 31 27 32 32 32 C37 32 41 31 41 27 V19"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <polygon points="32,12 28.5,18 35.5,18" fill="#fde047" />
          <polygon points="23,16 20,21 26,21" fill="#fde047" />
          <polygon points="41,16 38,21 44,21" fill="#fde047" />
        </g>
      );
    case 'b21':
      // 2000 Stars Ultimate Cosmic Legend Crown & Infinity Gem
      return (
        <g>
          {/* Radiant Wings */}
          <path
            d="M12 24 L22 26 L16 34 L26 35 L32 43 L38 35 L48 34 L42 26 L52 24 L40 19 L32 24 L24 19 Z"
            fill="#fde047"
            stroke="#fff"
            strokeWidth="1.3"
          />
          {/* Imperial Crown */}
          <polygon
            points="20,33 22,19 28,25 32,13 36,25 42,19 44,33"
            fill="#fff"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center Cosmic Diamond */}
          <polygon points="32,18 36,26 32,34 28,26" fill="#ec4899" stroke="#fef08a" strokeWidth="1.2" />
          {/* Three Crown Stars */}
          <circle cx="32" cy="11.5" r="2.2" fill="#fef08a" />
          <circle cx="21.5" cy="17" r="1.8" fill="#38bdf8" />
          <circle cx="42.5" cy="17" r="1.8" fill="#38bdf8" />
        </g>
      );
    default:
      // b0 Starter Sprout Shield
      return (
        <g>
          <path d="M32 39 V25" stroke="#fef08a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M32 29 C25 29 22 23 26 19 C30 19 32 23 32 29 Z" fill="#bbf7d0" stroke="#fff" strokeWidth="1.2" />
          <path d="M32 26 C39 26 42 20 38 16 C34 16 32 20 32 26 Z" fill="#fef08a" stroke="#fff" strokeWidth="1.2" />
        </g>
      );
  }
}

export const RankIcon: React.FC<RankIconProps> = ({
  badgeId = 'b0',
  size = 'md',
  className = '',
}) => {
  const palette = getPaletteForBadge(badgeId);
  const gradOuterId = `rank-outer-${palette.id}`;
  const gradInnerId = `rank-inner-${palette.id}`;
  const gradWingId = `rank-wing-${palette.id}`;

  const hasSideWings = palette.tierRank >= 4;
  const hasTopCrown = palette.tierRank >= 6;
  const hasCosmicHalo = palette.tierRank >= 8;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${SIZE_CLASSES[size]} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full overflow-visible drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradOuterId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.outerStart} />
            <stop offset="100%" stopColor={palette.outerEnd} />
          </linearGradient>
          <linearGradient id={gradInnerId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.innerStart} />
            <stop offset="100%" stopColor={palette.innerEnd} />
          </linearGradient>
          <linearGradient id={gradWingId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.accent} />
            <stop offset="100%" stopColor={palette.rim} />
          </linearGradient>
        </defs>

        {/* Outer Cosmic Halo for Mythic / Legend Tiers */}
        {hasCosmicHalo && (
          <circle
            cx="32"
            cy="32"
            r="29"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.85"
          />
        )}

        {/* Prestige Wings for Gold+ Tiers */}
        {hasSideWings && (
          <g>
            {/* Left Wing */}
            <path
              d="M14 26 L3 18 L6 28 L2 33 L11 36 L7 42 L17 41 Z"
              fill={`url(#${gradWingId})`}
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* Right Wing */}
            <path
              d="M50 26 L61 18 L58 28 L62 33 L53 36 L57 42 L47 41 Z"
              fill={`url(#${gradWingId})`}
              stroke="#ffffff"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Top Mini Crest / Crown for Diamond+ Tiers */}
        {hasTopCrown && (
          <polygon
            points="23,11 26,4 32,8 38,4 41,11"
            fill={palette.accent}
            stroke="#ffffff"
            strokeWidth="1"
          />
        )}

        {/* Main Outer Hexagonal / Heraldic Shield */}
        <path
          d="M32 6 L52 14 V32 C52 45 43.5 53.5 32 58 C20.5 53.5 12 45 12 32 V14 Z"
          fill={`url(#${gradOuterId})`}
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Metallic Inner Rim */}
        <path
          d="M32 10.5 L47.5 17 V31.5 C47.5 42 40.5 49 32 53 C23.5 49 16.5 42 16.5 31.5 V17 Z"
          fill={`url(#${gradInnerId})`}
          stroke={palette.rim}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Top Shine Highlight */}
        <path
          d="M32 11.5 L46 17.5 L32 23 L18 17.5 Z"
          fill="#ffffff"
          opacity="0.16"
        />

        {/* Center Unique Emblem Symbol */}
        {renderCenterSymbol(badgeId, palette.accent)}

        {/* Bottom Rank Stars Indicator */}
        {palette.tierRank >= 1 && (
          <g>
            <circle cx="32" cy="50" r="2" fill={palette.accent} />
            {palette.tierRank >= 3 && (
              <>
                <circle cx="26.5" cy="48.2" r="1.6" fill={palette.accent} />
                <circle cx="37.5" cy="48.2" r="1.6" fill={palette.accent} />
              </>
            )}
            {palette.tierRank >= 7 && (
              <>
                <circle cx="22" cy="45.5" r="1.4" fill="#ffffff" />
                <circle cx="42" cy="45.5" r="1.4" fill="#ffffff" />
              </>
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
