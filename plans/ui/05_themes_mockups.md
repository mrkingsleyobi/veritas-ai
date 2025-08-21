# VeritasAI Themes and UI Mock-ups

## 1. Theme Design Principles

### 1.1 Modern Aesthetic
VeritasAI's theme design follows contemporary UI/UX principles with:
- Clean, minimalist interfaces
- Ample white space for visual breathing room
- Consistent spacing and alignment
- Sophisticated color palette with semantic meaning
- Subtle shadows and depth for visual hierarchy

### 1.2 Professional Tone
The visual design conveys:
- Trustworthiness through clean lines and professional typography
- Authority with data visualization and technical presentation
- Approachability through balanced color usage and friendly iconography
- Credibility with clear information hierarchy and precise data presentation

### 1.3 Adaptive Themes
Support for multiple theme variations:
- **Light Theme**: Default professional appearance
- **Dark Theme**: Reduced eye strain for extended analysis sessions
- **High Contrast Theme**: Enhanced accessibility for visually impaired users
- **Brand Theme**: Customizable for enterprise deployments

## 2. Light Theme Mock-ups

### 2.1 Dashboard Interface
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│  │  [VERITAS]  │ │  🔔 ⚙️ John Doe ▼                                    │ │
│  └─────────────┘ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  DASHBOARD                                                              │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ │
│  │  │  📊 TOTAL       │ │  🎯 DEEPFAKE    │ │  📈 AVG         │           │ │
│  │  │  ANALYSES       │ │  DETECTED       │ │  CONFIDENCE     │           │ │
│  │  │  142            │ │  27             │ │  87%            │           │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘           │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  🕒 RECENT ANALYSES                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ 🎥 Video: news_footage.mp4        ● Processing (65%)          │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🖼️ Image: screenshot.png          ✓ Complete (92%)            │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🔊 Audio: interview.wav           ⚠ Flagged (78%)              │ │ │ │
│  │  │  └─────────────────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ⚡ QUICK ACTIONS                                                    │ │ │
│  │  │  [ Upload File ]  [ Enter URL ]  [ Batch Process ]                  │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Analysis Results Interface
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│  │  [VERITAS]  │ │  🔔 ⚙️ John Doe ▼                                    │ │
│  └─────────────┘ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  ← Dashboard                                                            │ │
│  │                                                                         │ │
│  │  ANALYSIS RESULTS: news_footage.mp4                                     │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  AUTHENTICITY SCORE                                             ✓   │ │ │
│  │  │                                                                     │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │                            ████████░░                           │ │ │ │
│  │  │  │                            85% AUTHENTIC                        │ │ │ │
│  │  │  └─────────────────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                                     │ │ │
│  │  │  Confidence: High (92%)    Processing Time: 2m 15s                 │ │ │
│  │  │  Analyzed: Today at 14:30                                          │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────────┐ │ │
│  │  │  🔍 FINDINGS    │ │  🛠 TECHNICAL   │ │  🕐 TIMELINE                │ │ │
│  │  │                 │ │  DETAILS        │ │                             │ │ │
│  │  │  ● Deepfake     │ │  Model: v2.1.0  │ │  00:00 ✓ Authentic          │ │ │
│  │  │  ○ Splicing     │ │  Accuracy: 95%  │ │  01:25 ⚠ Face Swap          │ │ │
│  │  │  ● Audio Sync   │ │  Precision: 93% │ │  02:10 ✓ Authentic          │ │ │
│  │  │                 │ │  Recall: 97%    │ │  03:45 ⚠ Lip Sync           │ │ │
│  │  │  [View Report]  │ │                 │ │  ...                        │ │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ⚙ ACTIONS                                                          │ │ │
│  │  │  [ Download Report ] [ Share Results ] [ Re-analyze ] [ Flag ]      │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 3. Dark Theme Mock-ups

### 3.1 Dashboard Interface (Dark Theme)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│  │  [VERITAS]  │ │  🔔 ⚙️ John Doe ▼                                    │ │
│  └─────────────┘ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  DASHBOARD                                                              │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ │
│  │  │  📊 TOTAL       │ │  🎯 DEEPFAKE    │ │  📈 AVG         │           │ │
│  │  │  ANALYSES       │ │  DETECTED       │ │  CONFIDENCE     │           │ │
│  │  │  142            │ │  27             │ │  87%            │           │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘           │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  🕒 RECENT ANALYSES                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ 🎥 Video: news_footage.mp4        ● Processing (65%)          │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🖼️ Image: screenshot.png          ✓ Complete (92%)            │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🔊 Audio: interview.wav           ⚠ Flagged (78%)              │ │ │ │
│  │  │  └─────────────────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ⚡ QUICK ACTIONS                                                    │ │ │
│  │  │  [ Upload File ]  [ Enter URL ]  [ Batch Process ]                  │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Color scheme for dark theme:
- Background: #111827 (Dark Gray)
- Surface: #1F2937 (Darker Gray)
- Text Primary: #F9FAFB (Light Gray)
- Text Secondary: #D1D5DB (Medium Gray)
- Primary Blue: #60A5FA (Lighter Blue for contrast)
- Success Green: #34D399 (Vibrant Green)
- Warning Orange: #FBBF24 (Bright Orange)
- Alert Red: #F87171 (Soft Red)

## 4. High Contrast Theme Mock-ups

### 4.1 Dashboard Interface (High Contrast)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────┐ ┌─────────────────────────────────────────────────────────┐ │
│  │  [VERITAS]  │ │  🔔 ⚙️ John Doe ▼                                    │ │
│  └─────────────┘ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  DASHBOARD                                                              │ │
│  │                                                                         │ │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │ │
│  │  │  📊 TOTAL       │ │  🎯 DEEPFAKE    │ │  📈 AVG         │           │ │
│  │  │  ANALYSES       │ │  DETECTED       │ │  CONFIDENCE     │           │ │
│  │  │  142            │ │  27             │ │  87%            │           │ │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘           │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  🕒 RECENT ANALYSES                                                 │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ 🎥 Video: news_footage.mp4        ● Processing (65%)          │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🖼️ Image: screenshot.png          ✓ Complete (92%)            │ │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────────┤ │ │ │
│  │  │  │ 🔊 Audio: interview.wav           ⚠ Flagged (78%)              │ │ │ │
│  │  │  └─────────────────────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │ │
│  │  │  ⚡ QUICK ACTIONS                                                    │ │ │
│  │  │  [ Upload File ]  [ Enter URL ]  [ Batch Process ]                  │ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Color scheme for high contrast theme:
- Background: #000000 (Black)
- Surface: #222222 (Dark Gray)
- Text Primary: #FFFFFF (White)
- Text Secondary: #CCCCCC (Light Gray)
- Primary Blue: #0066FF (Vibrant Blue)
- Success Green: #00CC00 (Bright Green)
- Warning Orange: #FF9900 (Bright Orange)
- Alert Red: #FF0000 (Bright Red)

## 5. Component Mock-ups

### 5.1 Button Variants
```
Primary:    [ ANALYZE CONTENT ]
Secondary:  [ Cancel ]
Ghost:      [ View Details ]
Icon:       [▲]
```

### 5.2 Input Fields
```
Text Input:
┌─────────────────────────────────────────────┐
│ https://example.com/video.mp4             │
└─────────────────────────────────────────────┘

File Upload:
┌─────────────────────────────────────────────┐
│ 📁 Drag & drop files here or [ Browse ]   │
│ Supported: JPG, PNG, MP4, MOV, WAV, MP3   │
└─────────────────────────────────────────────┘

Select:
┌─────────────────────────────────────────────┐
│ Content Type [▼]                           │
│ [ Image ] [ Video ] [ Audio ]             │
└─────────────────────────────────────────────┘
```

### 5.3 Status Indicators
```
Success:    [✓] Complete (92%)
Warning:    [⚠] Flagged (78%)
Processing: [●] Processing (65%)
Error:      [✗] Failed
```

### 5.4 Cards
```
┌─────────────────────────────────────────────┐
│ 🎥 Video Analysis                        [●]│
├─────────────────────────────────────────────┤
│ ████████████████░░░░ 85% Complete         │
│ Estimated time: 2 minutes                 │
│                                           │
│ [ View Progress ]                         │
└─────────────────────────────────────────────┘
```

## 6. Mobile-Specific Mock-ups

### 6.1 Mobile Dashboard
```
┌─────────────────────────────────────────────┐
│ [V] 🔔 ☰                                   │
├─────────────────────────────────────────────┤
│ DASHBOARD                                   │
│                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│ │   📊 142    │ │   🎯 27     │ │  📈 87% │ │
│ │ Analyses    │ │ Detected    │ │ Conf.   │ │
│ └─────────────┘ └─────────────┘ └─────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 🎥 news_footage.mp4    ● Processing   │ │
│ │ 🖼️ screenshot.png      ✓ Complete     │ │
│ │ 🔊 interview.wav       ⚠ Flagged      │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [ Upload ] [ URL ]                          │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Home Analysis Reports Profile More          │
└─────────────────────────────────────────────┘
```

### 6.2 Mobile Analysis Results
```
┌─────────────────────────────────────────────┐
│ ← Dashboard 🔔 ☰                            │
├─────────────────────────────────────────────┤
│ RESULTS                                     │
│                                             │
│         ████████░░                          │
│         85% AUTHENTIC                       │
│                                             │
│ Confidence: High (92%)                      │
│ Processing: 2m 15s                          │
│                                             │
│ FINDINGS                                    │
│ ● Deepfake Detection                        │
│ ● Audio Synchronization Issues              │
│                                             │
│ [ Download Report ]                         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Home Analysis Reports Profile More          │
└─────────────────────────────────────────────┘
```

## 7. shadcn-inspired Component Design

### 7.1 Card Component
```tsx
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Analysis Results</CardTitle>
    <CardDescription>news_footage.mp4</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-center space-x-2">
      <Progress value={85} className="w-full" />
      <span className="text-sm font-medium">85%</span>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">View Full Report</Button>
  </CardFooter>
</Card>
```

### 7.2 Alert Component
```tsx
<Alert variant="destructive">
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>
    Deepfake detected with high confidence at 1:25-1:30
  </AlertDescription>
</Alert>
```

### 7.3 Badge Component
```tsx
<Badge variant="success">Authentic</Badge>
<Badge variant="warning">Flagged</Badge>
<Badge variant="destructive">Deepfake</Badge>
```

## 8. Theme Implementation Guidelines

### 8.1 CSS Custom Properties
```css
/* Light Theme */
:root {
  --background: #FFFFFF;
  --foreground: #111827;
  --card: #FFFFFF;
  --card-foreground: #111827;
  --popover: #FFFFFF;
  --popover-foreground: #111827;
  --primary: #2563EB;
  --primary-foreground: #FFFFFF;
  --secondary: #F3F4F6;
  --secondary-foreground: #111827;
  --muted: #F3F4F6;
  --muted-foreground: #6B7280;
  --accent: #F3F4F6;
  --accent-foreground: #111827;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --border: #E5E7EB;
  --input: #E5E7EB;
  --ring: #2563EB;
}

/* Dark Theme */
[data-theme="dark"] {
  --background: #111827;
  --foreground: #F9FAFB;
  --card: #1F2937;
  --card-foreground: #F9FAFB;
  --popover: #1F2937;
  --popover-foreground: #F9FAFB;
  --primary: #60A5FA;
  --primary-foreground: #111827;
  --secondary: #374151;
  --secondary-foreground: #F9FAFB;
  --muted: #374151;
  --muted-foreground: #9CA3AF;
  --accent: #374151;
  --accent-foreground: #F9FAFB;
  --destructive: #F87171;
  --destructive-foreground: #111827;
  --border: #374151;
  --input: #374151;
  --ring: #60A5FA;
}
```

These mock-ups and themes provide a comprehensive visual design system for VeritasAI that maintains consistency across platforms while offering flexibility for different user needs and preferences.