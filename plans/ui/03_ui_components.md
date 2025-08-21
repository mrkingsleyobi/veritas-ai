# VeritasAI UI Components

## 1. Component Library Overview

The VeritasAI component library consists of reusable UI elements organized into atoms, molecules, organisms, and templates. Each component is designed to be accessible, responsive, and consistent with the design system principles.

## 2. Atoms (Foundational Elements)

### 2.1 Buttons
**Primary Button**
```jsx
<Button variant="primary" size="medium">
  Analyze Content
</Button>
```
- Used for primary actions (submit, analyze, confirm)
- Solid background with high contrast text
- Hover state: darken background by 10%
- Focus state: visible outline

**Secondary Button**
```jsx
<Button variant="secondary" size="medium">
  Cancel
</Button>
```
- Used for secondary actions (cancel, back, dismiss)
- Bordered with colored text
- Hover state: subtle background fill

**Ghost Button**
```jsx
<Button variant="ghost" size="small">
  View Details
</Button>
```
- Used for supplementary actions
- Text only with hover background
- Minimal visual prominence

**Icon Button**
```jsx
<Button variant="icon" icon="upload">
  <Icon name="upload" />
</Button>
```
- Used for toolbar actions
- Square aspect ratio
- Icon-only presentation

### 2.2 Inputs
**Text Input**
```jsx
<Input 
  type="text" 
  placeholder="Enter URL to analyze" 
  label="Content URL"
/>
```
- Standard form input with label
- Error and success states
- Helper text support

**File Upload**
```jsx
<FileUpload 
  accept=".jpg,.png,.mp4,.mov,.wav,.mp3"
  maxSize="500MB"
/>
```
- Drag-and-drop zone
- File type validation
- Progress indicator

**Select/Dropdown**
```jsx
<Select 
  options={[
    {value: 'image', label: 'Image'},
    {value: 'video', label: 'Video'},
    {value: 'audio', label: 'Audio'}
  ]}
  label="Content Type"
/>
```
- Custom styled dropdown
- Searchable options
- Multi-select capability

### 2.3 Status Indicators
**Confidence Badge**
```jsx
<Badge variant="success" icon="check">
  High Confidence (95%)
</Badge>
```
- Color-coded based on confidence level
- Icon representation
- Text label with percentage

**Loading Spinner**
```jsx
<Spinner size="medium" />
```
- Three sizes (small, medium, large)
- Determinate and indeterminate variants
- Accessible with aria-label

### 2.4 Icons
**Icon Component**
```jsx
<Icon name="shield-check" size="24" />
```
- Consistent stroke width (2px)
- Semantic naming
- Size variants (16, 20, 24, 32, 48)

## 3. Molecules (Composite Elements)

### 3.1 Cards
**Content Card**
```jsx
<Card>
  <Card.Header>
    <h3>Video Analysis</h3>
    <Badge variant="warning">Processing</Badge>
  </Card.Header>
  <Card.Content>
    <ProgressBar value={65} />
    <p>Estimated time: 2 minutes</p>
  </Card.Content>
</Card>
```
- Header with title and status
- Content area for details
- Footer with actions

**Result Card**
```jsx
<ResultCard 
  title="Deepfake Detection"
  confidence={0.85}
  status="detected"
  details="Facial manipulation detected at 2:15"
/>
```
- Visual confidence indicator
- Status-specific styling
- Expandable details section

### 3.2 Forms
**Analysis Form**
```jsx
<Form>
  <FormField label="Content Source">
    <Tabs>
      <Tab label="Upload File" />
      <Tab label="Enter URL" />
    </Tabs>
  </FormField>
  <FormField label="Content Type">
    <RadioGroup options={contentTypes} />
  </FormField>
  <Button type="submit">Start Analysis</Button>
</Form>
```
- Tabbed interface for input methods
- Validation and error handling
- Progressive disclosure

### 3.3 Navigation
**Top Navigation**
```jsx
<Navbar>
  <Navbar.Brand>
    <Logo />
    <span>VeritasAI</span>
  </Navbar.Brand>
  <Navbar.Menu>
    <NavLink href="/dashboard">Dashboard</NavLink>
    <NavLink href="/analysis">New Analysis</NavLink>
    <NavLink href="/reports">Reports</NavLink>
  </Navbar.Menu>
  <Navbar.User>
    <UserMenu />
  </Navbar.User>
</Navbar>
```
- Responsive collapse to hamburger menu
- Active state indication
- User profile dropdown

**Side Navigation**
```jsx
<Sidebar>
  <Sidebar.Item icon="dashboard" href="/dashboard">
    Dashboard
  </Sidebar.Item>
  <Sidebar.Item icon="analysis" href="/analysis">
    New Analysis
  </Sidebar.Item>
  <Sidebar.Item icon="reports" href="/reports">
    Reports
  </Sidebar.Item>
</Sidebar>
```
- Collapsible on smaller screens
- Nested menu support
- Current page highlighting

### 3.4 Modals
**Confirmation Modal**
```jsx
<Modal isOpen={showDeleteConfirm} onClose={handleClose}>
  <Modal.Header>
    <h2>Confirm Deletion</h2>
  </Modal.Header>
  <Modal.Content>
    <p>Are you sure you want to delete this analysis?</p>
  </Modal.Content>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleConfirm}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>
```
- Overlay background
- Focus trapping
- Escape key support

## 4. Organisms (Complex Components)

### 4.1 Dashboard Widgets
**Analytics Summary**
```jsx
<AnalyticsWidget 
  title="This Week"
  data={{
    totalAnalyses: 42,
    deepfakesDetected: 8,
    avgConfidence: 0.87
  }}
/>
```
- Key metrics display
- Trend indicators
- Time period selector

**Recent Analyses**
```jsx
<RecentAnalysesList 
  analyses={recentAnalyses}
  onAnalysisClick={handleAnalysisClick}
/>
```
- Scrollable list
- Status indicators
- Quick actions

### 4.2 Analysis Results
**Confidence Visualization**
```jsx
<ConfidenceChart 
  score={0.85}
  segments={[
    {type: 'authentic', value: 0.85},
    {type: 'manipulated', value: 0.15}
  ]}
/>
```
- Radial progress visualization
- Color-coded segments
- Interactive details

**Findings Timeline**
```jsx
<FindingsTimeline 
  findings={analysisFindings}
  duration={videoDuration}
/>
```
- Chronological display
- Interactive markers
- Detailed tooltips

### 4.3 Report Generator
**Report Preview**
```jsx
<ReportPreview 
  content={analysisContent}
  findings={analysisFindings}
  metadata={analysisMetadata}
/>
```
- Paginated preview
- Export options
- Customization controls

## 5. Templates (Page Structures)

### 5.1 Dashboard Template
```jsx
<DashboardTemplate>
  <DashboardTemplate.Header>
    <h1>Dashboard</h1>
    <Button variant="primary" icon="plus">
      New Analysis
    </Button>
  </DashboardTemplate.Header>
  <DashboardTemplate.Content>
    <Grid columns={3}>
      <AnalyticsWidget />
      <RecentAnalyses />
      <QuickActions />
    </Grid>
  </DashboardTemplate.Content>
</DashboardTemplate>
```

### 5.2 Analysis Template
```jsx
<AnalysisTemplate>
  <AnalysisTemplate.Header>
    <Breadcrumb 
      items={[
        {label: 'Dashboard', href: '/dashboard'},
        {label: 'New Analysis', href: '/analysis'}
      ]}
    />
    <h1>New Analysis</h1>
  </AnalysisTemplate.Header>
  <AnalysisTemplate.Content>
    <AnalysisForm />
  </AnalysisTemplate.Content>
</AnalysisTemplate>
```

### 5.3 Report Template
```jsx
<ReportTemplate>
  <ReportTemplate.Header>
    <Button variant="secondary" icon="download">
      Download PDF
    </Button>
    <Button variant="secondary" icon="share">
      Share
    </Button>
  </ReportTemplate.Header>
  <ReportTemplate.Content>
    <ReportPreview />
  </ReportTemplate.Content>
</ReportTemplate>
```

## 6. Component Accessibility

### 6.1 Keyboard Navigation
- All interactive components keyboard accessible
- Logical tab order
- Visible focus indicators
- Shortcut keys for common actions

### 6.2 Screen Reader Support
- Proper ARIA labels and roles
- Semantic HTML structure
- Live regions for dynamic updates
- Skip navigation links

### 6.3 Color Contrast
- Minimum 4.5:1 contrast for text
- Minimum 3:1 contrast for UI components
- Colorblind-friendly palette
- High contrast mode support

## 7. Responsive Behavior

### 7.1 Breakpoint Adaptations
- **Mobile**: Stacked layouts, simplified navigation
- **Tablet**: Condensed spacing, tabbed interfaces
- **Desktop**: Multi-column layouts, expanded features
- **Large Desktop**: Maximum content width, additional columns

### 7.2 Touch Optimization
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Gestures for common actions
- Visual feedback for touch interactions

## 8. Component API Design

### 8.1 Consistent Props
```jsx
// All components follow consistent prop patterns
<Component
  id="unique-id"
  className="additional-classes"
  style={customStyles}
  aria-label="accessibility-label"
  data-testid="test-id"
/>
```

### 8.2 Event Handling
```jsx
<Component
  onClick={handleClick}
  onChange={handleChange}
  onFocus={handleFocus}
  onBlur={handleBlur}
/>
```

### 8.3 State Management
```jsx
<Component
  value={value}
  defaultValue={defaultValue}
  disabled={isDisabled}
  loading={isLoading}
  error={errorMessage}
/>
```

This component library provides a comprehensive set of reusable UI elements that maintain consistency across platforms while offering the flexibility needed for VeritasAI's diverse functionality.