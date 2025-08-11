#!/bin/bash

# Onion Architecture Scaffolding Script
# This script creates a basic folder structure following onion architecture principles

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to validate domain name
validate_domain_name() {
    local domain_name="$1"

    # Check if domain name is empty
    if [[ -z "$domain_name" ]]; then
        print_error "Domain name cannot be empty"
        return 1
    fi

    # Check if domain name contains only valid characters (letters, numbers, hyphens, underscores)
    if [[ ! "$domain_name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        print_error "Domain name can only contain letters, numbers, hyphens, and underscores"
        return 1
    fi

    return 0
}

# Function to validate and normalize path
validate_and_normalize_path() {
    local input_path="$1"

    # If path is empty, use current directory
    if [[ -z "$input_path" ]]; then
        input_path="."
    fi

    # Convert to absolute path
    local absolute_path
    if [[ "$input_path" = /* ]]; then
        # Already absolute path
        absolute_path="$input_path"
    else
        # Relative path, convert to absolute
        absolute_path="$(cd "$input_path" 2>/dev/null && pwd)" || {
            print_error "Invalid path: $input_path"
            return 1
        }
    fi

    # Check if directory exists and is writable
    if [[ ! -d "$absolute_path" ]]; then
        print_error "Directory does not exist: $absolute_path"
        return 1
    fi

    if [[ ! -w "$absolute_path" ]]; then
        print_error "Directory is not writable: $absolute_path"
        return 1
    fi

    echo "$absolute_path"
}

# Function to create directory structure for a given base path
create_onion_structure() {
    local base_path="$1"
    local domain_name="$2"
    local structure_type="$3"  # "main" or "test"
    local full_path="$base_path/$domain_name"

    print_info "Creating $structure_type onion architecture structure for domain: $domain_name"
    print_info "Target location: $full_path"

    # Create the main domain directory
    mkdir -p "$full_path"

    # Create application layer
    mkdir -p "$full_path/application/use-cases"
    mkdir -p "$full_path/application/event-handlers"

    # Create core layer
    mkdir -p "$full_path/core/value-objects"
    mkdir -p "$full_path/core/entities"
    mkdir -p "$full_path/core/aggregates"

    # Create presentation layer
    mkdir -p "$full_path/presentation/ui/components"
    mkdir -p "$full_path/presentation/controllers"

    # Create infrastructure layer
    mkdir -p "$full_path/infrastructure/database"
    mkdir -p "$full_path/infrastructure/http"

    print_success "$structure_type directory structure created successfully"
}

# Function to determine test path from main path
get_test_path() {
    local main_path="$1"

    # Use sed to replace patterns more reliably
    local test_path

    # Handle common patterns
    if [[ "$main_path" == */src/* ]]; then
        # Replace /src/ with /tests/
        test_path=$(echo "$main_path" | sed 's|/src/|/tests/|g')
    elif [[ "$main_path" == */source/* ]]; then
        # Replace /source/ with /tests/
        test_path=$(echo "$main_path" | sed 's|/source/|/tests/|g')
    elif [[ "$main_path" == */lib/* ]]; then
        # Replace /lib/ with /tests/
        test_path=$(echo "$main_path" | sed 's|/lib/|/tests/|g')
    else
        # If no common pattern found, add /tests suffix to the path
        test_path="$main_path/tests"
    fi

    echo "$test_path"
}

# Function to create directory structure
create_directory_structure() {
    local base_path="$1"
    local domain_name="$2"
    local full_path="$base_path/$domain_name"

    # Check if domain directory already exists
    if [[ -d "$full_path" ]]; then
        print_warning "Directory $full_path already exists"
        read -p "Do you want to continue and potentially overwrite existing files? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Operation cancelled"
            exit 0
        fi
    fi

    # Create main structure
    create_onion_structure "$base_path" "$domain_name" "main"

    # Create corresponding test structure
    local test_base_path
    test_base_path=$(get_test_path "$base_path")

    if [[ "$test_base_path" != "$base_path" ]]; then
        print_info "Creating corresponding test structure..."
        create_onion_structure "$test_base_path" "$domain_name" "test"
    else
        print_warning "Could not determine test path pattern, skipping test structure creation"
    fi
}

# Function to create initial files
create_initial_files() {
    local base_path="$1"
    local domain_name="$2"
    local full_path="$base_path/$domain_name"

    # Create the main page file (empty)
    local page_file="$full_path/presentation/ui/${domain_name}.page.jsx"

    # Create empty page file
    touch "$page_file"

    print_success "Created ${domain_name}.page.jsx"

    # Create .gitkeep files for empty directories to ensure they're tracked by git
    local directories=(
        "application/use-cases"
        "application/event-handlers"
        "core/value-objects"
        "core/entities"
        "core/aggregates"
        "presentation/ui/components"
        "presentation/controllers"
        "infrastructure/database"
        "infrastructure/http"
    )

    # Create .gitkeep files for main structure
    for dir in "${directories[@]}"; do
        touch "$full_path/$dir/.gitkeep"
    done

    # Create .gitkeep files for test structure
    local test_base_path
    test_base_path=$(get_test_path "$base_path")

    if [[ "$test_base_path" != "$base_path" ]]; then
        local test_full_path="$test_base_path/$domain_name"
        for dir in "${directories[@]}"; do
            touch "$test_full_path/$dir/.gitkeep"
        done
        print_success "Created .gitkeep files for main and test directories"
    else
        print_success "Created .gitkeep files for main directories"
    fi
}

# Function to display the created structure
display_structure() {
    local base_path="$1"
    local domain_name="$2"
    local full_path="$base_path/$domain_name"

    print_success "Onion architecture structure created successfully!"
    echo
    print_info "Main directory structure:"
    echo

    # Use tree command if available, otherwise use find
    if command -v tree &> /dev/null; then
        tree "$full_path"
    else
        find "$full_path" -type d | sed 's|[^/]*/|- |g'
        echo
        find "$full_path" -type f | sed 's|[^/]*/|- |g'
    fi

    # Show test structure if it exists
    local test_base_path
    test_base_path=$(get_test_path "$base_path")

    if [[ "$test_base_path" != "$base_path" ]]; then
        local test_full_path="$test_base_path/$domain_name"
        if [[ -d "$test_full_path" ]]; then
            echo
            print_info "Test directory structure:"
            echo

            if command -v tree &> /dev/null; then
                tree "$test_full_path"
            else
                find "$test_full_path" -type d | sed 's|[^/]*/|- |g'
                echo
                find "$test_full_path" -type f | sed 's|[^/]*/|- |g'
            fi
        fi
    fi

    echo
    print_info "Next steps:"
    echo "1. Navigate to your new domain: cd $full_path"
    echo "2. Start implementing your domain logic in the appropriate layers"
    echo "3. Remember to follow the dependency rule: dependencies point inward"
    echo "4. Write tests in the corresponding test structure"
    echo
    print_info "Layer descriptions:"
    echo "- Core: Business logic, entities, value objects, aggregates"
    echo "- Application: Use cases, application services, event handlers"
    echo "- Infrastructure: External concerns (database, HTTP, file system)"
    echo "- Presentation: UI components, controllers, API endpoints"
}

# Main script execution
main() {
    echo
    print_info "=== Onion Architecture Scaffolding Tool ==="
    echo

    # Get domain name from user
    while true; do
        read -p "Enter the domain name: " domain_name
        if validate_domain_name "$domain_name"; then
            break
        fi
        echo "Please try again with a valid domain name."
    done

    # Get target path from user
    echo
    read -p "Enter the relative path where you want to create the structure (press Enter for current directory): " target_path

    # Validate and normalize the path
    normalized_path=$(validate_and_normalize_path "$target_path")
    if [[ $? -ne 0 ]]; then
        exit 1
    fi

    echo
    print_info "Domain name: $domain_name"
    print_info "Target path: $normalized_path"
    echo

    # Confirm with user
    read -p "Proceed with creating the structure? (Y/n): " -r
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Operation cancelled"
        exit 0
    fi

    # Create the structure
    create_directory_structure "$normalized_path" "$domain_name"
    create_initial_files "$normalized_path" "$domain_name"
    display_structure "$normalized_path" "$domain_name"

    print_success "Onion architecture scaffolding completed!"
}

# Run the main function
main "$@"
