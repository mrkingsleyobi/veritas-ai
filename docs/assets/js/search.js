// Documentation search functionality
class DocumentationSearch {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchIndex = [];
        this.init();
    }

    async init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });

            // Build search index
            await this.buildSearchIndex();
        }
    }

    async buildSearchIndex() {
        try {
            // In a real implementation, this would fetch and parse all documentation pages
            // For now, we'll create a simple index
            this.searchIndex = [
                {
                    title: 'Quick Start Guide',
                    url: 'quickstart/quickstart-guide.html',
                    content: 'Get started quickly with the Veritas AI platform. Learn authentication, content verification, and basic API usage.',
                    tags: ['quickstart', 'beginner', 'authentication', 'verification']
                },
                {
                    title: 'Python Integration Examples',
                    url: 'multilanguage/python-examples.html',
                    content: 'Comprehensive Python examples for integrating with the Veritas AI API. Includes authentication, content verification, and batch processing.',
                    tags: ['python', 'integration', 'examples', 'sdk']
                },
                {
                    title: 'Java Integration Examples',
                    url: 'multilanguage/java-examples.html',
                    content: 'Complete Java implementation examples for the Veritas AI platform. Covers authentication, verification, and advanced features.',
                    tags: ['java', 'integration', 'examples', 'sdk']
                },
                {
                    title: 'Docker Guide',
                    url: 'containerization/docker-guide.html',
                    content: 'Containerize the Veritas AI platform using Docker. Learn single container deployment and multi-container setups with Docker Compose.',
                    tags: ['docker', 'containerization', 'deployment', 'devops']
                },
                {
                    title: 'Kubernetes Guide',
                    url: 'containerization/kubernetes-guide.html',
                    content: 'Deploy the Veritas AI platform on Kubernetes. Includes manifests, Helm charts, and high availability configuration.',
                    tags: ['kubernetes', 'k8s', 'deployment', 'helm', 'high-availability']
                },
                {
                    title: 'AWS Deployment',
                    url: 'cloud-deployment/aws-deployment.html',
                    content: 'Deploy the Veritas AI platform on Amazon Web Services. Covers EC2, ECS, EKS, and serverless deployment options.',
                    tags: ['aws', 'amazon', 'cloud', 'deployment', 'ec2', 'ecs', 'eks']
                },
                {
                    title: 'Azure Deployment',
                    url: 'cloud-deployment/azure-deployment.html',
                    content: 'Deploy the Veritas AI platform on Microsoft Azure. Includes Virtual Machines, AKS, and Azure Functions deployment.',
                    tags: ['azure', 'microsoft', 'cloud', 'deployment', 'aks', 'functions']
                },
                {
                    title: 'GCP Deployment',
                    url: 'cloud-deployment/gcp-deployment.html',
                    content: 'Deploy the Veritas AI platform on Google Cloud Platform. Covers Compute Engine, Cloud Run, and GKE deployment options.',
                    tags: ['gcp', 'google', 'cloud', 'deployment', 'gke', 'cloud-run']
                },
                {
                    title: 'High Availability Setup',
                    url: 'high-availability/high-availability-setup.html',
                    content: 'Configure high availability for the Veritas AI platform. Learn load balancing, failover, and geographic distribution.',
                    tags: ['high-availability', 'load-balancing', 'failover', 'redundancy']
                },
                {
                    title: 'Troubleshooting Guide',
                    url: 'troubleshooting/common-issues.html',
                    content: 'Resolve common issues with the Veritas AI platform. Covers authentication, content verification, and network problems.',
                    tags: ['troubleshooting', 'issues', 'debugging', 'support']
                },
                {
                    title: 'Advanced Integration Guide',
                    url: 'integration/advanced-integration-guide.html',
                    content: 'Advanced integration patterns for enterprise deployments. Covers microservices, event-driven architecture, and custom workflows.',
                    tags: ['advanced', 'integration', 'enterprise', 'microservices', 'events']
                }
            ];
        } catch (error) {
            console.error('Failed to build search index:', error);
        }
    }

    handleSearch(event) {
        const query = event.target.value.trim();

        if (query.length === 0) {
            this.clearSearchResults();
            return;
        }

        if (query.length < 3) {
            this.showSearchHint();
            return;
        }

        this.performSearch(query);
    }

    performSearch(query) {
        const results = this.search(query);
        this.displayResults(results, query);
    }

    search(query) {
        const terms = query.toLowerCase().split(/\s+/);
        const results = [];

        for (const item of this.searchIndex) {
            let score = 0;
            const content = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();

            for (const term of terms) {
                if (item.title.toLowerCase().includes(term)) {
                    score += 10; // Higher weight for title matches
                }
                if (item.content.toLowerCase().includes(term)) {
                    score += 3;
                }
                if (item.tags.some(tag => tag.includes(term))) {
                    score += 5; // Medium weight for tag matches
                }
            }

            if (score > 0) {
                results.push({
                    ...item,
                    score
                });
            }
        }

        // Sort by relevance score
        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }

    displayResults(results, query) {
        const searchContainer = this.searchInput.parentElement;
        let resultsContainer = document.getElementById('searchResults');

        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'searchResults';
            resultsContainer.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-height: 400px;
                overflow-y: auto;
                z-index: 1000;
                margin-top: 5px;
            `;
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(resultsContainer);
        }

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #64748b;">
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.9rem; margin-top: 5px;">Try different keywords or check spelling</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.9rem; color: #64748b;">
                ${results.length} result${results.length !== 1 ? 's' : ''} found
            </div>
            ${results.map(result => `
                <a href="${result.url}" style="display: block; padding: 15px; text-decoration: none; color: inherit; border-bottom: 1px solid #f1f5f9;">
                    <div style="font-weight: 600; color: #2563eb; margin-bottom: 5px;">${this.highlightMatch(result.title, query)}</div>
                    <div style="font-size: 0.9rem; color: #64748b; line-height: 1.4;">${this.highlightMatch(result.content.substring(0, 150) + '...', query)}</div>
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 5px;">${result.url}</div>
                </a>
            `).join('')}
        `;
    }

    highlightMatch(text, query) {
        if (!query) return text;

        const terms = query.toLowerCase().split(/\s+/);
        let highlightedText = text;

        terms.forEach(term => {
            if (term.length > 0) {
                const regex = new RegExp(`(${term})`, 'gi');
                highlightedText = highlightedText.replace(regex, '<mark style="background-color: #fef3c7; padding: 1px 2px; border-radius: 3px;">$1</mark>');
            }
        });

        return highlightedText;
    }

    showSearchHint() {
        const searchContainer = this.searchInput.parentElement;
        let hintContainer = document.getElementById('searchHint');

        if (!hintContainer) {
            hintContainer = document.createElement('div');
            hintContainer.id = 'searchHint';
            hintContainer.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                padding: 15px;
                z-index: 1000;
                margin-top: 5px;
                font-size: 0.9rem;
                color: #64748b;
            `;
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(hintContainer);
        }

        hintContainer.innerHTML = 'Enter at least 3 characters to search...';
    }

    clearSearchResults() {
        const resultsContainer = document.getElementById('searchResults');
        const hintContainer = document.getElementById('searchHint');

        if (resultsContainer) {
            resultsContainer.remove();
        }
        if (hintContainer) {
            hintContainer.remove();
        }
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentationSearch();
});

// Close search results when clicking outside
document.addEventListener('click', (event) => {
    const searchContainer = document.querySelector('.search-container');
    const resultsContainer = document.getElementById('searchResults');
    const hintContainer = document.getElementById('searchHint');

    if (searchContainer &&
        !searchContainer.contains(event.target) &&
        (resultsContainer || hintContainer)) {
        if (resultsContainer) resultsContainer.remove();
        if (hintContainer) hintContainer.remove();
    }
});