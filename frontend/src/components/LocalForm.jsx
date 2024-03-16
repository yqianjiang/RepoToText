import React, { useState } from 'react';
import axios from 'axios';
import FileSelection from './FileSelection';

const LocalForm = () => {
  const [files, setFiles] = useState([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState([]);
  const [result, setResult] = useState('');

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const apiUrl = import.meta.env.VITE_APP_API_URL;
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('selected_file_types', selectedFileTypes);

    try {
      const response = await axios.post(`${apiUrl}/scrape_local`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'text',
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Local Repository Scraper</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="files">Files: </label>
          <input type="file" id="files" multiple onChange={handleFileChange} />
        </div>
        <div>
          <FileSelection
            selectedFileTypes={selectedFileTypes}
            setSelectedFileTypes={setSelectedFileTypes}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <p>{result}</p>
    </div>
  );
};

export default LocalForm;
