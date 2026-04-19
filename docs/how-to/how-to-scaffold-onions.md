# How to Use Onion Architecture Scaffolding Script

The `onion-scaff.sh` script is a powerful tool that automatically creates well-structured folder hierarchies following onion architecture principles. It supports two modes: **Domain** scaffolding and **Shared** scaffolding.

## Prerequisites

- Bash shell environment
- Write permissions in target directories
- Optional: `tree` command for better directory visualization

## Quick Start

1. Make the script executable (if not already):
   ```bash
   chmod +x onion-scaff.sh
   ```

2. Run the script:
   ```bash
   ./onion-scaff.sh
   ```

3. Follow the interactive prompts to create your structure.

## Scaffolding Modes

### 1. Domain Mode

Creates a complete onion architecture structure for a specific business domain.

#### Structure Created:
```
domain-name/
├── application/
│   ├── use-cases/
│   └── event-handlers/
├── core/
│   ├── value-objects/
│   ├── entities/
│   └── aggregates/
├── presentation/
│   ├── ui/
│   │   ├── domain-name.page.jsx (empty file)
│   │   └── components/
│   └── controllers/
└── infrastructure/
    ├── database/
    └── http/
```

#### Example Usage:
```bash
./onion-scaff.sh
# Select: domain
# Enter path: ./src/features
# Enter domain name: user-management
# Confirm: y
```

**Result**: Creates `./src/features/user-management/` with full onion architecture and corresponding test structure at `./tests/features/user-management/`.

### 2. Shared Mode

Creates a shared resources structure for common components and layouts.

#### Structure Created:
```
shared/
├── infrastructure/
│   └── http/
└── presentation/
    └── ui/
        ├── layouts/
        │   ├── main.layout.tsx
        │   └── auth.layout.tsx
        ├── partials/
        └── components/
            ├── button.tsx
            └── form-field.tsx
```

#### Example Usage:
```bash
./onion-scaff.sh
# Select: shared
# Enter path: ./src
# Confirm: y
```

**Result**: Creates `./src/shared/` with shared structure and corresponding test structure at `./tests/shared/`.

## Path Handling

### Supported Path Types

1. **Relative Paths**:
   - `./src/features`
   - `../components`
   - `apps/webapp/src`

2. **Absolute Paths**:
   - `/Users/username/project/src/features`
   - `/home/user/workspace/src`

3. **Quoted Paths** (for drag-and-drop from IDE):
   - `'/Users/username/project/src/features'`
   - `"/workspace/src/components"`

### Automatic Test Path Generation

The script automatically creates corresponding test structures:

| Main Path | Test Path |
|-----------|-----------|
| `./src/features` | `./tests/features` |
| `./apps/webapp/src/modules` | `./apps/webapp/tests/modules` |
| `/project/source/components` | `/project/tests/components` |
| `./lib/utils` | `./tests/utils` |

**Rules**:
- Test folders are always siblings of source folders, never nested inside
- `src`, `source`, `lib` → `tests`
- Maintains directory hierarchy under tests

## Interactive Prompts

### 1. Scaffold Type Selection
```
What do you want to scaffold? (domain/shared):
```
**Valid inputs**: `domain`, `shared` (case-insensitive)

### 2. Target Path Input
```
Enter the relative path where you want to create the structure (press Enter for current directory):
```
**Examples**:
- Press Enter → Current directory
- `./src/features` → Relative path
- `/absolute/path/to/target` → Absolute path
- `'/drag/dropped/path'` → Quoted path (auto-stripped)

### 3. Domain Name Input (Domain Mode Only)
```
Enter the domain name:
```
**Rules**:
- Only letters, numbers, hyphens, and underscores allowed
- Example: `user-management`, `order_processing`, `analytics`

### 4. Confirmation
```
Proceed with creating the structure? (Y/n):
```
**Default**: Yes (press Enter or type `y`/`Y`)

## Features

### File Generation

#### Domain Mode:
- **Main structure**: Creates empty `domain-name.page.jsx` in `presentation/ui/`
- **Test structure**: Only directories and `.gitkeep` files (no source files)
- **Git tracking**: `.gitkeep` files in all empty directories

#### Shared Mode:
- **Main structure**: Creates layout and component files (`.tsx`)
- **Test structure**: Only directories and `.gitkeep` files
- **Git tracking**: `.gitkeep` files ensure empty directories are tracked

### Path Quote Handling

Automatically strips surrounding quotes from paths:
- `'/path/to/directory'` → `/path/to/directory`
- `"/another/path"` → `/another/path`

### Directory Creation

- Creates target directories if they don't exist
- Validates write permissions
- Prevents overwriting without confirmation

## Output and Visualization

### Success Messages
The script provides colored output for different message types:
- 🔵 **INFO**: General information
- 🟢 **SUCCESS**: Successful operations
- 🟡 **WARNING**: Warnings and confirmations
- 🔴 **ERROR**: Error messages

### Structure Display
After creation, shows directory tree using:
- `tree` command (if available) for pretty formatting
- `find` command fallback for basic listing

## Examples

### Example 1: Create User Management Domain
```bash
./onion-scaff.sh
# What do you want to scaffold? domain
# Enter the relative path: ./src/features
# Enter the domain name: user-management
# Proceed with creating the structure? y
```

**Creates**:
- `./src/features/user-management/` (full onion structure)
- `./tests/features/user-management/` (test structure)
- `./src/features/user-management/presentation/ui/user-management.page.jsx` (empty)

### Example 2: Create Shared Components
```bash
./onion-scaff.sh
# What do you want to scaffold? shared
# Enter the relative path: ./apps/webapp/src
# Proceed with creating the shared structure? y
```

**Creates**:
- `./apps/webapp/src/shared/` (shared structure with files)
- `./apps/webapp/tests/shared/` (test structure, no files)

### Example 3: Using Quoted Absolute Path
```bash
./onion-scaff.sh
# What do you want to scaffold? domain
# Enter the relative path: '/Users/developer/project/src/features'
# Enter the domain name: analytics
# Proceed with creating the structure? y
```

**Creates**:
- `/Users/developer/project/src/features/analytics/`
- `/Users/developer/project/tests/features/analytics/`

## Error Handling

### Common Errors and Solutions

1. **Directory doesn't exist**:
   ```
   [ERROR] Directory does not exist: /path/to/target
   ```
   **Solution**: The script will create missing directories automatically

2. **Invalid domain name**:
   ```
   [ERROR] Domain name can only contain letters, numbers, hyphens, and underscores
   ```
   **Solution**: Use only valid characters (a-z, A-Z, 0-9, -, _)

3. **Permission denied**:
   ```
   [ERROR] Directory is not writable: /path/to/target
   ```
   **Solution**: Check and fix directory permissions

4. **Directory already exists**:
   ```
   [WARNING] Directory /path/to/target/domain-name already exists
   Do you want to continue and potentially overwrite existing files? (y/N):
   ```
   **Solution**: Choose whether to proceed or cancel

## Best Practices

### Domain Naming
- Use kebab-case: `user-management`, `order-processing`
- Be descriptive but concise
- Reflect business domain boundaries

### Path Organization
- Keep domains under `./src/features/`
- Place shared resources under `./src/`
- Maintain consistent project structure

### Workflow Integration
- Use with IDE drag-and-drop for paths
- Run from project root for relative paths
- Integrate with git for tracking empty directories

## Troubleshooting

### Script Won't Run
```bash
# Make executable
chmod +x onion-scaff.sh

# Check if bash is available
which bash
```

### Test Directories Not Created
- Verify source path contains `src`, `source`, or `lib`
- Check that parent directories have write permissions
- Ensure test path doesn't conflict with existing files

### Quotes Not Stripped
- Verify quotes are matching pairs (`'...'` or `"..."`)
- Check for trailing spaces in the path

## Advanced Usage

### Custom Test Path Patterns
The script recognizes these source directory patterns:
- `*/src` or `*/src/*` → `*/tests` or `*/tests/*`
- `*/source` or `*/source/*` → `*/tests` or `*/tests/*`
- `*/lib` or `*/lib/*` → `*/tests` or `*/tests/*`
- Other patterns → appends `/tests`

### Multiple Scaffolding Operations
You can safely run multiple scaffolding operations:
- Different domains won't interfere with each other
- Shared and domain structures coexist
- Test structures maintain separate hierarchies

### Integration with Build Tools
- `.gitkeep` files ensure empty directories are tracked
- Structure works with most build tools and bundlers
- Compatible with TypeScript, JavaScript, and other frameworks

---

## Support

For issues or feature requests, check the script source code or contact the development team.
