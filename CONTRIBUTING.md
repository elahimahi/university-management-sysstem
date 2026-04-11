# Contributing to University Management System

Thank you for considering contributing to the University Management System! This document provides guidelines and instructions for contributing.

## 🎯 Code of Conduct

- Be respectful and inclusive
- No harassment, discrimination, or hate speech
- Constructive feedback only
- Report violations to the team leads

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
git clone https://github.com/yourusername/university-management-system.git
cd university-management-system
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b bugfix/issue-description
```

### 3. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development
docker-compose up -d
npm start
```

## 📝 Commit Guidelines

### Commit Message Format

```
type: subject

body (optional)
footer (optional)
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without functionality change
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build changes)

### Examples

```bash
# Good
git commit -m "feat: Add fee payment reminder notification system"
git commit -m "fix: Resolve CORS issue in user deletion endpoint"
git commit -m "docs: Update README with Docker instructions"
git commit -m "refactor: Simplify course enrollment validation logic"

# Bad
git commit -m "fixed stuff"
git commit -m "asdf"
git commit -m "updates"
```

## ✅ Code Quality Standards

### Frontend (React/TypeScript)

```bash
# ESLint check
npm run lint

# Fix issues automatically
npm run lint:fix

# Format code
npm run format

# Run tests
npm test
```

### Backend (PHP)

```bash
# PHP syntax check
find backend -name "*.php" -exec php -l {} \;

# Code style check
phpcs --standard=PSR12 backend/

# Run tests
cd backend && phpunit
```

### General Standards

1. **Clean Code**
   - Meaningful variable/function names
   - Functions should do one thing
   - Maximum function length: 50 lines
   - DRY principle: Don't Repeat Yourself

2. **Comments**
   - Explain "why", not "what"
   - Keep comments updated
   - Use JSDoc for functions

3. **Error Handling**
   - Always handle errors
   - Use try-catch appropriately
   - Log meaningful error messages

4. **Security**
   - No hardcoded secrets
   - Validate all inputs
   - Use parameterized queries
   - Follow OWASP guidelines

Example good function:

```typescript
/**
 * Validates user email format and domain
 * @param email - User email to validate
 * @returns true if valid email, false otherwise
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}
```

## 🧪 Testing Requirements

### Frontend Tests
```bash
# Write tests for components
// src/components/YourComponent.test.tsx
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('should render properly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

### Backend Tests
```bash
// backend/tests/YourFeatureTest.php
use PHPUnit\Framework\TestCase;

class YourFeatureTest extends TestCase {
  public function testFeatureFunctionality() {
    $result = yourFunction('input');
    $this->assertEquals('expected', $result);
  }
}
```

### Test Coverage
- Minimum 70% code coverage for new features
- All critical paths must be tested
- Test error cases, not just happy paths

## 🔄 Pull Request Process

### Before Submitting

1. **Update from main**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests locally**
   ```bash
   npm test
   npm run lint
   docker-compose up -d
   # Manual testing
   ```

3. **Update documentation**
   - README.md if needed
   - Inline code comments
   - API documentation

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2

## Testing Done
- Test 1
- Test 2

## Screenshots (if applicable)
<!-- Add images for UI changes -->

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Local tests pass
```

### Review Process

1. Automated checks run (GitHub Actions)
2. Code review by team members
3. Address feedback and make changes
4. Approval from at least 1 maintainer
5. Squash and merge to main

## 📋 Feature Request Guidelines

### Before Requesting

- Check existing issues/PRs
- Verify it aligns with project goals
- Test if feature exists elsewhere

### Feature Request Template

```markdown
## Description
What should be added?

## Motivation
Why is this needed?

## Proposed Solution
How should it work?

## Alternatives Considered
Other approaches?

## Additional Context
Any other details?
```

## 🐛 Bug Report Guidelines

### Required Info

1. **Description**: What's wrong?
2. **Steps**: How to reproduce?
3. **Expected**: What should happen?
4. **Actual**: What actually happens?
5. **Environment**: OS, browser, version?
6. **Screenshots**: Visual evidence

### Bug Report Template

```markdown
## Description
Concise bug description

## Steps to Reproduce
1. Do this
2. Then this
3. Then this

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: 
- Browser: 
- Version: 

## Screenshots
Attach if applicable

## Logs
Include relevant error logs
```

## 📚 Documentation

### Update When

- Adding new features
- Changing API endpoints
- Modifying configuration
- Creating new components

### Document

- Function/component purpose
- Parameters and return types
- Examples and usage
- Error handling
- Related files/functions

## 🎓 Learning Resources

- [Git Workflow](https://github.com/vuetifyjs/vuetify/blob/master/CONTRIBUTING.md)
- [React Best Practices](https://react.dev/)
- [PHP Standards](https://www.php-fig.org/psr/psr-12/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 🤝 Help Needed

### Areas Looking for Contributions

- [ ] Frontend UI improvements
- [ ] Backend API optimization
- [ ] Database performance tuning
- [ ] Documentation
- [ ] Testing
- [ ] Bug fixes
- [ ] Security improvements
- [ ] Localization/Internationalization

## 📞 Questions?

- Create an issue with `question` label
- Contact team leads:
  - Fazle Elahi: fazlemahi250@gmail.com
  - Jonayed Bagdadi: jonayedbagdadi992@gmail.com
  - Ashfaq Ahsan: ashfaq.cse.20230104069@aust.edu

## 📜 License

By contributing, you agree your code is licensed under the MIT License.

---

Thanks for contributing! 🎉
