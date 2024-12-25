import React from 'react';

const HTMLContent = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div 
      className={`formatted-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Add this CSS to your global styles or as a CSS module
const globalStyles = `
  .formatted-content {
    width: 100%;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
  }

  .formatted-content ol {
    list-style-type: decimal;
    margin-left: 0;
    padding-left: 1.25rem;
    margin-bottom: 1rem;
  }

  .formatted-content ul {
    list-style-type: disc;
    margin-left: 0;
    padding-left: 1.25rem;
    margin-bottom: 1rem;
  }

  .formatted-content li {
    margin-bottom: 0.5rem;
    padding-left: 0.25rem;
  }

  .formatted-content p {
    margin: 0 0 0.5rem 0;
    padding: 0;
    max-width: 100%;
  }

  .formatted-content p:last-child {
    margin-bottom: 0;
  }

  .formatted-content h1, 
  .formatted-content h2, 
  .formatted-content h3, 
  .formatted-content h4 {
    margin: 1rem 0 0.5rem 0;
    padding: 0;
  }

  .formatted-content img {
    max-width: 100%;
    height: auto;
  }

  .formatted-content a {
    word-break: break-all;
  }

  /* Fix for numbered lists with specific styling */
  .formatted-content ol[style] {
    margin-left: 0 !important;
    padding-left: 1.25rem !important;
  }

  /* Fix for bulleted lists with specific styling */
  .formatted-content ul[style] {
    margin-left: 0 !important;
    padding-left: 1.25rem !important;
  }
`;

export default HTMLContent;