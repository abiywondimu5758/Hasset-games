import styled from 'styled-components';
import { Table } from 'antd';

export const StyledTable = styled(Table)`
  border-radius: 12px !important; /* Add rounded corners to the table */
  overflow: hidden; /* Ensure contents respect the border radius */
  
  background-color: #20446f !important; /* Table background color */
  color: white !important; /* Default text color */
  
  & thead th {
    background-color: #20446f !important; /* Header background color */
    color: white !important; /* Header text color */
    font-weight: bold !important; /* Default */
    border-bottom: 1px solid #ffffff !important; /* Header bottom border */
  }

  & tbody tr {
    background-color: #20446f !important; /* Row background color */
    font-weight: bold !important; /* Default */
  }

  & tbody tr:last-child {
    background-color: #20446f !important; /* Last row background color */
  }

  & tbody tr:last-child td {
    color: white !important; /* Last row text color */
  }

  & tbody td {
    color: #00b96b !important; /* Body text color */
    font-weight: bold !important; /* Default */
  }

  & .ant-table-tbody > tr > td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important; /* Row bottom border */
  }

  /* Optional: Remove hover background color */
  & .ant-table-tbody > tr:hover > td {
    background-color: #20446f !important; /* Maintain row background on hover */
  }
`;