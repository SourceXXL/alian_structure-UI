# Contributing to stellAIverse-frontend

Thank you for your interest in contributing to stellAIverse! We welcome contributions from the community, including bug reports, feature requests, documentation improvements, and code contributions.

## Code of Conduct

Please treat all community members with respect and kindness. We're committed to providing a welcoming, inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue on GitHub with the following information:

- **Description**: Clear explanation of the bug
- **Steps to reproduce**: Detailed steps to replicate the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots/Logs**: Any relevant screenshots or error messages

### Requesting Features

Have an idea for a new feature? Open an issue with:

- **Title**: Concise feature description
- **Description**: Detailed explanation of the feature and why it would be useful
- **Use case**: How would users benefit from this feature?
- **Acceptance criteria**: What does "done" look like?

### Submitting Code Changes

#### Step 1: Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/stellAIverse-frontend.git
cd stellAIverse-frontend

# Add upstream remote
git remote add upstream https://github.com/StellAIverse/stellAIverse-frontend.git
```

#### Step 2: Create a Feature Branch

```bash
# Update main from upstream
git fetch upstream
git checkout main
git rebase upstream/main

# Create a new feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/your-bug-fix-name
```

#### Step 3: Make Your Changes

- Write clear, maintainable code
- Follow the existing code style and conventions
- Add comments for complex logic
- Keep commits atomic and with descriptive messages
- Update relevant documentation

#### Step 4: Test Your Changes

```bash
# Install dependencies if needed
npm install

# Run the development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

Ensure your changes:
- Don't break existing functionality
- Include tests for new features
- Follow the project's code style

#### Step 5: Commit and Push

```bash
# Commit with clear message
git commit -m "feat: add new feature" 
# or
git commit -m "fix: resolve issue with component"

# Push to your fork
git push origin feature/your-feature-name
```

**Commit Message Format:**
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes (formatting, missing semicolons, etc.)
- `refactor:` for code refactoring
- `test:` for adding or updating tests
- `chore:` for build, dependency, or configuration changes

#### Step 6: Submit a Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your branch to compare with `main`
4. Fill in the PR template with:
   - Description of changes
   - Related issues (use `Closes #123`)
   - Type of change (feature/fix/docs/etc.)
   - Testing instructions
   - Screenshots (if UI-related)

## Code Style Guide

### JavaScript/TypeScript

- Use **2 spaces** for indentation
- Use `const` by default, `let` if reassignment is needed
- Avoid `var`
- Use meaningful variable names
- Keep functions focused and small
- Use arrow functions for callbacks

Example:
```typescript
// Good
const handleAgentCreation = (agentData: AgentConfig): void => {
  validateAgentData(agentData);
  createAgent(agentData);
};

// Avoid
var handleAgentCreation = function(agentData) {
  // logic here
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use PropTypes or TypeScript for type safety
- Name components with PascalCase
- Place styles close to components (Tailwind CSS preferred)

Example:
```typescript
interface AgentCardProps {
  name: string;
  description: string;
  onSelect: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, description, onSelect }) => {
  return (
    <div className="bg-gradient-to-b from-blue-500 to-purple-600 p-4 rounded-lg">
      <h3 className="text-white font-bold">{name}</h3>
      <p className="text-gray-200">{description}</p>
    </div>
  );
};

export default AgentCard;
```

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Avoid custom CSS when Tailwind classes suffice
- Use responsive prefixes (`sm:`, `md:`, `lg:`)
- Maintain consistency with the cosmic theme

## Testing

We encourage test coverage for all new features:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

## Documentation

- Update README.md if adding features or changing setup
- Add JSDoc comments to complex functions
- Document component props and state
- Keep docs up-to-date with code changes

## Getting Help

- **GitHub Issues**: Ask questions in issue discussions
- **GitHub Discussions**: Join community conversations
- **Pull Request Reviews**: Our team will provide feedback on your PR

## Review Process

1. Maintainers will review your PR within a few days
2. You may be asked to make changes
3. Once approved, your changes will be merged!
4. Your contribution will be credited

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make stellAIverse better! 🚀✨
