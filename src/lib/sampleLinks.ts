import { DeepLink } from '../types/deepLink';

// Removed all predefined sample links as requested by user.
// Starting with an empty list so only user-created links appear.
export const INITIAL_SAMPLE_LINKS: DeepLink[] = [];

export const PREDEFINED_SAMPLE_SLUGS = new Set([
  'mio-ecommerce',
  'amazon-tech',
  'canale-youtube',
  'playlist-focus',
  'youtube-ejn0',
  'test-link',
  'test-curl',
  'hostinger-test',
  'test-link-edit',
]);
