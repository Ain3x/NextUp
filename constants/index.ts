export const ROUTES = {
  SIGN_IN: '/(auth)/sign-in',
  SIGN_UP: '/(auth)/sign-up',
  TABS: '/(tabs)',
  QUEUE: '/(tabs)/',
  PICK: '/(tabs)/pick',
  SEARCH: '/(tabs)/search',
  PROFILE: '/(tabs)/profile',
  ITEM_DETAIL: '/(modals)/item-detail',
  ADD_TO_QUEUE: '/(modals)/add-to-queue',
} as const;

export const STORAGE_KEYS = {
  THEME: 'theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  TASTE_CARD: 'taste_card',
  TASTE_CARD_UPDATED_AT: 'taste_card_updated_at',
  TASTE_CARD_COMPLETED_COUNT: 'taste_card_completed_count',
} as const;

export const QUEUE_DEFAULTS = {
  ANIME_EPISODE_RUNTIME: 24,  // minutes, fallback when AniList has no runtime
  MIN_TIME_AVAILABLE: 15,     // minutes, slider minimum
  MAX_TIME_AVAILABLE: 240,    // minutes, slider maximum
} as const;

export const API = {
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  ANILIST_URL: 'https://graphql.anilist.co',
} as const;