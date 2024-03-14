import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [FILE_TYPES, setFileTypes] = useState([
    '.txt',
    '.py',
    '.js',
    '.sql',
    '.env',
    '.json',
    '.html',
    '.css',
    '.md',
    '.ts',
    '.java',
    '.cpp',
    '.c',
    '.cs',
    '.php',
    '.rb',
    '.xml',
    '.yml',
    '.md',
    '.sh',
    '.swift',
    '.h',
    '.pyw',
    '.asm',
    '.bat',
    '.cmd',
    '.cls',
    '.coffee',
    '.erb',
    '.go',
    '.groovy',
    '.htaccess',
    '.java',
    '.jsp',
    '.lua',
    '.make',
    '.matlab',
    '.pas',
    '.perl',
    '.pl',
    '.ps1',
    '.r',
    '.scala',
    '.scm',
    '.sln',
    '.svg',
    '.vb',
    '.vbs',
    '.xhtml',
    '.xsl',
  ]);
  const [repoUrl, setRepoUrl] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [response, setResponse] = useState('');
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [fileSelection, setFileSelection] = useState('all');
  const [customFileType, setCustomFileType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRepoChange = (e) => {
    setRepoUrl(e.target.value);
  };

  const handleDocChange = (e) => {
    setDocUrl(e.target.value);
  };

  const handleFileTypeChange = (e) => {
    if (e.target.checked) {
      setSelectedFileTypes([...selectedFileTypes, e.target.value]);
    } else {
      setSelectedFileTypes(
        selectedFileTypes.filter((fileType) => fileType !== e.target.value)
      );
    }
  };

  const handleFileSelectionChange = (e) => {
    setFileSelection(e.target.value);
  };

  const handleAddFileType = () => {
    if (customFileType && !FILE_TYPES.includes(customFileType)) {
      setFileTypes([...FILE_TYPES, customFileType]);
    }
    setCustomFileType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    let fileTypesToSend = selectedFileTypes;
    if (fileSelection === 'all') {
      fileTypesToSend = FILE_TYPES;
    }

    try {
      const result = await axios.post('http://localhost:5280/scrape', {
        repoUrl,
        docUrl,
        selectedFileTypes: fileTypesToSend,
      });
      setResponse(result.data.response);
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
    link.download = response.split('\n')[0].split('"')[1].split('/')[1] + '.txt';
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
        <div className="fileSelectionContainer">
          <div>
            <input
              type="radio"
              value="all"
              checked={fileSelection === 'all'}
              onChange={handleFileSelectionChange}
            />
            <label>All Files</label>
          </div>
          <div>
            <input
              type="radio"
              value="select"
              checked={fileSelection === 'select'}
              onChange={handleFileSelectionChange}
            />
            <label>Select File Types</label>
          </div>
        </div>
        {fileSelection === 'select' && (
          <div className="fileTypesContainer">
            {FILE_TYPES.map((fileType, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  value={fileType}
                  onChange={handleFileTypeChange}
                />
                <label>{fileType}</label>
              </div>
            ))}
            <div>
              <input
                value={customFileType}
                onChange={(e) => setCustomFileType(e.target.value)}
                placeholder="Enter new file type"
                className="smallInputArea"
              />
              <button onClick={handleAddFileType} className="primaryButton addButton">
                Add
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="buttonContainer">
        {isLoading ? (
          <div className="loadingIndicator">
            <p>Loading...</p>
          </div>
        ) : <>
          <button onClick={handleSubmit} className="primaryButton transformButton">
            Submit
          </button>
          <button onClick={handleCopyText} className="primaryButton copyButton">
            Copy Text
          </button>
          <button onClick={handleDownload} className="primaryButton">
            Download .txt
          </button>
        </>}
      </div>

      {error ? (
        <div className="errorContainer">
          <p>Error: {error}</p>
        </div>
      ) :
        <div className="outputContainer">
          <textarea value={response} readOnly className="outputArea" />
        </div>}
    </div>
  );
}

export default App;
