import React, { useEffect, useState } from 'react';
import './FileSelection.css';

export const defaultFileTypes = [
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
];

const FileSelection = ({ selectedFileTypes, setSelectedFileTypes }) => {
  const [FILE_TYPES, setFileTypes] = useState(defaultFileTypes);
  const [customFileType, setCustomFileType] = useState('');

  const [fileSelection, setFileSelection] = useState('all');
  const handleFileSelectionChange = (e) => {
    setFileSelection(e.target.value);
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

  const handleAddFileType = () => {
    if (customFileType && !FILE_TYPES.includes(customFileType)) {
      setFileTypes([...FILE_TYPES, customFileType]);
    }
    setCustomFileType('');
  };

  useEffect(() => {
    if (fileSelection === 'all') {
      setSelectedFileTypes(FILE_TYPES);
    }
  }, [fileSelection]);

  return (
    <>
      <div className="fileSelectionContainer">
        <span>Included File Type: </span>
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
            <button
              onClick={handleAddFileType}
              className="primaryButton addButton"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FileSelection;
