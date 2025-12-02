# WARDEX Brand & UI Guide

<p align="center">
  <strong>Secure Access. Anywhere.</strong>
</p>

---

## Brand Overview

### Mission
WARDEX is a next-generation security system that makes home protection accessible, intuitive, and reliable. We build devices you can trust.

### Brand Promise
**"Secure Access. Anywhere."** — secure access from anywhere in the world. Users always stay in control, receive instant notifications, and can respond in real-time.

### Brand Values

- **Reliability** — 24/7 operation, minimal power consumption, stable connectivity
- **Simplicity** — complex technology hidden behind an intuitive interface
- **Control** — full transparency of device status, event history, access management
- **Security** — data encryption, two-factor authentication, local storage

---

## Logo

### Concept

The WARDEX logo combines two key symbols:

1. **Shield** — a universal symbol of protection and security
2. **X** — an accent element symbolizing precision, technology, and "locked" access

The name is derived from **WARD** (protection, guard) + **EX** (from "extended" or "expert"), emphasizing advanced protection capabilities.

### Logo Usage Guidelines
- Primary variant: white/silver logo on dark background
- Minimum icon size: 32px
- Clear space: minimum 1/4 of logo height on all sides
- Always maintain original proportions, no distortion
- Gradient from white to gray creates a metallic surface effect (reliability, durability)

---

## Color Palette

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Background Dark** | `#0A0A0A` | 10, 10, 10 | Main app background |
| **Background Card** | `#1A1A1A` | 26, 26, 26 | Card and element backgrounds |
| **Background Elevated** | `#2A2A2A` | 42, 42, 42 | Elevated elements, input fields |

### Accent Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Alarm Red** | `#E63946` | 230, 57, 70 | Alarm, critical actions, deletion |
| **Success Green** | `#10B981` | 16, 185, 129 | Active state, connected, OK |
| **Warning Amber** | `#F59E0B` | 245, 158, 11 | Warnings, low battery |
| **Info Blue** | `#3B82F6` | 59, 130, 246 | Information, links, Wi-Fi |
| **Accent Teal** | `#14B8A6` | 20, 184, 166 | CTA buttons, accent elements |

### Neutral Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **White** | `#FFFFFF` | 255, 255, 255 | Headings, primary text |
| **Gray 100** | `#E5E5E5` | 229, 229, 229 | Secondary text |
| **Gray 200** | `#A3A3A3` | 163, 163, 163 | Captions, placeholders |
| **Gray 300** | `#737373` | 115, 115, 115 | Inactive elements |
| **Gray 400** | `#525252` | 82, 82, 82 | Borders, dividers |

### Color Psychology

**Dark theme** is a deliberate choice:
- Associates with security and professionalism (like security systems, safes)
- Reduces eye strain during night usage
- Saves battery on OLED screens
- Creates contrast for critical notifications

**Red** is used exclusively for alarm states — ensuring instant recognition of critical situations.

**Green** — the universal color of "all is well", intuitively understood worldwide.

---

## Typography

### Font Family
**SF Pro** (iOS) / **Roboto** (Android) — system fonts for maximum performance and native feel.

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display** | 34px | Bold (700) | 41px | Splash screen, Welcome |
| **Title 1** | 28px | Bold (700) | 34px | Screen titles |
| **Title 2** | 22px | Semibold (600) | 28px | Device names |
| **Title 3** | 20px | Semibold (600) | 25px | Section headers |
| **Body** | 17px | Regular (400) | 22px | Body text |
| **Callout** | 16px | Regular (400) | 21px | Secondary text |
| **Subhead** | 15px | Regular (400) | 20px | Captions |
| **Footnote** | 13px | Regular (400) | 18px | Small text, timestamps |
| **Caption** | 12px | Regular (400) | 16px | Labels, badges |

---

## App Screens

### Authentication Flow

Authentication screens include:
- **Splash Screen** — logo, tagline, CTA buttons
- **Create Account** — registration with email/password
- **Welcome Back** — sign in to existing account

Key features:
- Subtle grid pattern background (technical aesthetic)
- Minimalist forms
- Clear action hierarchy (primary/secondary buttons)

---

### Main Screens

**My Devices (Home)**
- List of all connected devices
- Status of each device (IDLE / ALARM / OFFLINE)
- Quick info: battery, connection type, user count
- Firmware update banner

**Activity Log**
- Event timeline
- Color-coded event types
- "Vibration Detected" badge for suspicious activity

**Settings**
- User profile with subscription plan
- General settings (notifications, language, theme)
- Security (password change, 2FA)

**Device Onboarding**
- Connect Device — NFC or QR code
- Wi-Fi Setup — network selection and password
- Device Setup — name, type, room, color tag

---

### Device Detail Screens

Device screen with three tabs:

**Info Tab**
- Device status and quick stats (battery, door, connection)
- Actions: Trigger Alarm, Share Access, Disable Device
- Device Information: installation date, type, firmware, Wi-Fi network

**Users Tab**
- List of users with access
- Owner badge
- Ability to revoke access
- Add User functionality

**Actions Tab (Activity)**
- Event history for specific device
- Door Unlocked/Locked events
- Alarm events with info on who disabled

**Alarm State**
- Red header and pulsing icon
- "Turn Off Alarm" as primary action
- Visually distinct from normal state

---

## Components

### Cards

```
Background: #1A1A1A
Border Radius: 16px
Padding: 16px
Shadow: none (flat design)
Border: 1px solid #2A2A2A (optional)
```

### Buttons

**Primary Button (CTA)**
```
Background: #FFFFFF
Text: #0A0A0A
Border Radius: 12px
Height: 56px
Font: 17px Semibold
```

**Secondary Button**
```
Background: #2A2A2A
Text: #FFFFFF
Border Radius: 12px
Height: 56px
```

**Danger Button**
```
Background: #E63946
Text: #FFFFFF
Border Radius: 12px
Height: 56px
```

### Input Fields

```
Background: #1A1A1A
Border: 1px solid #2A2A2A
Border Radius: 12px
Height: 52px
Padding: 0 16px
Text: #FFFFFF
Placeholder: #737373
Focus Border: #14B8A6
```

### Status Badges

| Status | Background | Text |
|--------|------------|------|
| IDLE | `#10B981` at 20% opacity | `#10B981` |
| ALARM | `#E63946` | `#FFFFFF` |
| OFFLINE | `#525252` | `#A3A3A3` |

### Tab Bar

```
Background: #0A0A0A
Border Top: 1px solid #2A2A2A
Height: 83px (with safe area)
Active Color: #FFFFFF
Inactive Color: #737373
```

Three main tabs: **Home**, **Activity**, **Profile**

---

## Iconography

### Style
- **Outline icons** for navigation and secondary elements
- **Filled icons** for active states
- Stroke width: 1.5px - 2px
- Corner radius: rounded caps and joins

### Icon Library
**SF Symbols** (iOS) / **Material Icons** (Android)

---

## Animations

### Principles
- **Subtle** — don't distract from content
- **Purposeful** — every animation is functional
- **Fast** — 200-300ms for transitions

### Key Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Screen transitions | Slide from right | 300ms |
| Modal appearance | Slide up + fade | 250ms |
| Button press | Scale to 0.98 | 100ms |
| Status change | Color fade | 200ms |
| Alarm pulse | Scale 1.0 → 1.05 → 1.0 | 1000ms loop |

---

## Grid Pattern Background

Subtle grid pattern on splash screen — a reference to technical blueprints and coordinate systems:

```css
background-image: 
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
background-size: 40px 40px;
```

---

## Push Notifications

| Type | Title | Body |
|------|-------|------|
| Door Opened | Front Door Opened | Detected at 10:42 AM |
| Door Closed | Front Door Closed | Detected at 10:45 AM |
| Alarm | ⚠️ ALARM: Front Door | Vibration detected. Tap to view. |
| Alarm Off | Alarm Disabled | Turned off by John at 10:47 AM |
| Offline | Device Offline | Front Door hasn't connected in 2 hours |

---

## Accessibility

- All text meets WCAG AA standards (minimum 4.5:1 contrast)
- Touch targets minimum 44x44px
- Don't rely on color alone — use icons and text
- Screen reader labels for all elements

---

## Version History

### Brand & UI Guide

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 03.12.2025 | Ivan Legchilov | Initial brand guide |

---

<p align="center">
  <strong>WARDEX — Secure Access. Anywhere.</strong>
</p>
