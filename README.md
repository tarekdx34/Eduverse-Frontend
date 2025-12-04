# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## MCP Server

This project includes a Model Context Protocol (MCP) server for EduVerse application integration. The MCP server provides tools for:

- Getting course information
- Listing available courses
- Enrolling students in courses
- Tracking student progress

### Running the MCP Server

```bash
node mcp-server.js
```

### Available Tools

1. **get_course_info** - Retrieve detailed information about a specific course
2. **list_courses** - List all available courses with optional category filtering
3. **enroll_student** - Enroll a student in a course
4. **get_student_progress** - Get a student's progress in a specific course

### Configuration

The MCP server configuration is defined in `mcp-config.json`. You can add this to your MCP client configuration to connect to the server.

### Customization

The current implementation uses mock data. Replace the mock implementations in `mcp-server.js` with actual API calls or database queries to connect to your backend.

## Figma MCP Server Integration

This project is configured to work with the Figma MCP server, allowing AI assistants to interact with Figma designs.

### Setup

1. The Figma API key is stored in `.env` file (not committed to git)
2. Configuration is in `mcp-config.json`

### Usage with GitHub Copilot CLI

To use the Figma MCP server with GitHub Copilot CLI Agent, copy the `mcp-config.json` configuration to your GitHub Copilot settings:

**Windows**: `%APPDATA%\Code\User\globalStorage\github.copilot-chat\mcp-config.json`

Or configure it in your Copilot settings manually.

### Available Figma Tools

The Figma MCP server provides tools to:
- Get file information from Figma
- Access design components
- Retrieve design tokens
- Export assets

**⚠️ Security Note**: Never commit your `.env` file or share your Figma API key publicly. If exposed, revoke it immediately from Figma settings and generate a new one.
