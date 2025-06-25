[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/datastax-astra-db-mcp-badge.png)](https://mseep.ai/app/datastax-astra-db-mcp)

# Astra DB MCP Server

A Model Context Protocol (MCP) server for interacting with Astra DB. MCP extends the capabilities of Large Language Models (LLMs) by allowing them to interact with external systems as agents.

<a href="https://glama.ai/mcp/servers/tigix0yf4b">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/tigix0yf4b/badge" alt="Astra DB Server MCP server" />
</a>

## Prerequisites

You need to have a running Astra DB database. If you don't have one, you can create a free database [here](https://astra.datastax.com/register). From there, you can get two things you need:

1. An Astra DB Application Token
2. The Astra DB API Endpoint

To learn how to get these, please [read the getting started docs](https://docs.datastax.com/en/astra-db-serverless/api-reference/dataapiclient.html#set-environment-variables).

## Adding to an MCP client

Here's how you can add this server to your MCP client.

### Claude Desktop

![Claude Desktop](https://github.com/datastax/astra-db-mcp/raw/main/docs/img/claude-settings.png)

To add this to [Claude Desktop](https://claude.ai/download), go to Preferences -> Developer -> Edit Config and add this JSON blob to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "astra-db-mcp": {
      "command": "npx",
      "args": ["-y", "@datastax/astra-db-mcp"],
      "env": {
        "ASTRA_DB_APPLICATION_TOKEN": "your_astra_db_token",
        "ASTRA_DB_API_ENDPOINT": "your_astra_db_endpoint"
      }
    }
  }
}
```

**Optional Keyspace Configuration:**
By default, this server uses the keyspace configured in the underlying Astra DB library (typically `default_keyspace`). If you need to connect to a specific keyspace, you can add the `ASTRA_DB_KEYSPACE` variable to the `env` object above, like so:

```json
"env": {
  "ASTRA_DB_APPLICATION_TOKEN": "your_astra_db_token",
  "ASTRA_DB_API_ENDPOINT": "your_astra_db_endpoint",
  "ASTRA_DB_KEYSPACE": "your_desired_keyspace"
}
```

**Windows PowerShell Users:**
`npx` is a batch command so modify the JSON as follows:

```json
  "command": "cmd",
  "args": ["/k", "npx", "-y", "@datastax/astra-db-mcp"],
```

### Cursor

![Cursor](https://github.com/datastax/astra-db-mcp/raw/main/docs/img/cursor-settings.png)

To add this to [Cursor](https://www.cursor.com/), go to Settings -> Cursor Settings -> MCP

From there, you can add the server by clicking the "+ Add New MCP Server" button, where you should be brought to an `mcp.json` file.

> **Tip**: there is a `~/.cursor/mcp.json` that represents your Global MCP settings, and a project-specific `.cursor/mcp.json` file
> that is specific to the project. You probably want to install this MCP server into the project-specific file.

Add the same JSON as indiciated in the Claude Desktop instructions.

Alternatively you may be presented with a wizard, where you can enter the following values (for Unix-based systems):

- Name: Whatever you want
- Type: Command
- Command:

```sh
env ASTRA_DB_APPLICATION_TOKEN=your_astra_db_token ASTRA_DB_API_ENDPOINT=your_astra_db_endpoint npx -y @datastax/astra-db-mcp
```

*Note: `ASTRA_DB_KEYSPACE` is optional. If omitted, the default keyspace configured in the Astra DB library will be used.*

Once added, your editor will be fully connected to your Astra DB database.

## Available Tools

The server provides the following tools for interacting with Astra DB:

- `GetCollections`: Get all collections in the database
- `CreateCollection`: Create a new collection in the database
- `UpdateCollection`: Update an existing collection in the database
- `DeleteCollection`: Delete a collection from the database
- `ListRecords`: List records from a collection in the database
- `GetRecord`: Get a specific record from a collection by ID
- `CreateRecord`: Create a new record in a collection
- `UpdateRecord`: Update an existing record in a collection
- `DeleteRecord`: Delete a record from a collection
- `FindRecord`: Find records in a collection by field value
- `BulkCreateRecords`: Create multiple records in a collection at once
- `BulkUpdateRecords`: Update multiple records in a collection at once
- `BulkDeleteRecords`: Delete multiple records from a collection at once
- `OpenBrowser`: Open a web browser for authentication and setup
- `HelpAddToClient`: Get assistance with adding Astra DB client to your MCP client
- `EstimateDocumentCount`: Get estimate of the number of documents in a collection

## Changelog
All notable changes to this project will be documented in [this file](./CHANGELOG.md).
The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).



## Running evals

The evals package loads an mcp client that then runs the index.ts file, so there is no need to rebuild between tests. You can load environment variables by prefixing the npx command. Full documentation can be found [here](https://www.mcpevals.io/docs).

```bash
OPENAI_API_KEY=your-key  npx mcp-eval evals.ts tools.ts
```
## ❤️ Contributors

[![astra-db-mcp contributors](https://contrib.rocks/image?repo=datastax/astra-db-mcp)](https://github.com/datastax/astra-db-mcp/graphs/contributors)

---