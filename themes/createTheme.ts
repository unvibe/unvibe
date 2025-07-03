// Theme creation and utilities
import type { ThemeConfig, Theme } from './types';

export function createTheme(config: ThemeConfig): Theme {
  // Assign a random ID for now; later this should be handled by DB
  const id = `${config.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return {
    ...config,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
