# VeritasAI Design System

## 1. Design System Overview

The VeritasAI Design System establishes a consistent visual and interaction language across all platforms (web, mobile, desktop, and browser extension). This system ensures cohesive user experiences while maintaining flexibility for platform-specific adaptations.

## 2. Design Principles

### 2.1 Trust and Credibility
- Clean, professional aesthetics that inspire confidence
- Data-driven visualizations and clear result presentations
- Transparent communication of analysis processes
- Consistent branding that reinforces reliability

### 2.2 Accessibility and Inclusivity
- WCAG 2.1 AA compliance as minimum standard
- Support for screen readers and assistive technologies
- High contrast ratios for visual clarity
- Multiple input methods (touch, keyboard, voice)

### 2.3 Simplicity and Clarity
- Minimalist interface design to reduce cognitive load
- Clear information hierarchy with visual distinction
- Intuitive navigation and interaction patterns
- Progressive disclosure of complex features

### 2.4 Efficiency and Performance
- Optimized loading times and responsive interactions
- Streamlined workflows for common tasks
- Contextual help and guidance
- Keyboard shortcuts for power users

## 3. Color Palette

### 3.1 Primary Colors
- **Primary Blue**: #2563EB (Main brand color, actions, links)
- **Primary Dark Blue**: #1D4ED8 (Hover states, active elements)
- **Primary Light Blue**: #3B82F6 (Secondary actions, highlights)

### 3.2 Secondary Colors
- **Verification Green**: #10B981 (Positive results, success states)
- **Caution Orange**: #F59E0B (Warnings, medium confidence)
- **Alert Red**: #EF4444 (High risk, errors, negative results)
- **Neutral Gray**: #6B7280 (Secondary text, borders)

### 3.3 Neutral Colors
- **White**: #FFFFFF (Backgrounds, cards)
- **Light Gray**: #F3F4F6 (Subtle backgrounds, dividers)
- **Medium Gray**: #9CA3AF (Secondary text, disabled states)
- **Dark Gray**: #374151 (Primary text, headings)
- **Black**: #111827 (Headings, high contrast text)

### 3.4 Accessibility Considerations
- Minimum 4.5:1 contrast ratio for text
- Minimum 3:1 contrast ratio for UI components
- Colorblind-friendly palette testing
- Sufficient color differentiation for status indicators

## 4. Typography

### 4.1 Font Family
- **Primary**: Inter (Modern, highly readable sans-serif)
- **Secondary**: Roboto Mono (For technical data, code snippets)

### 4.2 Font Sizes and Hierarchy
- **Display**: 48px (Hero headings, splash screens)
- **H1**: 36px (Page titles, section headings)
- **H2**: 24px (Subsection headings)
- **H3**: 20px (Card titles, feature headings)
- **Body Large**: 18px (Introductory paragraphs)
- **Body Regular**: 16px (Main content, default)
- **Body Small**: 14px (Supporting text, captions)
- **Caption**: 12px (Legal text, fine print)

### 4.3 Line Heights
- **Display/H1**: 1.2
- **H2/H3**: 1.3
- **Body**: 1.5
- **Caption**: 1.4

### 4.4 Font Weights
- **Light**: 300 (Subtle text, captions)
- **Regular**: 400 (Body text, default)
- **Medium**: 500 (Headings, emphasized text)
- **Semibold**: 600 (Card titles, buttons)
- **Bold**: 700 (Page titles, key metrics)

## 5. Spacing and Layout

### 5.1 Spacing Scale (8px grid)
- **XXS**: 4px
- **XS**: 8px
- **S**: 16px
- **M**: 24px
- **L**: 32px
- **XL**: 48px
- **XXL**: 64px

### 5.2 Breakpoints
- **Mobile**: 0px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### 5.3 Container Widths
- **Mobile**: 100% with 16px side padding
- **Tablet**: 720px max width
- **Desktop**: 1140px max width
- **Large Desktop**: 1320px max width

## 6. Iconography

### 6.1 Icon Style
- **Style**: Linear, outlined icons with consistent stroke width (2px)
- **Size**: 16px, 20px, 24px, 32px, 48px
- **Color**: Inherits text color or uses semantic colors

### 6.2 Icon Library
- **Upload**: File upload, cloud upload
- **Analysis**: Microscope, search, scan
- **Results**: Chart, graph, report
- **Verification**: Checkmark, shield, verified badge
- **Alerts**: Warning, error, info
- **Navigation**: Menu, close, arrow

### 6.3 Accessibility
- Icons must have text alternatives
- Decorative icons hidden from screen readers
- Functional icons labeled appropriately

## 7. Cross-Platform Consistency

### 7.1 Web Platform
- Full feature set with advanced analysis options
- Responsive grid layout adapting to screen size
- Keyboard navigation and shortcuts
- Browser extension integration points

### 7.2 Mobile Platform
- Touch-optimized interface with larger targets
- Simplified navigation with bottom tab bar
- Contextual actions in floating action buttons
- Offline capabilities for basic functions

### 7.3 Desktop Application
- Multi-window support for parallel analysis
- File system integration for drag-and-drop
- System tray notifications
- Keyboard-centric workflows

### 7.4 Browser Extension
- Minimal interface overlaying web content
- One-click analysis of media elements
- Context menu integration
- Popup for detailed results

## 8. Component States

### 8.1 Interactive States
- **Default**: Standard appearance
- **Hover**: Subtle visual feedback (background change, shadow)
- **Focus**: Clear focus indicator (border, outline)
- **Active**: Pressed or selected state
- **Disabled**: Reduced opacity (40%), no interaction

### 8.2 Loading States
- **Skeleton screens**: Content placeholders during loading
- **Progress indicators**: Determinate and indeterminate spinners
- **Empty states**: Illustrations with clear calls to action

### 8.3 Error States
- **Form validation**: Inline error messages with icons
- **System errors**: Full-page error screens with recovery options
- **Network issues**: Offline banners with retry functionality

## 9. Branding Elements

### 9.1 Logo Usage
- **Primary Logo**: Full wordmark with icon
- **Icon Only**: Simplified icon for app icons and favicons
- **Minimum Size**: 24px for legibility
- **Clear Space**: Maintain 1x logo height as clear space

### 9.2 Imagery Style
- **Photography**: Authentic, diverse, professional
- **Illustrations**: Clean, geometric, consistent stroke width
- **Data Visualizations**: Clear, accessible, colorblind-friendly

## 10. Implementation Guidelines

### 10.1 CSS Custom Properties
```css
:root {
  /* Colors */
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-light: #3B82F6;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-tertiary: #6B7280;
  --color-background: #FFFFFF;
  --color-surface: #F3F4F6;
  --color-border: #E5E7EB;
  
  /* Typography */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'Roboto Mono', monospace;
  --font-size-display: 3rem;
  --font-size-h1: 2.25rem;
  --font-size-h2: 1.5rem;
  --font-size-h3: 1.25rem;
  --font-size-body-large: 1.125rem;
  --font-size-body: 1rem;
  --font-size-body-small: 0.875rem;
  --font-size-caption: 0.75rem;
  
  /* Spacing */
  --spacing-xxs: 0.25rem;
  --spacing-xs: 0.5rem;
  --spacing-s: 1rem;
  --spacing-m: 1.5rem;
  --spacing-l: 2rem;
  --spacing-xl: 3rem;
  --spacing-xxl: 4rem;
  
  /* Borders */
  --border-radius-small: 0.25rem;
  --border-radius-medium: 0.5rem;
  --border-radius-large: 0.75rem;
  --border-radius-circle: 50%;
  --border-width: 1px;
}
```

### 10.2 Component Library Structure
```
components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   ├── Icon/
│   ├── Badge/
│   └── ...
├── molecules/
│   ├── Card/
│   ├── FormField/
│   ├── Modal/
│   └── ...
├── organisms/
│   ├── Header/
│   ├── Footer/
│   ├── AnalysisResult/
│   └── ...
└── templates/
    ├── Dashboard/
    ├── Analysis/
    └── ...
```

This design system provides a foundation for consistent, accessible, and user-friendly interfaces across all VeritasAI platforms while maintaining flexibility for platform-specific adaptations.