import { Achievement } from '../types/achievement';

export const ACHIEVEMENTS: Achievement[] = [
  // ================= COMMON (20 Badges) =================
  {
    id: 'first_win',
    title: 'First Response',
    description: 'Secure your first microgame successfully.',
    rarity: 'COMMON',
    icon: '🛡️',
    category: 'General'
  },
  {
    id: 'first_perfect',
    title: 'Split Second',
    description: 'Score your first Perfect clear (secure with >50% time left).',
    rarity: 'COMMON',
    icon: '⚡',
    category: 'Speed'
  },
  {
    id: 'linux_novice',
    title: 'Penguin Recruit',
    description: 'Secure 3 Linux microgames.',
    rarity: 'COMMON',
    icon: '🐧',
    category: 'Linux'
  },
  {
    id: 'windows_novice',
    title: 'SysAdmin Trainee',
    description: 'Secure 3 Windows microgames.',
    rarity: 'COMMON',
    icon: '🪟',
    category: 'Windows'
  },
  {
    id: 'firewall_novice',
    title: 'Traffic Guard',
    description: 'Clear 3 Firewall microgames.',
    rarity: 'COMMON',
    icon: '🧱',
    category: 'Firewall'
  },
  {
    id: 'study_break',
    title: 'Mental Reset',
    description: 'Acknowledge a Study Break card.',
    rarity: 'COMMON',
    icon: '☕',
    category: 'General'
  },
  {
    id: 'fast_learner',
    title: 'Quick Study',
    description: 'Acknowledge 5 Study Break cards across runs.',
    rarity: 'COMMON',
    icon: '📖',
    category: 'General'
  },
  {
    id: 'fp_100',
    title: 'Fever Spark',
    description: 'Earn your first 100 Fever Points.',
    rarity: 'COMMON',
    icon: '🔥',
    category: 'General'
  },
  {
    id: 'guest_disabler',
    title: 'Account Janitor',
    description: 'Disable the built-in Guest account.',
    rarity: 'COMMON',
    icon: '🧹',
    category: 'Windows'
  },
  {
    id: 'telnet_terminator',
    title: 'Plaintext Purger',
    description: 'Block unencrypted Port 23 Telnet traffic.',
    rarity: 'COMMON',
    icon: '🚫',
    category: 'Firewall'
  },
  {
    id: 'inject_novice',
    title: 'Memo Reader',
    description: 'Clear your first Inject microgame.',
    rarity: 'COMMON',
    icon: '📝',
    category: 'Injects'
  },
  {
    id: 'gui_novice',
    title: 'Point & Click',
    description: 'Clear your first GUI Navigation microgame.',
    rarity: 'COMMON',
    icon: '🖱️',
    category: 'Windows'
  },
  {
    id: 'fp_250',
    title: 'Warm Up',
    description: 'Accumulate 250 Fever Points.',
    rarity: 'COMMON',
    icon: '🔥',
    category: 'General'
  },
  {
    id: 'streak_three',
    title: 'Triple Threat',
    description: 'Reach a 3-card win streak.',
    rarity: 'COMMON',
    icon: '🎯',
    category: 'Streak'
  },
  {
    id: 'linux_chmod',
    title: 'Permission Granted',
    description: 'Restrict file permissions on a Linux system.',
    rarity: 'COMMON',
    icon: '🔐',
    category: 'Linux'
  },
  {
    id: 'ps_hunter',
    title: 'Process Patrol',
    description: 'Inspect or kill a rogue Windows process.',
    rarity: 'COMMON',
    icon: '🕵️',
    category: 'Windows'
  },
  {
    id: 'port_scanner_stop',
    title: 'Port Sentinel',
    description: 'Block an unauthorized port via firewall.',
    rarity: 'COMMON',
    icon: '🧱',
    category: 'Firewall'
  },
  {
    id: 'first_loss_lesson',
    title: 'Incident Logged',
    description: 'Review your first post-incident educational note after a breach.',
    rarity: 'COMMON',
    icon: '📋',
    category: 'General'
  },
  {
    id: 'speed_three',
    title: 'Quick Draw',
    description: 'Secure any card in under 3.5 seconds.',
    rarity: 'COMMON',
    icon: '⚡',
    category: 'Speed'
  },
  {
    id: 'study_sponge',
    title: 'Briefing Attentive',
    description: 'Acknowledge 3 Study Break cards.',
    rarity: 'COMMON',
    icon: '☕',
    category: 'General'
  },

  // ================= RARE (32 Badges) =================
  {
    id: 'perfect_trio',
    title: 'Hat Trick',
    description: 'Score 3 Perfect clears in a single run.',
    rarity: 'RARE',
    icon: '🎯',
    category: 'Speed'
  },
  {
    id: 'hacker_immune',
    title: 'Patch Tuesday',
    description: 'Successfully survive your first Hacked (Mutator) card.',
    rarity: 'RARE',
    icon: '👾',
    category: 'General'
  },
  {
    id: 'speedy_defense',
    title: 'Sub-Two',
    description: 'Secure any microgame in under 2.5 seconds.',
    rarity: 'RARE',
    icon: '⏱️',
    category: 'Speed'
  },
  {
    id: 'linux_adept',
    title: 'Sudo Champion',
    description: 'Secure 10 Linux microgames.',
    rarity: 'RARE',
    icon: '🐧',
    category: 'Linux'
  },
  {
    id: 'windows_adept',
    title: 'Domain Admin',
    description: 'Secure 10 Windows microgames.',
    rarity: 'RARE',
    icon: '🪟',
    category: 'Windows'
  },
  {
    id: 'firewall_adept',
    title: 'Packet Filter',
    description: 'Secure 10 Firewall microgames.',
    rarity: 'RARE',
    icon: '🧱',
    category: 'Firewall'
  },
  {
    id: 'streak_five',
    title: 'On Fire',
    description: 'Reach a 5-card win streak without breaches.',
    rarity: 'RARE',
    icon: '🔥',
    category: 'Streak'
  },
  {
    id: 'daily_finisher',
    title: 'Daily Dispatch',
    description: 'Complete any Daily Gauntlet run.',
    rarity: 'RARE',
    icon: '📅',
    category: 'General'
  },
  {
    id: 'fp_500',
    title: 'Rising Defender',
    description: 'Accumulate 500 Fever Points.',
    rarity: 'RARE',
    icon: '📈',
    category: 'General'
  },
  {
    id: 'netcat_slayer',
    title: 'Beacon Buster',
    description: 'Forcefully kill netcat reverse shells 3 times.',
    rarity: 'RARE',
    icon: '🛑',
    category: 'Windows'
  },
  {
    id: 'suid_auditor',
    title: 'Inspector General',
    description: 'Audit SUID binaries across 3 engagements.',
    rarity: 'RARE',
    icon: '🔍',
    category: 'Linux'
  },
  {
    id: 'default_denier',
    title: 'Zero Trust Gate',
    description: 'Enforce default deny incoming firewall rules 3 times.',
    rarity: 'RARE',
    icon: '🛡️',
    category: 'Firewall'
  },
  {
    id: 'multi_apprentice',
    title: 'Multi-Tasker',
    description: 'Complete your first Multi-Stage microgame.',
    rarity: 'RARE',
    icon: '🔗',
    category: 'General'
  },
  {
    id: 'inject_adept',
    title: 'Compliance Officer',
    description: 'Clear 5 Inject microgames.',
    rarity: 'RARE',
    icon: '📑',
    category: 'Injects'
  },
  {
    id: 'gui_adept',
    title: 'Registry Wrangler',
    description: 'Clear 5 GUI Navigation microgames.',
    rarity: 'RARE',
    icon: '⚙️',
    category: 'Windows'
  },
  {
    id: 'fp_1000',
    title: 'Kilowatt Defender',
    description: 'Accumulate 1,000 Fever Points.',
    rarity: 'RARE',
    icon: '⚡',
    category: 'General'
  },
  {
    id: 'streak_seven',
    title: 'Lucky Seven',
    description: 'Reach a 7-card win streak.',
    rarity: 'RARE',
    icon: '🎰',
    category: 'Streak'
  },
  {
    id: 'perfect_ten_career',
    title: 'Tenacious Ten',
    description: 'Accumulate 10 Perfect clears across your career.',
    rarity: 'RARE',
    icon: '🌟',
    category: 'Speed'
  },
  {
    id: 'daily_double',
    title: 'Back to Back',
    description: 'Reach a 2-day Daily Gauntlet streak.',
    rarity: 'RARE',
    icon: '📅',
    category: 'General'
  },
  {
    id: 'hacks_three_session',
    title: 'Hardened Shell',
    description: 'Survive 3 hacked mutator cards in a single session.',
    rarity: 'RARE',
    icon: '🛡️',
    category: 'General'
  },
  {
    id: 'multi_trio',
    title: 'Workflow Warrior',
    description: 'Complete 3 Multi-Stage microgames.',
    rarity: 'RARE',
    icon: '🔗',
    category: 'General'
  },
  {
    id: 'linux_passwd_audit',
    title: 'Zero Root Tolerance',
    description: 'Hunt unauthorized UID 0 accounts in /etc/passwd.',
    rarity: 'RARE',
    icon: '👤',
    category: 'Linux'
  },
  {
    id: 'win_lsa_guard',
    title: 'Credential Fortress',
    description: 'Enable LSA RunAsPPL protection to guard LSASS.',
    rarity: 'RARE',
    icon: '🏰',
    category: 'Windows'
  },
  {
    id: 'fw_ratelimit',
    title: 'DDoS Sponge',
    description: 'Block Tor exit node traffic through the firewall.',
    rarity: 'RARE',
    icon: '🌊',
    category: 'Firewall'
  },
  {
    id: 'smb_terminator',
    title: 'Lateral Lockdown',
    description: 'Sever rogue SMB connections to prevent lateral movement.',
    rarity: 'RARE',
    icon: '🛑',
    category: 'Windows'
  },
  {
    id: 'study_expert',
    title: 'CCDC Historian',
    description: 'Acknowledge 10 Study Break cards across all sessions.',
    rarity: 'RARE',
    icon: '📚',
    category: 'General'
  },
  {
    id: 'speed_rush',
    title: 'Fast-Twitch Muscle',
    description: 'Clear 2 cards back-to-back, each under 3 seconds.',
    rarity: 'RARE',
    icon: '⏱️',
    category: 'Speed'
  },
  // --- Secret Rares ---
  {
    id: 'clutch_god',
    title: 'Wire Cut',
    description: 'Defuse/secure a card with less than 200ms remaining on the clock!',
    rarity: 'RARE',
    icon: '✂️',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'night_stalker',
    title: 'Midnight Incident',
    description: 'Clear any microgame between 12:00 AM and 4:00 AM local time.',
    rarity: 'RARE',
    icon: '🌙',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'pwned_enjoyer',
    title: 'Noise Cancelling',
    description: 'Secure a microgame while the Pwned Marquee mutator is screaming across the screen.',
    rarity: 'RARE',
    icon: '📢',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'lunch_break_hero',
    title: 'Lunchtime Ops',
    description: 'Clear any microgame between 12:00 PM and 1:00 PM local time.',
    rarity: 'RARE',
    icon: '🥪',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'survivor_redteam',
    title: 'Hacker Repeller',
    description: 'Earn a Mythic (👑) clear: Perfect a card while hacked.',
    rarity: 'RARE',
    icon: '👾',
    secret: true,
    category: 'Secret'
  },

  // ================= EPIC (32 Badges) =================
  {
    id: 'perfect_spree',
    title: 'Perfectionist',
    description: 'Score 8 Perfect clears in a single run.',
    rarity: 'EPIC',
    icon: '🌟',
    category: 'Speed'
  },
  {
    id: 'streak_ten',
    title: 'Unbreachable',
    description: 'Reach a 10-card win streak without a single breach.',
    rarity: 'EPIC',
    icon: '🏆',
    category: 'Streak'
  },
  {
    id: 'streak_fifteen',
    title: 'Unstoppable Force',
    description: 'Reach a 15-card win streak without a breach.',
    rarity: 'EPIC',
    icon: '⚡',
    category: 'Streak'
  },
  {
    id: 'chaos_veteran',
    title: 'Zero-Day Veteran',
    description: 'Survive 5 different Hacked (Mutator) cards across sessions.',
    rarity: 'EPIC',
    icon: '☣️',
    category: 'General'
  },
  {
    id: 'earthquake_master',
    title: 'Steady Hands',
    description: 'Secure a microgame while the screen is violently shaking.',
    rarity: 'EPIC',
    icon: '🌋',
    category: 'General'
  },
  {
    id: 'blind_master',
    title: 'Blind Intuition',
    description: 'Secure a microgame while under the Blurry mutator.',
    rarity: 'EPIC',
    icon: '👁️',
    category: 'General'
  },
  {
    id: 'nuke_cron_master',
    title: 'Cron Slayer',
    description: 'Wipe rogue crontabs 3 times across games.',
    rarity: 'EPIC',
    icon: '💣',
    category: 'Linux'
  },
  {
    id: 'ssh_master',
    title: 'Port 22 Purist',
    description: 'Restore the standard SSH port 3 times across games.',
    rarity: 'EPIC',
    icon: '🔒',
    category: 'Linux'
  },
  {
    id: 'linux_master',
    title: 'Kernel Overlord',
    description: 'Secure 25 Linux microgames.',
    rarity: 'EPIC',
    icon: '🐧',
    category: 'Linux'
  },
  {
    id: 'windows_master',
    title: 'Enterprise Admin',
    description: 'Secure 25 Windows microgames.',
    rarity: 'EPIC',
    icon: '🪟',
    category: 'Windows'
  },
  {
    id: 'firewall_master',
    title: 'Bastion Host',
    description: 'Secure 25 Firewall microgames.',
    rarity: 'EPIC',
    icon: '🧱',
    category: 'Firewall'
  },
  {
    id: 'fp_2500',
    title: 'Threat Analyst',
    description: 'Reach 2,500 Fever Points.',
    rarity: 'EPIC',
    icon: '💎',
    category: 'General'
  },
  {
    id: 'chain_reaction',
    title: 'Pipeline Specialist',
    description: 'Clear 5 multi-stage microgames.',
    rarity: 'EPIC',
    icon: '⛓️',
    category: 'General'
  },
  {
    id: 'speed_demon',
    title: 'Terminal Velocity',
    description: 'Clear a multi-stage card with a Perfect on every stage.',
    rarity: 'EPIC',
    icon: '🚀',
    category: 'Speed'
  },
  {
    id: 'inject_master',
    title: 'Executive Briefing Lead',
    description: 'Clear 15 Inject microgames.',
    rarity: 'EPIC',
    icon: '💼',
    category: 'Injects'
  },
  {
    id: 'gui_master',
    title: 'Active Directory Architect',
    description: 'Clear 15 GUI Navigation microgames.',
    rarity: 'EPIC',
    icon: '🗂️',
    category: 'Windows'
  },
  {
    id: 'fp_3500',
    title: 'Senior Incident Commander',
    description: 'Reach 3,500 Fever Points.',
    rarity: 'EPIC',
    icon: '🎖️',
    category: 'General'
  },
  {
    id: 'streak_twelve',
    title: 'Unshakeable Resolve',
    description: 'Reach a 12-card win streak.',
    rarity: 'EPIC',
    icon: '🛡️',
    category: 'Streak'
  },
  {
    id: 'streak_eighteen',
    title: 'Ironclad Defense',
    description: 'Reach an 18-card win streak.',
    rarity: 'EPIC',
    icon: '⚔️',
    category: 'Streak'
  },
  {
    id: 'perfect_quarter_century',
    title: 'Silver Perfection',
    description: 'Accumulate 25 Perfect clears across your career.',
    rarity: 'EPIC',
    icon: '🥈',
    category: 'Speed'
  },
  {
    id: 'daily_five',
    title: 'Five-Day Stand',
    description: 'Complete 5 Daily Gauntlet runs.',
    rarity: 'EPIC',
    icon: '🗓️',
    category: 'General'
  },
  {
    id: 'multi_decathlete',
    title: 'Pipeline Maestro',
    description: 'Complete 10 Multi-Stage microgames.',
    rarity: 'EPIC',
    icon: '🎛️',
    category: 'General'
  },
  {
    id: 'chaos_connoisseur',
    title: 'Matrix Surfer',
    description: 'Survive all 5 mutator types: Earthquake, Blur, Invert, Marquee, and Upside-Down.',
    rarity: 'EPIC',
    icon: '🕶️',
    category: 'General'
  },
  {
    id: 'win_services_lockdown',
    title: 'Zero Service Footprint',
    description: 'Disable 3 rogue Windows services across sessions.',
    rarity: 'EPIC',
    icon: '📴',
    category: 'Windows'
  },
  {
    id: 'linux_audit_pro',
    title: 'Log Vigilante',
    description: 'Remediate 5 Linux incident response cards.',
    rarity: 'EPIC',
    icon: '📜',
    category: 'Linux'
  },
  {
    id: 'fw_deep_packet',
    title: 'Layer 7 Sentry',
    description: 'Defuse 5 complex firewall scenarios.',
    rarity: 'EPIC',
    icon: '📡',
    category: 'Firewall'
  },
  // --- Secret Epics ---
  {
    id: 'speed_demon_1s',
    title: 'Sub-Second Reflexes',
    description: 'Secure any microgame in under 1.0 second.',
    rarity: 'EPIC',
    icon: '⚡',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'inverted_vision',
    title: 'Photonegative',
    description: 'Secure a microgame while Color Invert mutator is active.',
    rarity: 'EPIC',
    icon: '🎨',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'c2_severer',
    title: 'Ghost in the Wire',
    description: 'Hunt and sever an active outbound C2 connection.',
    rarity: 'EPIC',
    icon: '🔌',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'speed_sub_800ms',
    title: 'Neural Synapse',
    description: 'Secure any microgame in under 0.8 seconds.',
    rarity: 'EPIC',
    icon: '⚡',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'flawless_full_deck',
    title: 'Clean Sheet',
    description: 'Clear 15+ cards in a Full Deck run with zero losses.',
    rarity: 'EPIC',
    icon: '🧼',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'overtake_hattrick',
    title: 'Drafting Leader',
    description: 'Overtake 3 rivals on the leaderboard.',
    rarity: 'EPIC',
    icon: '🏎️',
    secret: true,
    category: 'Secret'
  },

  // ================= LEGENDARY (16 Badges) =================
  {
    id: 'golden_gauntlet',
    title: 'Golden Standard',
    description: 'Complete an entire Daily Gauntlet with 100% Perfects (all ⭐ / 👑)!',
    rarity: 'LEGENDARY',
    icon: '⭐',
    category: 'Speed'
  },
  {
    id: 'grandmaster',
    title: 'SOC Director',
    description: 'Unlock 50 total achievements in your career.',
    rarity: 'LEGENDARY',
    icon: '🎖️',
    category: 'General'
  },
  {
    id: 'cyber_legend',
    title: 'Cyber Defender Fever',
    description: 'Reach an unbelievable 20-card win streak.',
    rarity: 'LEGENDARY',
    icon: '👑',
    category: 'Streak'
  },
  {
    id: 'fp_5000',
    title: 'Principal Hunter',
    description: 'Reach 5,000 Fever Points.',
    rarity: 'LEGENDARY',
    icon: '🔱',
    category: 'General'
  },
  {
    id: 'fp_10000',
    title: 'National Champion',
    description: 'Reach an astounding 10,000 Fever Points.',
    rarity: 'LEGENDARY',
    icon: '🏆',
    category: 'General'
  },
  {
    id: 'perfect_century',
    title: 'Century Club',
    description: 'Accumulate 50 total Perfect clears.',
    rarity: 'LEGENDARY',
    icon: '✨',
    category: 'Speed'
  },
  {
    id: 'fp_15000',
    title: 'Hall of Fame',
    description: 'Reach 15,000 Fever Points.',
    rarity: 'LEGENDARY',
    icon: '🏛️',
    category: 'General'
  },
  {
    id: 'fp_20000',
    title: 'Living Legend',
    description: 'Reach an incredible 20,000 Fever Points.',
    rarity: 'LEGENDARY',
    icon: '👑',
    category: 'General'
  },
  {
    id: 'streak_twenty_five',
    title: 'Invincible Bastion',
    description: 'Reach a 25-card win streak.',
    rarity: 'LEGENDARY',
    icon: '🏰',
    category: 'Streak'
  },
  {
    id: 'daily_titan',
    title: 'Gauntlet Conqueror',
    description: 'Complete 10 Daily Gauntlet runs.',
    rarity: 'LEGENDARY',
    icon: '🏆',
    category: 'General'
  },
  {
    id: 'mythic_trio',
    title: 'Mythic Mastery',
    description: 'Earn 5 Mythic clears (Perfect under a Mutator) across your career.',
    rarity: 'LEGENDARY',
    icon: '👑',
    category: 'Speed'
  },
  {
    id: 'tri_discipline_master',
    title: 'Grand Blue Marshal',
    description: 'Secure 50 Windows, 50 Linux, and 50 Firewall microgames.',
    rarity: 'LEGENDARY',
    icon: '🌐',
    category: 'General'
  },
  // --- Secret Legendaries ---
  {
    id: 'marathoner',
    title: 'Endurance Test',
    description: 'Clear 25 microgames in a single Full Deck session without failing.',
    rarity: 'LEGENDARY',
    icon: '🏃',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'pipeline_perfection',
    title: 'Flawless Pipeline',
    description: 'Clear a 3-stage microgame with all Perfect clears.',
    rarity: 'LEGENDARY',
    icon: '🎖️',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'leaderboard_titan',
    title: 'Apex Defender',
    description: 'Claim the #1 spot on the Global Leaderboard!',
    rarity: 'LEGENDARY',
    icon: '👑',
    secret: true,
    category: 'Secret'
  },
  {
    id: 'centurion_clears',
    title: 'The Centurion',
    description: 'Reach 100 total career clears.',
    rarity: 'LEGENDARY',
    icon: '💯',
    secret: true,
    category: 'Secret'
  }
];
