# Contributing to ShotAPI

Thank you for considering contributing to ShotAPI! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to be respectful and considerate of others. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (OS, browser, etc.)

### Suggesting Features

Feature suggestions are welcome! Create an issue with:

1. A clear, descriptive title
2. A detailed description of the proposed feature
3. Any relevant context or examples
4. If possible, outline a potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure they pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

To set up the project locally:

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/shotapi.git
   cd shotapi
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

## Code Style

We use ESLint for linting. Please make sure your code passes linting before submitting a PR:

```bash
npm run lint
```

## Testing

We use Jest for testing. Run tests with:

```bash
npm test
```

When adding new features, please include appropriate tests.

## Documentation

If your changes affect the API or functionality, please update the documentation accordingly, including:

- README.md
- API documentation in public/docs.html
- JSDoc comments in the code

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing!