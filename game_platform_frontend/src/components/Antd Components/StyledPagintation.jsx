import { Pagination } from "antd";

import styled from "styled-components";
export const StyledPagination = styled(Pagination)`
  .ant-pagination-item {
    background-color: white !important; /* Set background to #20446f */
    border-color: white!important; /* Match border with background */
    color: white !important; /* Set text color to gray-900 */
  }

  .ant-pagination-item-active {
    background-color: white !important; /* Active background color */
    border-color: white !important; /* Active border color */
    color: #1a1a1a !important; /* Active text color */
  }

  .ant-pagination-item:hover {
    background-color: white !important; /* Hover background color */
    border-color: #20446f !important; /* Hover border color */
    color: white !important; /* Hover text color */
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    background-color: white !important; /* Set active background to white */
    border-color: white !important; /* Match border with background */
    color: #20446f !important; /* Set active text color to gray-900 */
  }

  .ant-pagination-prev:hover,
  .ant-pagination-next:hover {
    background-color: white !important; /* Maintain white background on hover */
    border-color: white !important; /* Maintain white border on hover */
    color: #20446f !important; /* Maintain gray-900 text on hover */
  }

  .ant-pagination-prev.ant-pagination-disabled,
  .ant-pagination-next.ant-pagination-disabled {
    background-color: gray !important; /* Set inactive background to gray */
    border-color: gray !important; /* Match border with background */
    color: white !important; /* Set inactive text color to white */
  }


`;