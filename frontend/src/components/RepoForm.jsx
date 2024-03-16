import React, { useState } from 'react';
import axios from 'axios';
import FileSelection from './FileSelection';

function RepoForm() {
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const handleRepoChange = (e) => {
    setRepoUrl(e.target.value);
  };

  const handleDocChange = (e) => {
    setDocUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError('');

    try {
      const result = await axios.post(`${apiUrl}/scrape_github_by_clone`, {
        repoUrl,
        docUrl,
        selectedFileTypes,
      });
      setResponse(result.data.content);
    } catch (error) {
      setError(error?.message || '');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    const outputArea = document.querySelector('.outputArea');
    outputArea.select();
    document.execCommand('copy');
  };

  const handleDownload = () => {
    const blob = new Blob([response], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = repoUrl.split('/').pop() + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="inputContainer">
        <input
          value={repoUrl}
          onChange={handleRepoChange}
          placeholder="Enter Github repo URL"
          className="inputArea"
        />
        <input
          value={docUrl}
          onChange={handleDocChange}
          placeholder="Enter documentation URL (optional)"
          className="inputArea"
        />
        <FileSelection
          selectedFileTypes={selectedFileTypes}
          setSelectedFileTypes={setSelectedFileTypes}
        />
      </div>
      <div className="buttonContainer">
        {isLoading ? (
          <div className="loadingIndicator">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <button
              onClick={handleSubmit}
              className="primaryButton transformButton"
            >
              Submit
            </button>
            <button
              onClick={handleCopyText}
              className="primaryButton copyButton"
            >
              Copy Text
            </button>
            <button onClick={handleDownload} className="primaryButton">
              Download .txt
            </button>
          </>
        )}
      </div>

      {error ? (
        <div className="errorContainer">
          <p>Error: {error}</p>
        </div>
      ) : (
        <div className="outputContainer">
          <textarea value={response} readOnly className="outputArea" />
        </div>
      )}
    </div>
  );
}

export default RepoForm;
