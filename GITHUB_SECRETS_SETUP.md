# GitHub Secrets Setup for CI/CD

This document explains how to configure GitHub secrets for the Users Microservice CI/CD pipeline.

## Required Secrets

The following secrets need to be configured in your GitHub repository for the CI workflow to function properly:

### Database Configuration Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DB_HOST` | Database host address | `localhost` or `your-db-host.com` |
| `DB_PORT` | Database port number | `5432` |
| `DB_USER` | Database username | `your_db_user` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `DB_NAME` | Database name | `users_microservice_db` |

### Security Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-jwt-key-here` |

## How to Add Secrets

### Method 1: Via GitHub Web Interface

1. **Navigate to your repository** on GitHub
2. **Go to Settings** tab
3. **Click on "Secrets and variables"** in the left sidebar
4. **Select "Actions"** tab
5. **Click "New repository secret"** button
6. **Add each secret** with the exact name and value

### Method 2: Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Add secrets (replace with your actual values)
gh secret set DB_HOST --body "your-database-host"
gh secret set DB_PORT --body "5432"
gh secret set DB_USER --body "your-database-user"
gh secret set DB_PASSWORD --body "your-database-password"
gh secret set DB_NAME --body "your-database-name"
gh secret set JWT_SECRET --body "your-jwt-secret-key"
```

## Environment-Specific Configuration

### Development Environment
For local development, create a `.env` file in your project root:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=dev_user
DB_PASSWORD=dev_password
DB_NAME=users_microservice_dev
JWT_SECRET=dev-jwt-secret-key
```

### Test Environment
For testing, create a `.env.test` file:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=users_microservice_test
JWT_SECRET=test-jwt-secret-key
```

### Production Environment
For production, use the GitHub secrets configured above.

## Security Best Practices

### 1. Secret Management
- **Never commit secrets** to version control
- **Use strong, unique passwords** for each environment
- **Rotate secrets regularly** (especially JWT_SECRET)
- **Limit access** to secrets to only necessary team members

### 2. Database Security
- **Use dedicated database users** for each environment
- **Grant minimal required permissions** to database users
- **Enable SSL/TLS** for database connections in production
- **Use connection pooling** for better performance

### 3. JWT Security
- **Use cryptographically strong secrets** (at least 32 characters)
- **Include random characters** (letters, numbers, symbols)
- **Consider using environment-specific secrets** for different deployments

## Example Secret Values

### Strong JWT Secret Example
```
JWT_SECRET=my-super-secret-jwt-key-2024-with-random-chars-!@#$%^&*()
```

### Database Configuration Example
```
DB_HOST=your-postgresql-host.com
DB_PORT=5432
DB_USER=users_microservice_user
DB_PASSWORD=StrongPassword123!@#
DB_NAME=users_microservice_prod
```

## Troubleshooting

### Common Issues

1. **Secrets not found in workflow**
   - Ensure secret names match exactly (case-sensitive)
   - Check that secrets are added to the correct repository
   - Verify you have permission to access the secrets

2. **Database connection failures**
   - Verify database credentials are correct
   - Check if database is accessible from GitHub Actions
   - Ensure database user has proper permissions

3. **JWT token issues**
   - Verify JWT_SECRET is properly set
   - Check that the secret is long enough (minimum 32 characters)
   - Ensure the secret is consistent across deployments

### Debugging Workflow

To debug secret issues in your workflow:

1. **Check workflow logs** in the Actions tab
2. **Add debug steps** (without exposing secrets):

```yaml
- name: Debug environment
  run: |
    echo "NODE_ENV: $NODE_ENV"
    echo "DB_HOST is set: ${{ secrets.DB_HOST != '' }}"
    echo "DB_USER is set: ${{ secrets.DB_USER != '' }}"
    echo "JWT_SECRET is set: ${{ secrets.JWT_SECRET != '' }}"
```

## Additional Configuration

### Optional Secrets

You can also add these optional secrets for enhanced functionality:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DOCKER_USERNAME` | Docker registry username | `your-docker-username` |
| `DOCKER_PASSWORD` | Docker registry password | `your-docker-password` |
| `SLACK_WEBHOOK_URL` | Slack notifications webhook | `https://hooks.slack.com/...` |

### Environment-Specific Workflows

For different environments (staging, production), you can create separate workflow files:

- `.github/workflows/ci-staging.yml`
- `.github/workflows/ci-production.yml`

Each with their own set of secrets and configurations.

## Verification

After setting up secrets, verify the configuration:

1. **Push a commit** to trigger the workflow
2. **Check the Actions tab** to see if the workflow runs successfully
3. **Review the logs** to ensure all steps complete without errors
4. **Test the deployed application** to verify functionality

## Support

If you encounter issues with secret configuration:

1. **Check GitHub documentation** on secrets management
2. **Review workflow logs** for specific error messages
3. **Verify secret permissions** and access rights
4. **Contact your team's DevOps engineer** for assistance 