# @tailor-platform/function-logger

Simple logger utility for Tailor Function applications.

## Installation

```bash
npm install @tailor-platform/function-logger
```

## Usage

```typescript
import logger from '@tailor-platform/function-logger';

// Log messages at different levels
logger.debug('Debug message', { extra: 'data' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', new Error('Something went wrong'));
```

## API

The logger provides four log levels:

- `debug`: For detailed debugging information
- `info`: For general informational messages
- `warn`: For warning messages
- `error`: For error messages

Each method accepts a message string and optional additional arguments that will be logged.

## Building

```bash
npm run build
```
