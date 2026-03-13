## ADDED Requirements

### Requirement: Theme options
The system SHALL provide three theme options: **dark**, **light**, and **system**.

#### Scenario: All options available
- **WHEN** the user opens the theme toggle
- **THEN** three options SHALL be displayed: "Light", "Dark", and "System"

### Requirement: System theme as default
The system SHALL default to the **system** theme when no user preference has been stored.

#### Scenario: First visit
- **WHEN** a user visits the application for the first time
- **THEN** the theme SHALL match the user's operating system preference

#### Scenario: System preference is dark
- **WHEN** a user visits with no stored preference and their OS is set to dark mode
- **THEN** the application SHALL render in dark mode

### Requirement: Theme persistence
The system SHALL persist the user's theme selection across sessions using `localStorage`.

#### Scenario: Returning user
- **WHEN** a user selects "Dark" and later revisits the application
- **THEN** the application SHALL render in dark mode without requiring re-selection

### Requirement: Theme toggle component
The system SHALL render a theme toggle component accessible from the main application layout.

#### Scenario: Toggle is visible
- **WHEN** the application loads
- **THEN** a theme toggle button SHALL be visible in the top-right area of the page

#### Scenario: Selecting a theme
- **WHEN** the user clicks the theme toggle and selects "Dark"
- **THEN** the application SHALL immediately switch to dark mode

#### Scenario: Selecting system theme
- **WHEN** the user clicks the theme toggle and selects "System"
- **THEN** the application SHALL follow the operating system's color scheme preference

### Requirement: No flash of unstyled content
The application SHALL NOT display a flash of incorrect theme colors during page load.

#### Scenario: Page load with stored dark preference
- **WHEN** the page loads and the stored preference is "dark"
- **THEN** the page SHALL render in dark mode from the first paint without flickering to light mode

### Requirement: All UI components support dark mode
All existing shadcn/ui components SHALL render correctly in both light and dark themes with appropriate contrast and readability.

#### Scenario: Components in dark mode
- **WHEN** the theme is set to dark
- **THEN** all buttons, dialogs, badges, cards, and skeleton loaders SHALL use dark-appropriate colors via CSS variables
