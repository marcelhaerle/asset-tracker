# User Management CLI

This CLI tool allows you to manage users in the asset-tracker application from within the Docker container.

## Features

- Create new users
- List all users
- Update existing users (username, password, email)
- Delete users

## Usage

### Inside Docker Container

```bash
# Run the user management CLI
npm run users
```

### Running Locally

```bash
# Compile and run
npm run build:scripts
npm run users
```

### Create Initial Admin User

To bootstrap your application with an initial admin user:

```bash
# Enter the Docker container
docker exec -it tracker-container /bin/sh

# Run the user management CLI
npm run users
# Then follow the prompts to create an admin user
```

## Command Options

When running the CLI, you'll be presented with a menu:

1. **Create user** - Add a new user with username, password, and email
2. **List users** - Display all users in the system
3. **Update user** - Modify an existing user's details
4. **Delete user** - Remove a user from the system
5. **Exit** - Quit the CLI

## Security Notes

- Passwords are hashed with bcrypt before storage
