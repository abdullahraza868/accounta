#!/bin/bash

# Generate NSwag TypeScript Client for Acounta API
# This script generates a TypeScript client from the Acounta Swagger JSON using nswag.json

echo "🚀 Generating Acounta API TypeScript Client..."
echo ""

# Create the services/generated directory if it doesn't exist
mkdir -p services/generated

# Check if nswag.json exists
if [ ! -f "nswag.json" ]; then
  echo "❌ nswag.json file not found in the project root"
  echo "Please ensure nswag.json exists before running this script"
  exit 1
fi

# Generate the client using nswag.json configuration
npx nswag run nswag.json

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ API Client generated successfully!"
  echo "📁 Location: services/generated/ApiService.ts"
  echo ""
  echo "The generated client includes:"
  echo "- Axios-based HTTP client"
  echo "- Strongly typed TypeScript interfaces"
  echo "- All API endpoints from the Acounta API"
  echo ""
  echo "Next steps:"
  echo "1. Install Axios if not already installed: npm install axios"
  echo "2. Review the generated ApiService.ts file"
  echo "3. Import and use the service classes in your components"
  echo "4. Update AuthContext to use the generated TokenAuthService"
  echo ""
  echo "📖 See API_INTEGRATION_GUIDE.md for detailed instructions"
else
  echo ""
  echo "❌ Failed to generate API client"
  echo "Please check:"
  echo "- NSwag is installed (run: npm install -g nswag)"
  echo "- The Swagger JSON URL is accessible (check nswag.json)"
  echo "- You have write permissions in the services/generated directory"
  echo "- nswag.json is properly formatted"
fi
