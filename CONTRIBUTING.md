# Contributing

Contributions are welcome! This tool is designed to be extended and customized.

If you're looking for ideas, see [BACKLOG.md](docs/BACKLOG.md). It's a curated, changeable list of priorities and future ideas (not a promise).

A good way to start is to pick something from **Now** or **Next**, or propose a small, well-scoped improvement from **Later / Maybe**.

## Getting Started

**First time?** See [docs/SETUP.md](docs/SETUP.md) for detailed environment setup instructions.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure everything works:
   ```bash
   # Backend tests (Windows venv)
   .\venv\Scripts\python.exe -m pytest tests_backend/ -v
   
   # Backend tests (Linux/Mac)
   python -m pytest tests_backend/ -v
   
   # Frontend tests
   cd frontend && npm test
   
   # E2E tests
   cd tests && npx playwright test
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits focused and atomic
- Write clear commit messages

## Questions or Suggestions?

Open an issue to discuss your ideas before starting significant work.
