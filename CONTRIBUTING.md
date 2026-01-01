# Contributing

Contributions are welcome! This tool is designed to be extended and customized.

See the **Future Enhancements** section in the [README](README.md) for ideas on what could be built next.

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure everything works:
   ```bash
   # Backend tests
   pytest tests_backend/ -v
   
   # Frontend tests
   cd frontend && npm test
   
   # E2E tests (requires server running)
   cd tests && npm test
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
