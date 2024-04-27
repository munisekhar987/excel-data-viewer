import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function ExcelReader() {
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  const [filteredData1, setFilteredData1] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [perPage, setPerPage] = useState(10000);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedRowData, setSelectedRowData] = useState(null); // State to store selected row data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await axios.get('http://10.253.90.45:5000/api/frecuencia-ventas');
        const response2 = await axios.get('http://10.253.90.45:5000/api/last-transactions');

        setData1(response1.data);
        setFilteredData1(response1.data);
        setData2(response2.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const parseCSV = (csvString) => {
    // Implement CSV parsing logic if needed
  };

  const handleFilterChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setFilterText(searchText);
    const filtered = data1.filter((row) =>
      Object.values(row).some((value) => value.toLowerCase().includes(searchText))
    );
    setFilteredData1(filtered);
  };

  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value, 10));
  };

  const handleFilterButtonClick = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = () => {
    // Implement filter logic if needed
  };

  const handleCheckboxChange = (e, columnName) => {
    // Implement checkbox change logic if needed
  };

  const getColumnValues = (columnName) => {
    // Implement column values retrieval logic if needed
  };

  const handleRowClick = (rowData) => {
    // Implement row click logic if needed
  };

  return (
    <div className="excel-reader">
      <div className="filtering">
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={handleFilterChange}
          className="filter-input"
        />
        <label>
          Rows per Page:
          <select value={perPage} onChange={handlePerPageChange} className="per-page-select">
            {[10000, 20000, 30000, 40000, 50000].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleFilterButtonClick} className="filter-button">
          Filter
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {Object.keys(filteredData1[0] || {}).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData1.slice(0, perPage).map((row, rowIndex) => (
              <tr key={rowIndex} onClick={() => handleRowClick(row)}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showFilterModal && (
        <div className="filter-modal">
          <div className="modal-content">
            {/* Filter modal content */}
            <button onClick={handleCloseFilterModal}>Close</button>
            <button onClick={handleApplyFilters}>Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelReader;
