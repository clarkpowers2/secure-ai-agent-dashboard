# Design Guidelines: Secure AI Agent Dashboard

## Design Approach
**Design System**: Material Design 3 with dashboard-focused adaptations
**Rationale**: Information-dense monitoring tool requiring clarity, hierarchy, and trust signals. Material's elevation system and data visualization patterns align perfectly with security/system monitoring needs.

## Core Design Elements

### Typography
- **Primary Font**: Inter (Google Fonts) - exceptional legibility for data
- **Monospace**: JetBrains Mono - for logs, file paths, code snippets
- **Scale**: 
  - Headings: text-2xl (24px) font-semibold
  - Body: text-base (16px) 
  - Data/Metrics: text-sm (14px) font-medium
  - Labels: text-xs (12px) uppercase tracking-wide

### Layout System
- **Spacing Units**: Tailwind 4, 6, 8, 12, 16 (consistent rhythm)
- **Container**: max-w-7xl for main dashboard
- **Grid**: 12-column for flexible card layouts

### Component Library

**Dashboard Layout**
- Sidebar navigation (256px fixed): Agent modules, settings, security
- Main content area: Responsive grid of monitoring cards
- Top bar: Status indicator, user, quick actions

**Authentication**
- Full-screen PIN entry: Centered card (max-w-md), large numeric input, biometric icon
- Security badge: Lock icon + "End-to-end encrypted" subtitle

**Monitoring Cards**
- System Health: CPU/Memory gauges with color-coded thresholds (green <60%, amber 60-80%, red >80%)
- Real-time Activity: Live log stream, monospace text, timestamp column
- Pattern Insights: Bar charts showing app usage frequency
- Emotion Timeline: Line graph with anonymized sentiment data

**Privacy Controls**
- Toggle switches (large, clear labels): Camera, File Access, Auto-Organization
- Consent modal: Explicit "Allow" buttons, detailed permission descriptions
- Privacy Status: Persistent indicator showing active monitoring

**Data Visualization**
- Use Chart.js or Recharts
- Consistent color palette for metrics
- Tooltips on hover for detailed data

**Forms/Inputs**
- Floating labels for text inputs
- Large touch targets (min 44px)
- Clear validation states with icons

### Navigation
- Persistent left sidebar with icons + labels
- Sections: Dashboard, Patterns, Activity Logs, Settings, Security
- Active state: Colored accent bar + filled icon

### Key Screens
1. **PIN Authentication**: Centered, minimal, secure aesthetic
2. **Dashboard Overview**: 2x3 grid of metric cards
3. **Activity Monitor**: Full-width table with filtering
4. **Privacy Settings**: Toggle grid with descriptions
5. **Pattern Insights**: Data visualizations with export options

### Icons
- **Library**: Material Icons (via CDN)
- **Usage**: 20px for inline, 24px for standalone, 32px for feature icons

### Images
**No hero images** - This is a utility dashboard. Focus on data clarity over visual storytelling.

**Trust Indicators**: Shield/lock iconography throughout for security emphasis.