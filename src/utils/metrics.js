/**
 * 📊 Server Metrics & Statistics
 */

class ServerMetrics {
  constructor(guild) {
    this.guild = guild;
  }

  /**
   * Member Statistics
   */
  get members() {
    if (!this.guild) return null;

    return {
      // Total member count
      get all() {
        return this.guild?.memberCount || 0;
      },

      // Online members
      get online() {
        return this.guild?.members.cache.filter(m => 
          m.presence?.status === 'online' || 
          m.presence?.status === 'idle' || 
          m.presence?.status === 'dnd'
        ).size || 0;
      },

      // Offline members
      get offline() {
        return this.guild?.members.cache.filter(m => 
          !m.presence || m.presence.status === 'offline'
        ).size || 0;
      },

      // Bot count
      get bots() {
        return this.guild?.members.cache.filter(m => m.user.bot).size || 0;
      },

      // Human count
      get humans() {
        return this.guild?.members.cache.filter(m => !m.user.bot).size || 0;
      },

      // Members with roles
      get withRoles() {
        return this.guild?.members.cache.filter(m => m.roles.cache.size > 1).size || 0;
      },

      // Members without roles (only @everyone)
      get withoutRoles() {
        return this.guild?.members.cache.filter(m => m.roles.cache.size === 1).size || 0;
      },

      // New members (joined in last 24h)
      get new24h() {
        const yesterday = Date.now() - 24 * 60 * 60 * 1000;
        return this.guild?.members.cache.filter(m => 
          m.joinedTimestamp && m.joinedTimestamp > yesterday
        ).size || 0;
      },

      // New members (joined in last 7 days)
      get new7d() {
        const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return this.guild?.members.cache.filter(m => 
          m.joinedTimestamp && m.joinedTimestamp > lastWeek
        ).size || 0;
      },

      guild: this.guild
    };
  }

  /**
   * Guild Information
   */
  get guild() {
    if (!this._guild) return null;

    const guild = this._guild;

    return {
      // Server name
      get name() {
        return guild.name;
      },

      // Server ID
      get id() {
        return guild.id;
      },

      // Server description
      get description() {
        return guild.description || 'No description';
      },

      // Owner ID
      get ownerId() {
        return guild.ownerId;
      },

      // Owner object
      get owner() {
        return guild.members.cache.get(guild.ownerId);
      },

      // Server creation date
      get createdAt() {
        return guild.createdAt;
      },

      // Server age in days
      get age() {
        return Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));
      },

      // Verification level
      get verificationLevel() {
        return guild.verificationLevel;
      },

      // Boost level
      get boostLevel() {
        return guild.premiumTier;
      },

      // Boost count
      get boostCount() {
        return guild.premiumSubscriptionCount || 0;
      },

      // Is partnered
      get partnered() {
        return guild.partnered || false;
      },

      // Is verified
      get verified() {
        return guild.verified || false;
      },

      // Vanity URL code
      get vanityCode() {
        return guild.vanityURLCode || null;
      },

      // Max members
      get maxMembers() {
        return guild.maximumMembers || 500000;
      },

      // Server banner
      get banner() {
        return guild.bannerURL({ size: 2048 });
      },

      // Server icon
      get icon() {
        return guild.iconURL({ size: 2048 });
      },

      // Server splash
      get splash() {
        return guild.splashURL({ size: 2048 });
      },

      // AFK channel
      get afkChannel() {
        return guild.afkChannel;
      },

      // AFK timeout
      get afkTimeout() {
        return guild.afkTimeout;
      },

      // System channel
      get systemChannel() {
        return guild.systemChannel;
      },

      // Rules channel
      get rulesChannel() {
        return guild.rulesChannel;
      },

      guild: guild
    };
  }

  /**
   * Channel Statistics
   */
  get channels() {
    if (!this.guild) return null;

    return {
      // Total channels
      get all() {
        return this.guild?.channels.cache.size || 0;
      },

      // Text channels
      get text() {
        return this.guild?.channels.cache.filter(c => c.type === 0).size || 0;
      },

      // Voice channels
      get voice() {
        return this.guild?.channels.cache.filter(c => c.type === 2).size || 0;
      },

      // Categories
      get categories() {
        return this.guild?.channels.cache.filter(c => c.type === 4).size || 0;
      },

      // Stage channels
      get stage() {
        return this.guild?.channels.cache.filter(c => c.type === 13).size || 0;
      },

      // Forum channels
      get forum() {
        return this.guild?.channels.cache.filter(c => c.type === 15).size || 0;
      },

      // Announcement channels
      get announcement() {
        return this.guild?.channels.cache.filter(c => c.type === 5).size || 0;
      },

      // Thread channels
      get threads() {
        return this.guild?.channels.cache.filter(c => 
          c.type === 10 || c.type === 11 || c.type === 12
        ).size || 0;
      },

      guild: this.guild
    };
  }

  /**
   * Role Statistics
   */
  get roles() {
    if (!this.guild) return null;

    return {
      // Total roles
      get all() {
        return this.guild?.roles.cache.size || 0;
      },

      // Roles with admin
      get admin() {
        return this.guild?.roles.cache.filter(r => 
          r.permissions.has('Administrator')
        ).size || 0;
      },

      // Mentionable roles
      get mentionable() {
        return this.guild?.roles.cache.filter(r => r.mentionable).size || 0;
      },

      // Hoisted roles (displayed separately)
      get hoisted() {
        return this.guild?.roles.cache.filter(r => r.hoist).size || 0;
      },

      // Managed roles (bot roles)
      get managed() {
        return this.guild?.roles.cache.filter(r => r.managed).size || 0;
      },

      // Highest role
      get highest() {
        return this.guild?.roles.highest;
      },

      // Lowest role
      get lowest() {
        return this.guild?.roles.everyone;
      },

      guild: this.guild
    };
  }

  /**
   * Emoji Statistics
   */
  get emojis() {
    if (!this.guild) return null;

    return {
      // Total emojis
      get all() {
        return this.guild?.emojis.cache.size || 0;
      },

      // Static emojis
      get static() {
        return this.guild?.emojis.cache.filter(e => !e.animated).size || 0;
      },

      // Animated emojis
      get animated() {
        return this.guild?.emojis.cache.filter(e => e.animated).size || 0;
      },

      // Managed emojis (from integrations)
      get managed() {
        return this.guild?.emojis.cache.filter(e => e.managed).size || 0;
      },

      // Available emojis
      get available() {
        return this.guild?.emojis.cache.filter(e => e.available).size || 0;
      },

      // Max emoji slots
      get maxSlots() {
        const tier = this.guild?.premiumTier || 0;
        return tier === 0 ? 50 : tier === 1 ? 100 : tier === 2 ? 150 : 250;
      },

      // Remaining slots
      get remaining() {
        return this.maxSlots - this.all;
      },

      guild: this.guild
    };
  }

  /**
   * Sticker Statistics
   */
  get stickers() {
    if (!this.guild) return null;

    return {
      // Total stickers
      get all() {
        return this.guild?.stickers.cache.size || 0;
      },

      // Max sticker slots
      get maxSlots() {
        const tier = this.guild?.premiumTier || 0;
        return tier === 0 ? 5 : tier === 1 ? 15 : tier === 2 ? 30 : 60;
      },

      // Remaining slots
      get remaining() {
        return this.maxSlots - this.all;
      },

      guild: this.guild
    };
  }

  /**
   * Voice Statistics
   */
  get voice() {
    if (!this.guild) return null;

    return {
      // Members in voice
      get active() {
        return this.guild?.members.cache.filter(m => m.voice.channel).size || 0;
      },

      // Muted members
      get muted() {
        return this.guild?.members.cache.filter(m => 
          m.voice.channel && (m.voice.mute || m.voice.selfMute)
        ).size || 0;
      },

      // Deafened members
      get deafened() {
        return this.guild?.members.cache.filter(m => 
          m.voice.channel && (m.voice.deaf || m.voice.selfDeaf)
        ).size || 0;
      },

      // Streaming members
      get streaming() {
        return this.guild?.members.cache.filter(m => 
          m.voice.channel && m.voice.streaming
        ).size || 0;
      },

      // Video enabled members
      get video() {
        return this.guild?.members.cache.filter(m => 
          m.voice.channel && m.voice.selfVideo
        ).size || 0;
      },

      guild: this.guild
    };
  }

  /**
   * Boost Statistics
   */
  get boost() {
    if (!this.guild) return null;

    return {
      // Current boost level (tier)
      get level() {
        return this.guild?.premiumTier || 0;
      },

      // Total boost count
      get count() {
        return this.guild?.premiumSubscriptionCount || 0;
      },

      // Boosters
      get boosters() {
        return this.guild?.members.cache.filter(m => m.premiumSince).size || 0;
      },

      // Boosts needed for next level
      get neededForNext() {
        const current = this.count;
        const level = this.level;
        if (level === 0) return 2 - current;
        if (level === 1) return 7 - current;
        if (level === 2) return 14 - current;
        return 0; // Max level
      },

      // Progress to next level (0-100)
      get progress() {
        const needed = this.neededForNext;
        if (needed <= 0) return 100;
        const level = this.level;
        const current = this.count;
        if (level === 0) return (current / 2) * 100;
        if (level === 1) return ((current - 2) / 5) * 100;
        if (level === 2) return ((current - 7) / 7) * 100;
        return 100;
      },

      guild: this.guild
    };
  }

  /**
   * Moderation Statistics
   */
  get moderation() {
    if (!this.guild) return null;

    return {
      // Banned users count
      async bans() {
        try {
          const bans = await this.guild?.bans.fetch();
          return bans?.size || 0;
        } catch {
          return 0;
        }
      },

      // Members with timeout
      get timedOut() {
        return this.guild?.members.cache.filter(m => 
          m.communicationDisabledUntilTimestamp && 
          m.communicationDisabledUntilTimestamp > Date.now()
        ).size || 0;
      },

      guild: this.guild
    };
  }

  /**
   * Generate full stats report
   */
  async getFullReport() {
    const bans = await this.moderation.bans();

    return {
      guild: {
        name: this.guild.name,
        id: this.guild.id,
        description: this.guild.description,
        ownerId: this.guild.ownerId,
        createdAt: this.guild.createdAt,
        age: this.guild.age,
        boostLevel: this.guild.boostLevel,
        boostCount: this.guild.boostCount,
        verified: this.guild.verified,
        partnered: this.guild.partnered
      },
      members: {
        all: this.members.all,
        online: this.members.online,
        offline: this.members.offline,
        bots: this.members.bots,
        humans: this.members.humans,
        new24h: this.members.new24h,
        new7d: this.members.new7d
      },
      channels: {
        all: this.channels.all,
        text: this.channels.text,
        voice: this.channels.voice,
        categories: this.channels.categories
      },
      roles: {
        all: this.roles.all,
        admin: this.roles.admin,
        managed: this.roles.managed
      },
      emojis: {
        all: this.emojis.all,
        static: this.emojis.static,
        animated: this.emojis.animated,
        remaining: this.emojis.remaining
      },
      stickers: {
        all: this.stickers.all,
        remaining: this.stickers.remaining
      },
      voice: {
        active: this.voice.active,
        muted: this.voice.muted,
        streaming: this.voice.streaming
      },
      boost: {
        level: this.boost.level,
        count: this.boost.count,
        boosters: this.boost.boosters,
        neededForNext: this.boost.neededForNext,
        progress: this.boost.progress
      },
      moderation: {
        bans,
        timedOut: this.moderation.timedOut
      }
    };
  }
}

export default ServerMetrics;
export { ServerMetrics };
