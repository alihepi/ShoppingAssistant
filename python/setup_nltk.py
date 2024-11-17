# setup_nltk.py

import nltk
import ssl
import sys
import os

def setup_ssl_context():
    """SSL context setup for NLTK downloads"""
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context

def create_nltk_data_dir():
    """Create NLTK data directory if it doesn't exist"""
    nltk_data_dir = os.path.expanduser('~/nltk_data')
    if not os.path.exists(nltk_data_dir):
        try:
            os.makedirs(nltk_data_dir)
            print(f"Created NLTK data directory at: {nltk_data_dir}")
        except Exception as e:
            print(f"Error creating directory: {str(e)}")

def download_nltk_resources():
    """Download all required NLTK resources"""
    resources = [
        'punkt',
        'punkt_tab',
        'vader_lexicon',
        'stopwords',
        'averaged_perceptron_tagger',
        'maxent_ne_chunker',
        'words'
    ]

    for resource in resources:
        try:
            print(f"\nDownloading {resource}...")
            nltk.download(resource, quiet=True)
            print(f"Successfully downloaded {resource}")
        except Exception as e:
            print(f"Error downloading {resource}: {str(e)}")
            continue

def verify_installation():
    """Verify NLTK resources are properly installed"""
    verification_tests = {
        'punkt': lambda: nltk.tokenize.word_tokenize("Test sentence."),
        'vader_lexicon': lambda: nltk.sentiment.vader.SentimentIntensityAnalyzer(),
        'stopwords': lambda: nltk.corpus.stopwords.words('english')
    }

    print("\nVerifying installations...")
    for resource, test_func in verification_tests.items():
        try:
            test_func()
            print(f"✓ {resource} is working correctly")
        except Exception as e:
            print(f"✗ {resource} is not working properly: {str(e)}")

def main():
    print("Starting NLTK Setup...")
    
    # SSL Setup
    setup_ssl_context()
    
    # Create data directory
    create_nltk_data_dir()
    
    # Download resources
    download_nltk_resources()
    
    # Verify installation
    verify_installation()
    
    print("\nSetup complete!")

if __name__ == "__main__":
    main()