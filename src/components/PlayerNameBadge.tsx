"use client";

import React from 'react';
import { AchievementRarity } from '../types/achievement';

interface PlayerNameBadgeProps {
  username: string;
  icon?: string;
  rarity?: AchievementRarity;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showRarityPill?: boolean;
}

function PlayerNameBadge({
  username,
  icon = '🛡️',
  rarity = 'COMMON',
  onClick,
  className = '',
  size = 'md',
  showRarityPill = false
}: PlayerNameBadgeProps) {
  const isClickable = Boolean(onClick);

  // Size configurations
  const sizeStyles = {
    sm: {
      padding: 'px-2 py-0.5',
      rounded: 'rounded-lg',
      innerRounded: 'rounded-[6px]',
      icon: 'text-sm',
      text: 'text-[11px]',
      tag: 'text-[9px]'
    },
    md: {
      padding: 'px-3 py-1.5',
      rounded: 'rounded-xl',
      innerRounded: 'rounded-[10px]',
      icon: 'text-base',
      text: 'text-xs',
      tag: 'text-[10px]'
    },
    lg: {
      padding: 'px-4 py-2',
      rounded: 'rounded-2xl',
      innerRounded: 'rounded-[14px]',
      icon: 'text-xl',
      text: 'text-sm',
      tag: 'text-xs'
    }
  }[size];

  // ================= LEGENDARY: RGB ANIMATED RAINBOW BORDER =================
  if (rarity === 'LEGENDARY') {
    const Tag = isClickable ? 'button' : 'div';
    return (
      <Tag
        onClick={onClick}
        className={`relative ${sizeStyles.padding} ${sizeStyles.rounded} rainbow-border flex items-center gap-2 group shadow-[0_0_18px_rgba(255,0,128,0.35)] hover:shadow-[0_0_26px_rgba(0,255,255,0.55)] transition-all ${
          isClickable ? 'hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : ''
        } ${className}`}
        title={`Equipped Badge: Mythic Legendary`}
      >
        <span className={`${sizeStyles.icon} filter drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]`}>
          {icon}
        </span>
        <span className={`${sizeStyles.text} font-black tracking-wide truncate max-w-[120px] sm:max-w-[150px] text-white`}>
          {username || 'Defender'}
        </span>
        {showRarityPill && (
          <span className={`${sizeStyles.tag} font-mono font-bold text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]`}>
            ★ MYTHIC
          </span>
        )}
      </Tag>
    );
  }

  // ================= EPIC: RADIANT GOLD BORDER =================
  if (rarity === 'EPIC') {
    const Tag = isClickable ? 'button' : 'div';
    return (
      <Tag
        onClick={onClick}
        className={`flex items-center gap-2 ${sizeStyles.padding} ${sizeStyles.rounded} bg-gradient-to-r from-yellow-950/50 via-gray-900 to-yellow-950/40 border-2 border-yellow-400 text-yellow-100 shadow-[0_0_16px_rgba(250,204,21,0.45)] transition-all group ${
          isClickable ? 'hover:border-yellow-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : ''
        } ${className}`}
        title={`Equipped Badge: Epic Gold`}
      >
        <span className={`${sizeStyles.icon} filter drop-shadow-[0_0_6px_rgba(250,204,21,0.8)] group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
        <span className={`${sizeStyles.text} font-black tracking-wide truncate max-w-[120px] sm:max-w-[150px] text-yellow-50`}>
          {username || 'Defender'}
        </span>
        {showRarityPill && (
          <span className={`${sizeStyles.tag} font-mono font-bold text-yellow-400 bg-yellow-950/70 border border-yellow-400/40 px-1.5 py-0.2 rounded`}>
            GOLD
          </span>
        )}
      </Tag>
    );
  }

  // ================= RARE: LUMINOUS SILVER / SKY BLUE BORDER =================
  if (rarity === 'RARE') {
    const Tag = isClickable ? 'button' : 'div';
    return (
      <Tag
        onClick={onClick}
        className={`flex items-center gap-2 ${sizeStyles.padding} ${sizeStyles.rounded} bg-gradient-to-r from-sky-950/50 via-gray-900 to-sky-950/40 border-2 border-sky-400 text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.4)] transition-all group ${
          isClickable ? 'hover:border-sky-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : ''
        } ${className}`}
        title={`Equipped Badge: Rare Silver`}
      >
        <span className={`${sizeStyles.icon} filter drop-shadow-[0_0_5px_rgba(56,189,248,0.7)] group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
        <span className={`${sizeStyles.text} font-bold tracking-wide truncate max-w-[120px] sm:max-w-[150px] text-sky-50`}>
          {username || 'Defender'}
        </span>
        {showRarityPill && (
          <span className={`${sizeStyles.tag} font-mono font-bold text-sky-400 bg-sky-950/70 border border-sky-400/40 px-1.5 py-0.2 rounded`}>
            SILVER
          </span>
        )}
      </Tag>
    );
  }

  // ================= COMMON: CRISP BRONZE / EMERALD BORDER =================
  const Tag = isClickable ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-2 ${sizeStyles.padding} ${sizeStyles.rounded} bg-gradient-to-r from-emerald-950/30 via-gray-900 to-gray-900 border-2 border-emerald-500/70 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.25)] transition-all group ${
        isClickable ? 'hover:border-emerald-400 hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : ''
      } ${className}`}
      title={`Equipped Badge: Common`}
    >
      <span className={`${sizeStyles.icon} filter drop-shadow group-hover:scale-110 transition-transform`}>
        {icon}
      </span>
      <span className={`${sizeStyles.text} font-bold tracking-wide truncate max-w-[120px] sm:max-w-[150px] text-white`}>
        {username || 'Defender'}
      </span>
      {showRarityPill && (
        <span className={`${sizeStyles.tag} font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.2 rounded`}>
          BRONZE
        </span>
      )}
    </Tag>
  );
}

const PlayerNameBadgeMemo = React.memo(PlayerNameBadge);
PlayerNameBadgeMemo.displayName = 'PlayerNameBadge';
export default PlayerNameBadgeMemo;
