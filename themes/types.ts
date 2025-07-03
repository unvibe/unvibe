// ThemeConfig and Theme types for Unvibe themes

export interface ThemeConfig {
  name: string;
  base: 'light' | 'dark';
  fonts: {
    body: {
      type: 'local' | 'google';
      family: string;
    };
    mono: {
      type: 'local' | 'google';
      family: string;
    };
  };
  code_highlighter: {
    id: string;
  };
  ui_colors: {
    background: {
      0: string;
      1: string;
      2: string;
    };
    forground: {
      1: string;
      2: string;
      3: string;
    };
    border: {
      0: string;
      1: string;
      2: string;
    };
  };
}

export interface Theme extends ThemeConfig {
  id: string; // for DB storage
  createdAt?: Date;
  updatedAt?: Date;
}
