"""
Naval Similarity Search Package

A comprehensive system for finding similar naval ships based on
physical characteristics, weapons systems, and other features.
"""

from .naval_search import NavalSimilaritySearch
from .config import DEFAULT_WEIGHTS, DEFAULT_TOP_K, SIMILARITY_THRESHOLD

__version__ = "1.0.0"
__author__ = "Naval Search Team"

__all__ = [
    'NavalSimilaritySearch',
    'DEFAULT_WEIGHTS',
    'DEFAULT_TOP_K',
    'SIMILARITY_THRESHOLD'
]