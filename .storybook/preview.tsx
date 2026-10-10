import type { Preview } from '@storybook/react-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
// No-Tailwind 내재화 CSS — 토큰(:root) + 유틸리티 클래스 + 키프레임 자체완결.
// Tailwind 런타임 의존 0%. 소비자도 이 파일을 import.
import '../src/denyx-ds.css';
// Core-only 모드: Brand/Status 색을 gray fallback 으로 리셋 (기본 활성).
import './addon-override.css';

/**
 * Storybook 10 preview — 모든 story 에 공통 적용되는 parameters / decorators.
 *
 * - layout: 'centered' — 대시보드 chrome 같이 큰 컴포넌트는 개별 story 에서 'fullscreen' 으로 override.
 * - backgrounds: light(#fff) / surface-muted(#f5f5f5) / dark(#1a1a1a). prototype 에 자주 등장하는 배경 3종.
 * - storySort: 카탈로그 좌측 트리 ordering — Introduction → For Designers → Foundation → Tokens → Primitives → Composite → Shell. 단일 Design Theory 계층(Primitives→Composite→Shell).
 */
const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      // default 미지정 — 캔버스는 denyx-ds.css 의 body 배경(var(--color-bg))을 따르므로
      // 우측 상단 Theme 토글(라이트/다크)이 배경까지 함께 전환한다. (수동 배경은 아래 값 유지)
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'surface-muted', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    controls: {
      expanded: true, // argTypes description 을 기본 노출 — AI / 사용자 모두 prop 의미 즉시 확인 가능
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' — a11y 위반만 표시, CI fail 시키지 않음. 추후 'error' 로 강화 가능.
      test: 'todo',
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Change Log',
          'For Designers',
          'Foundation',
          ['Denyx Symbol'],
          'Tokens',
          ['Color', 'Type Scale', 'Font Weights', 'Line Heights', 'Tracking', 'Text Colors', 'Patterns', 'Korean vs Numeric', 'Typography', 'Tones (Semantic Intent)'],
          'Primitives',
          'Composite',
          'Shell',
        ],
      },
    },
  },
  globalTypes: {
    colorAddon: {
      name: 'Color Addon',
      description: 'Brand/Status 컬러 Addon 토글. Off = Core 그레이스케일, On = 풀컬러.',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'off', title: 'Core Only (Grayscale)' },
          { value: 'on', title: 'Full Color (Brand + Status)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorAddon: 'off',
  },
  decorators: [
    // 우측 상단 툴바에 Light/Dark 토글 추가 — <html> 에 `.dark` 클래스를 토글한다.
    // denyx-ds.css 의 `.dark` 토큰이 cascade 되어 모든 story 가 다크로 전환된다.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    // Color Addon 토글 — Off(기본) = 그레이스케일, On = 풀컬러.
    (Story, context) => {
      const addonOff = context.globals.colorAddon !== 'on';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-color-addon', addonOff ? 'off' : 'on');
      }
      return Story();
    },
  ],
};

export default preview;
