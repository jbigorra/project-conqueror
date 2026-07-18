# LOW PRIORITY

- [ ] Add svelte-bun adapter and replace adapter-auto in svelte.config.js

# BUGS

- [ ] Fix bug in breacrumbs. The url for each crumb is incorrect. Example: /project/desktop -> "Home / Project / Desktop" Where: Home -> /, Project -> /project, Desktop -> /desktop

# FEATURES

## EPIC-1: Analyze a repository

### MVI-1.1: Select a repository and visualize it in the dashboard

VALUE: Allows the user to select a repository and visualize it in the dashboard.

- [x] Done?

### MVI-1.2: Clone the selected repository in the default application "repositories" folder.

VALUE: Enables the posisibility to run analyses on the cloned repository.

- [ ] Done?

### MVI-1.3: Run complexity-hotspots analysis and persist results in dedicated folder

VALUE: Enables building the visualization of the analysis

- [ ] Done?

### MVI-1.4: Visualize complexity-hotspots analysis

VALUE: Allows the user to visualize the results of the complexity-hotspots analysis in an enclosure-diagram.

- [ ] Done?

### MVI-1.5: Polish the user interface

VALUE: Cleans up the user interface and makes it more intuitive.

- [ ] Done?

# IDEAS

## IDEA-1:

The home page should have multiple "tabs": RADAR, ADD REPOSITORY, PROJECTS, SETTINGS

- RADAR: displays a radar chart. In the center is the total aggregated health score of all the projects. Surrounding the center there are circles representing each project. The redder and closer the circle is to the center the worse the project's health is and the bigger the impact is on the overall health score. Hovering over a circle displays the project name, health score, impact on the overall score and potential percentage change in the overall score if the project were to improve.
- ADD REPOSITORY: allows the user to add a new repository to the dashboard for analysis.
- PROJECTS: displays a list of all the projects currently in the dashboard. Can be toggled between list or card view. Each card or list item displays the project name, health score and other useful metrics. Clicking on a card or list item takes the user to the project's details page.
- SETTINGS: allows the user to configure application and dashboard settings.

## IDEA-2:

The repository analyses are persisted locally on the user's machine. But, if enabled, they can be persisted remotely on a server. Value: frees up user's local storage space.
