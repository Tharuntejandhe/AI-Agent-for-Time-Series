import React, { useEffect, useState } from 'react';

function Suggestions() {
  const [status, setStatus] = useState('analyzing');
  const [result, setResult] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:8000/api/products/suggestions');
        const data = await res.json();
        setStatus(data.status);
        setResult(data.result);

        if (data.status === 'done' || data.status === 'error') {
          clearInterval(interval); // Stop polling
        }
      } catch (e) {
        setStatus('error');
        setResult('Failed to fetch suggestions.');
        clearInterval(interval); // Stop polling on error
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval); // Clean up when component unmounts
  }, []);

  const handleDownloadSuggestionsPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/suggestions/pdf');
      if (!response.ok) throw new Error('Failed to download PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ai_suggestions.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Suggestions</h2>
      {status === 'analyzing' ? (
        <p className="text-yellow-600 font-semibold">Analyzing your products with Llama3... Please wait.</p>
      ) : status === 'error' ? (
        <p className="text-red-500">{result}</p>
      ) : (
        <>
          <div className="text-gray-700 whitespace-pre-line mb-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">{result}</div>
          <button
            onClick={handleDownloadSuggestionsPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}

export default Suggestions;
