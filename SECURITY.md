# Security Best Practices

This document outlines best practices for handling sensitive information in this project.

## Environment Variables

### Local Development

1. **Never commit your `.env` file to version control**
   - The `.gitignore` file is configured to exclude `.env` files
   - Use `.env.example` as a template showing which variables are needed (without actual values)

2. **Keep your `.env` file secure**
   - Store it only on your development machine
   - Don't share it via insecure channels (email, chat, etc.)
   - Regenerate keys if you suspect they've been compromised

### GitHub Secrets

1. **All sensitive values should be stored as GitHub Secrets**
   - Go to your repository > Settings > Secrets and variables > Actions
   - Add each environment variable as a separate secret
   - These are encrypted and only exposed during workflow runs

2. **Required GitHub Secrets for deployment**
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: The JSON key for your service account
   - `GEMINI_API_KEY`: Your Gemini API key
   - Any other environment variables from your `.env` file

## Service Account Keys

1. **Handle the Google Cloud service account key with extreme care**
   - This key grants access to create and modify resources in your Google Cloud project
   - Store it only temporarily when adding it to GitHub Secrets
   - Delete local copies after adding to GitHub

2. **Limit service account permissions**
   - Give the service account only the permissions it needs
   - For this project: Cloud Run Admin, Storage Admin, Service Account User, Cloud Build Editor

## After the Hackathon

1. **Clean up resources**
   - Delete the Cloud Run service if no longer needed
   - Revoke the service account key and delete the service account
   - Remove sensitive GitHub Secrets

2. **Before making the repository public**
   - Check that no API keys or credentials were accidentally committed
   - Verify the `.gitignore` file is properly configured
   - Use a tool like GitLeaks to scan for secrets

Remember: Security is an ongoing process, not a one-time action. Regularly review your security practices and update them as needed.
