# Dagger CI/CD Pipeline with LLM Integration

This document explains how to set up and use the enhanced Dagger CI/CD pipeline with Google's Gemini 2.5 Flash LLM integration and Daggerverse modules.

## 🤖 LLM Integration with Google Gemini

The pipeline includes AI-powered features using Google's Gemini 2.5 Flash model:

### Features:
1. **AI Code Review** - Automated code quality analysis
2. **AI Test Generation** - Intelligent test case generation
3. **Performance Benchmarking** - AI-assisted performance optimization suggestions

### Setup Instructions:

1. **Obtain Google Gemini API Key**:
   - Go to Google AI Studio: https://aistudio.google.com/
   - Create a new API key for Gemini
   - Note: Replace the placeholder API key with your actual key

2. **Configure GitHub Secrets**:
   ```bash
   # In your GitHub repository settings, add:
   # Settings → Secrets and variables → Actions
   # Add new repository secret:
   # Name: GOOGLE_GEMINI_API_KEY
   # Value: your_actual_api_key_here
   ```

3. **Required Dependencies**:
   The pipeline automatically installs:
   - `google-generativeai` - Google's Python SDK for Gemini
   - `safety` - Checks for security vulnerabilities in dependencies
   - `pip-audit` - Audits Python dependencies for known vulnerabilities
   - `pytest-benchmark` - Performance benchmarking tool

## 🌐 Daggerverse Modules Integration

The pipeline integrates with useful modules from the Daggerverse:

### Key Modules:
1. **Trivy** - Comprehensive security scanning
2. **Python/Poetry** - Advanced dependency management
3. **Yamllint/Markdownlint** - Documentation quality checks
4. **Gotest** - Go testing framework (if needed)

### Installation:
The pipeline automatically installs and configures these modules during the CI process.

## 🚀 Pipeline Functions

### Core Functions:
- `build()` - Containerized application build
- `test()` - Comprehensive test execution
- `security_scan()` - Bandit security scanning
- `lint()` - Flake8 code linting

### AI-Enhanced Functions:
- `ai_code_review()` - Gemini-powered code analysis
- `ai_test_generation()` - AI-assisted test case generation
- `vulnerability_analysis()` - Advanced security scanning
- `dependency_analysis()` - Dependency vulnerability checks
- `performance_benchmark()` - Performance testing and optimization

### Orchestration Functions:
- `ci_pipeline_with_ai()` - Complete CI workflow with AI enhancements
- `install_daggerverse_modules()` - Setup Daggerverse modules

## 📋 Usage Examples

### Run Individual Functions:
```bash
# Run AI code review
dagger call -m ./dagger ai-code-review --gemini-api-key env:GOOGLE_API_KEY

# Generate AI tests
dagger call -m ./dagger ai-test-generation --gemini-api-key env:GOOGLE_API_KEY

# Run complete AI-enhanced CI pipeline
dagger call -m ./dagger ci-pipeline-with-ai --gemini-api-key env:GOOGLE_API_KEY
```

### GitHub Actions Integration:
The pipeline runs automatically in GitHub Actions with proper secret management.

## 🔒 Security Considerations

1. **API Key Management**:
   - Never commit API keys to the repository
   - Use GitHub Secrets for secure key storage
   - Rotate keys regularly

2. **Dependency Security**:
   - Automated vulnerability scanning with Safety and pip-audit
   - Regular dependency updates recommended

3. **Container Security**:
   - All operations run in isolated containers
   - Minimal base images for reduced attack surface

## 📊 Benefits

1. **Enhanced Code Quality**: AI-powered review and suggestions
2. **Improved Security**: Multiple scanning layers including AI analysis
3. **Better Performance**: Automated benchmarking and optimization
4. **Faster Development**: AI-assisted test generation and code review
5. **Reproducible Builds**: Containerized, consistent environments
6. **Scalable**: Easy to add new AI features and modules

## 🛠️ Troubleshooting

### Common Issues:
1. **API Key Errors**: Ensure the GitHub secret is properly configured
2. **Dependency Issues**: Check network connectivity and package availability
3. **Container Issues**: Verify Docker is running and accessible

### Debugging:
```bash
# Enable verbose output
dagger call -m ./dagger ci-pipeline-with-ai --gemini-api-key env:GOOGLE_API_KEY --debug

# Check Dagger version
dagger version

# List available functions
dagger functions -m ./dagger
```