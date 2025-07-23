# Nextracker Website 2025

This is a starter template for building a blog with Next.js, Contentful, and Mux. It includes a Docker-based development workflow for a consistent development experience across teams.

## Prerequisites

- Docker Desktop installed and running
- Git

No other local dependencies are required! Everything runs inside Docker containers.

## Development Workflow

### Initial Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd NX-2025
   ```

2. Copy the environment file:

   ```bash
   cp .env.example .env.development
   ```

3. Update `.env.development` with your credentials:
   - `CONTENTFUL_SPACE_ID`
   - `CONTENTFUL_ACCESS_TOKEN`
   - `CONTENTFUL_PREVIEW_ACCESS_TOKEN`
   - `MUX_TOKEN_ID`
   - `MUX_TOKEN_SECRET`

### Docker Development

Our Docker setup provides a consistent development environment with:

- 🔥 Hot-reloading for instant feedback
- 📦 Cached node_modules for faster builds
- 🛠️ Built-in debugging support
- 🔍 Health checks for reliability
- 👤 Secure non-root user setup

#### Docker Commands

```bash
# Start development server
npm run docker:start

# Build the application
npm run docker:build

# Run linting and type checking
npm run docker:check

# Stop the development server
npm run docker:down

# Clean up containers and volumes
npm run docker:clean

# Remove all Matic Docker resources
npm run docker:purge
```

#### Development Features

- **Hot Reloading**: Changes to your code will automatically trigger rebuilds
- **Container Management**:
  - The container is named `Matic-Docker-App` for easy identification
  - Volumes are prefixed with `matic-docker-` for organization
- **Automatic Cleanup**:
  - Pressing Ctrl+C during development automatically cleans up resources
  - `docker:check` automatically manages container lifecycle
- **Development Tools**:
  - Access container shell: `./scripts/dev shell`
  - View logs: `./scripts/dev logs`
  - Check status: `./scripts/dev status`

#### Best Practices

1. **Development Workflow**

   - Use `npm run docker:start` for daily development
   - Run `npm run docker:check` before committing changes
   - Keep the logs visible for debugging

2. **Resource Management**

   - Use `npm run docker:clean` to clean up after development
   - Use `npm run docker:purge` when switching branches or for deep cleaning

3. **Troubleshooting**
   - Check container status with `./scripts/dev status`
   - View logs with `./scripts/dev logs`
   - If in doubt, run `npm run docker:purge` and start fresh

### Non-Docker Development

If you prefer to develop without Docker, you'll need:

- Node.js (version specified in package.json)
- npm (version specified in package.json)

Then you can use these commands:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the application
npm run build

# Run linting and type checking
npm run check
```

## Feature Development Workflow

Our feature development workflow is designed to maintain high code quality and consistency across the team. Follow these guidelines for all feature development:

### 1. Branch Management

  <!-- <type>/<ticket-number>-<brief-description> -->

- **Branch Naming Convention**:

  ```
  <type>/<ticket-number>-<brief-description>
  ```

  - Types: `feature`, `bugfix`, `hotfix`, `refactor`, `docs`
  - Example: `feature/MATIC-123-add-video-player`

- **Branch Lifecycle**:
  1. Create from latest `main`
  2. Regular commits during development
  3. Rebase with `main` before PR
  4. Delete after merge

### 2. Development Process

1. **Planning**:

   - Review ticket requirements
   - Break down into tasks
   - Identify affected components
   - Plan test coverage

2. **Local Development**:

   ```bash
   # Start fresh with a new branch
   git checkout main
   git pull
   git checkout -b feature/MATIC-XXX-description

   # Start development environment
   npm run docker:start
   ```

3. **Development Loop**:
   - Write code with hot-reloading
   - Run checks frequently:
     ```bash
     npm run docker:check
     ```
   - Commit logical chunks of work
   - Update tests and documentation

### 3. Code Quality Standards

- **Commit Messages**:

  ```
  <type>: <description>

  [optional body]
  [optional ticket reference]
  ```

  - Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
  - Example: `feat: add video player component`

- **Pre-commit Checks**:

  - Linting (ESLint)
  - Type checking (TypeScript)
  - Code formatting (Prettier)
  - Unit tests (if applicable)

- **Code Style**:
  - Follow ESLint configuration
  - Use TypeScript strictly
  - Document complex logic
  - Keep components focused
  - Follow project structure

### 4. Pull Request Process

1. **Preparation**:

   ```bash
   # Ensure all changes are committed
   git status

   # Rebase with main
   git checkout main
   git pull
   git checkout your-branch
   git rebase main

   # Verify everything works
   npm run docker:purge  # Clean slate
   npm run docker:start  # Verify app works
   npm run docker:check  # Run all checks
   ```

2. **PR Creation**:

   - Use PR template
   - Link related tickets
   - Add screenshots/videos if UI changes
   - Tag relevant reviewers

3. **PR Description**:

   - Summarize changes
   - List testing steps
   - Note any breaking changes
   - Include deployment considerations

4. **Review Process**:
   - Address review comments
   - Keep PR updated with main
   - Get required approvals
   - Ensure all checks pass

### 5. Testing Requirements

- **Unit Tests**: Required for utilities and hooks
- **Integration Tests**: Required for complex features
- **UI Tests**: Required for critical user flows
- **Manual Testing**:
  - Test in development environment
  - Cross-browser testing if needed
  - Mobile responsiveness if applicable

### 6. Documentation

- Update README if needed
- Add inline documentation
- Update API documentation
- Document breaking changes
- Add usage examples

### 7. Deployment

1. **Staging**:

   - Automatic deployment on PR
   - Verify features in staging
   - Run smoke tests

2. **Production**:
   - Merge to main
   - Monitor deployment
   - Verify in production
   - Be ready to rollback

### 8. Troubleshooting

If you encounter issues:

1. **Docker Issues**:

   ```bash
   # Clean slate approach
   npm run docker:purge
   docker system prune -af  # Be careful with this!
   npm run docker:start
   ```

2. **Development Issues**:

   - Check container logs: `./scripts/dev logs`
   - Verify environment variables
   - Clear node_modules: `npm run docker:clean`

3. **Build Issues**:
   - Verify dependencies
   - Check TypeScript errors
   - Review build logs

### 9. Best Practices

- Keep PRs focused and small
- Write descriptive commit messages
- Update tests with code changes
- Document complex logic
- Follow the single responsibility principle
- Use feature flags for big changes
- Keep dependencies updated
- Monitor performance impacts

## Pull Request Template

When creating a pull request, copy and fill out the following template:

```markdown
# Description

Please include a summary of the changes and the related issue. Please also include relevant motivation and context.

Fixes # (issue)

## Type of change

Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] This change requires a documentation update

## How Has This Been Tested?

Please describe the tests that you ran to verify your changes. Provide instructions so we can reproduce.

- [ ] Test A
- [ ] Test B

## Checklist:

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Screenshots (if applicable):

## Additional context:

Add any other context about the pull request here.

## Deployment Notes:

Describe any deployment steps, configuration changes, or other considerations.
```

## Project Structure

```
NX-2025/
├── docker/                    # Docker-related files
│   ├── Dockerfile           # Development Dockerfile
│   └── docker-compose.yml   # Development compose configuration
├── src/                      # Application source code
│   ├── app/                 # Next.js app router files
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and libraries
│   └── styles/              # CSS and styling files
├── .env.development         # Development environment variables
├── .env.example            # Template for environment variables
├── package.json            # Node.js dependencies and scripts
└── README.md               # Project documentation
```

## Project Standards

https://github.com/alan2207/bulletproof-react/blob/master/docs/project-standards.md

- ESlint
  - file naming conventions
- Prettier
- TypeScript
- Husky
  - pre-commit hooks
- absolute imports
  - tsconfig.json

## Project Structure

https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md

## Components and Styling

https://github.com/alan2207/bulletproof-react/blob/master/docs/components-and-styling.md

- shadcn/ui for UI components
  - Radix Primitives
  - TailwindCSS
  - components.json for configuration

## API Layer

https://github.com/alan2207/bulletproof-react/blob/master/docs/api-layer.md

- **Contentful** GraphQL Content Delivery API
  - fetchGraphQL function
  - custom getters
  - custom server side functions
- **Tanstack Query**
  - uses api fucntions custom client hooks
- **Mux** for video streaming
  - the plabackId from the Contentful API
  - the muxData from the Mux API

## Data Fetching

- **React Query** for data fetching
- **React Query DevTools** for debugging

## State Management

https://github.com/alan2207/bulletproof-react/blob/master/docs/state-management.md

- **useState** for component state
- **Jotai** for application state management
- **Jotai DevTools** for debugging

## Form Validation and State Management

- **@tanstack/react-form** for form state management
- **@tanstack/zod-form-adapter** for form validation

## Error Handling

https://github.com/alan2207/bulletproof-react/blob/master/docs/error-handling.md

- **API Errors** for server-side errors
- **React Error Boundary** for component-level error handling
- **ErrorPage** for custom error pages

## Animation Decision Framework

When implementing animations in your components, ask these questions to determine the best approach:

1. **Is it a simple state transition?**

   - If yes → Use Tailwind animations
   - Examples: hover states, fade-ins, simple transitions

2. **Does it need user interaction?**

   - Basic interaction → Use Tailwind animations
   - Complex interaction (gestures, drag) → Use Framer Motion
   - Examples:
     - Tailwind: hover effects, click feedback
     - Framer: drag and drop, pinch to zoom

3. **Does it need to respond to gestures?**

   - If yes → Use Framer Motion
   - Examples: swipe actions, pull to refresh

4. **Is it purely decorative?**

   - If yes → Use Tailwind animations
   - Examples: loading states, entrance animations

5. **Does it need to coordinate with other elements?**
   - If yes → Use Framer Motion
   - Examples: synchronized animations, staggered lists

See the animation examples in `src/app/template/page.tsx` for implementation details.

## Testing

TBD
https://github.com/alan2207/bulletproof-react/blob/master/docs/testing.md

## Security (Authentication and Authorization)

https://github.com/alan2207/bulletproof-react/blob/master/docs/security.md
TBD

## Deployment

https://github.com/alan2207/bulletproof-react/blob/master/docs/deployment.md

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
