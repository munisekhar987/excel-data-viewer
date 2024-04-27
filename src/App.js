import React, { useState, useEffect } from 'react';
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
    const fetchData1 = async () => {
      try {
        const response = await fetch('/FrecuenciaVentasOverall.csv');
        const csvData = await response.text();
        const parsedData = parseCSV(csvData);
        setData1(parsedData);
        setFilteredData1(parsedData);
      } catch (error) {
        console.error('Error fetching data from FrecuenciaVentasOverall.csv:', error);
      }
    };

    const fetchData2 = async () => {
      try {
        const response = await fetch('/LastTransactions2.csv');
        const csvData = await response.text();
        const parsedData = parseCSV(csvData);
        setData2(parsedData);
      } catch (error) {
        console.error('Error fetching data from LastTransactions2.csv:', error);
      }
    };

    fetchData1();
    fetchData2();
  }, []);

  const parseCSV = (csvString) => {
    const rows = csvString.split('\n');
    const headers = rows[0].split(',');
    const parsedData = [];
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length >= 2) {
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = values[j];
        }
        parsedData.push(rowData);
      }
    }
    return parsedData;
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
    const filtered = data1.filter((row) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value.length) return true;
        return value.includes(row[key]);
      });
    });
    setFilteredData1(filtered);
    setShowFilterModal(false); // Close the filter modal after applying filters
  };

  const handleCheckboxChange = (e, columnName) => {
    const { value, checked } = e.target;
    const currentFilters = filters[columnName] || [];
    let updatedFilters;
    if (checked) {
      updatedFilters = [...currentFilters, value];
    } else {
      updatedFilters = currentFilters.filter((item) => item !== value);
    }
    setFilters({
      ...filters,
      [columnName]: updatedFilters,
    });
  };

  const getColumnValues = (columnName) => {
    const values = new Set();
    data1.forEach((row) => values.add(row[columnName]));
    return Array.from(values);
  };

  // const handleRowClick = (rowData) => {
  //   const correspondingData = data2.find((row) => row['cod_cliente'] === rowData['cod_cliente']);
  //   setSelectedRowData(correspondingData);
  //   // Open a new window to display corresponding data
  //   const newDataWindow = window.open('', '_blank');
  //   if (correspondingData) {
  //     newDataWindow.document.write(`<pre>${JSON.stringify(correspondingData, null, 2)}</pre>`);
  //   } else {
  //     newDataWindow.document.write('<p>No corresponding data found</p>');
  //   }
  // };

  const handleRowClick = (rowData) => {
    const correspondingRows = data2.filter((row) => row['cod_cliente'] === rowData['cod_cliente']);
    // Open a new window and create a document
    const newDataWindow = window.open('', '_blank');
    if (correspondingRows.length > 0) {
      // Calculate totals
      const totals = {};
      correspondingRows.forEach((row) => {
        Object.keys(row).forEach((key) => {
          totals[key] = (totals[key] || 0) + parseFloat(row[key] || 0);
        });
      });
  
      // Construct the HTML content for the new window
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Corresponding Data</title>
          <style>
            /* Add your CSS styles here */
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 10px;
              border: 1px solid #ddd;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            tr:hover {
              background-color: #f2f2f2;
            }
            tfoot td {
              font-weight: bold;
              background-color: #ddd;
            }
            .total-row {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="corresponding-data">
            <h2>Corresponding Data for cod_cliente ${rowData['cod_cliente']}</h2>
            <table>
              <thead>
                <tr>
                  ${Object.keys(correspondingRows[0]).map((key) => `<th>${key}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${correspondingRows.map((row) => `
                  <tr>
                    ${Object.values(row).map((value) => `<td>${value}</td>`).join('')}
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="${Object.keys(correspondingRows[0]).length}"><strong>Total</strong></td>
                </tr>
                <tr>
                  ${Object.values(totals).map((value) => `<td>${value}</td>`).join('')}
                </tr>
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;
      // Write the HTML content to the new window
      newDataWindow.document.write(htmlContent);
    } else {
      // If no corresponding data found, display a message
      newDataWindow.document.write('<p>No corresponding data found</p>');
    }
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
            {[10000,20000,30000,40000,50000].map((value) => (
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
