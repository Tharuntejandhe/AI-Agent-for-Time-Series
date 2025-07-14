import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const [allFiles, setAllFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfFilename, setPdfFilename] = useState('');
  const [forecastReady, setForecastReady] = useState(false);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastTimeout, setForecastTimeout] = useState(null);
  const reportRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/files')
      .then(res => setAllFiles(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (searchTerm && !selectedFile) {
      setFilteredFiles(
        allFiles.filter(file =>
          file.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredFiles([]);
    }
  }, [searchTerm, allFiles, selectedFile]);

  const handleFileSelect = (file) => {
    setSearchTerm(file);
    setSelectedFile(file);
    setFilteredFiles([]); // Hide dropdown on selection
  };

  const handleGeneratePDF = async () => {
    if (!selectedFile) return;

    // Immediately scroll to report
    reportRef.current?.scrollIntoView({ behavior: 'smooth' });

    setPdfReady(false);
    setForecastReady(false);
    setLoadingForecast(true);

    try {
      const pdfRes = await axios.get(
        `http://localhost:8000/api/files/generate-pdf/${selectedFile}`
      );
      setPdfFilename(pdfRes.data.pdf_file);

      await axios.post(
        `http://localhost:8000/api/files/generate-forecast/${selectedFile}`
      );

      const timeout = setTimeout(() => {
        setForecastReady(true);
        setLoadingForecast(false);
        setPdfReady(true);
      }, 2000);
      setForecastTimeout(timeout);
    } catch (err) {
      console.error(err);
      setLoadingForecast(false);
    }
  };

  const handleCancelForecast = () => {
    clearTimeout(forecastTimeout);
    setLoadingForecast(false);
    setForecastReady(false);
    setPdfReady(false);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/files/download-pdf/${pdfFilename}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', pdfFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen text-white font-gotu">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/assets/supermarket-min.jpg')",
            filter: 'brightness(0.4) contrast(1.8) blur(4px)',
          }}
        />
        <div className="absolute inset-0 bg-black opacity-30 z-0" />

        {/* Header */}
        <header className="relative z-10 w-full flex items-center justify-between px-6 py-3 bg-black/40 backdrop-blur-sm shadow-md border-b-2 border-white">
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full border border-white flex items-center justify-center hover:bg-gray-600 transition"
            style={{ backgroundColor: '#404040' }}
          >
            <i className="fa-solid fa-arrow-left text-white text-xl"></i>
          </button>
        </header>

        {/* Search & Action */}
        <div className="relative z-10 pt-16 px-6 pb-28">
          <h2 className="text-4xl md:text-5xl font-bold leading-snug mb-10">
            Transform Raw Data into<br />
            Actionable Insights<br />
            With AI
          </h2>

          <div className="w-full max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search Product"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedFile(null);
                setPdfReady(false);
                setForecastReady(false);
              }}
              className="w-full px-6 py-3 text-white bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow placeholder-white/80"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFile(null);
                  setPdfReady(false);
                  setForecastReady(false);
                  setFilteredFiles([]);
                }}
                className="absolute right-4 top-2 text-white text-3xl font-bold hover:text-red-400 transition"
              >
                &times;
              </button>
            )}

            {filteredFiles.length > 0 && (
              <ul className="bg-white text-black mt-2 max-h-60 overflow-y-auto rounded-lg shadow border border-gray-300 absolute w-full z-50">
                {filteredFiles.map((file, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onMouseDown={() => handleFileSelect(file)}
                  >
                    {file}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 text-center space-y-2">
            <p className="text-xl">
              Analyze &nbsp;
              <button
                onClick={handleGeneratePDF}
                className="bg-white text-black px-4 py-2 rounded-full shadow hover:bg-gray-100"
              >
                Generate PDF <i className="fa-solid fa-star-of-life ml-3"></i>
              </button>
            </p>
            <div>
              <i className="fa-solid fa-arrow-up text-2xl animate-bounce"></i>
            </div>
            <p>Click to Generate</p>
          </div>
        </div>

        {/* Scroll Prompt */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 text-center">
          <p className="mb-1 text-white">Scroll down to see the analysis</p>
          <button
            onClick={() => reportRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <i className="fa-solid fa-angles-down text-2xl animate-bounce text-white"></i>
          </button>
        </div>
      </div>

      {/* Report Section */}
      <div ref={reportRef} className="min-h-screen bg-[#7D1C4A] text-white px-6 py-10">
        <h2 className="text-3xl font-bold mb-6 text-left pl-6 pt-4">Report</h2>

        {loadingForecast && (
          <div className="text-center mt-6 text-xl text-white flex justify-center items-center gap-6">
            <span>🔄 Generating forecast analysis...</span>
            <button
              onClick={handleCancelForecast}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {forecastReady && (
          <div className="mt-6 max-w-4xl mx-auto bg-white text-black rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Forecast Output</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Future Plot</h3>
                <img
                  src="http://localhost:8000/static/outputs/future_plot.png"
                  alt="Future Forecast"
                  className="rounded shadow"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-lg">Decomposition Plot</h3>
                <img
                  src="http://localhost:8000/static/outputs/decompose_plot.png"
                  alt="Decomposition"
                  className="rounded shadow"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="http://localhost:8000/static/outputs/forecast.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-lg"
              >
                View Interactive Prophet Forecast
              </a>
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleDownload}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;