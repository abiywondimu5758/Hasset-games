// StyledPagination.jsx
import { Pagination } from "antd";
import styled from "styled-components";

export const StyledPagination = styled(Pagination).attrs(() => ({
  // you can also enable antd’s built-in fewer-items mode,
  // but we’ll do it in CSS below:
  showLessItems: true,
  responsive: false,
}))`
  /* ------------------------------------------------------------------------------------
     1) base background for all pager items + prev/next
     ------------------------------------------------------------------------------------ */
  & .ant-pagination-item,
  & .ant-pagination-prev,
  & .ant-pagination-next 
{
    background: #DDEAF8 !important;
    border: none !important;
  }

  /* ------------------------------------------------------------------------------------
     2) active page button
     ------------------------------------------------------------------------------------ */
  & .ant-pagination-item-active {
    background: #20446f !important;
    
    a {
      
      font-weight: bold;
    }
  }

  /* ------------------------------------------------------------------------------------
     3) all numbers (inherit text color from container)
     ------------------------------------------------------------------------------------ */
  & .ant-pagination-item a {
    color: #20446f !important;
  }
  & .ant-pagination-item-active a {
    color: #ffffff !important;
}
  /* ------------------------------------------------------------------------------------
     4) prev / next arrows
     ------------------------------------------------------------------------------------ */
/* style the prev/next “buttons” themselves */
& .ant-pagination-prev .ant-pagination-item-link,
& .ant-pagination-next .ant-pagination-item-link {
  background: #20446f !important;
  border: none !important;
}

/* recolor the arrow icon inside them */
& .ant-pagination-prev .ant-pagination-item-link .anticon,
& .ant-pagination-next .ant-pagination-item-link .anticon {
  color: #ffffff !important;   /* for the <svg> stroke if used */
  fill: #ffffff !important;    /* for the <svg> fill if used */
}


  /* ------------------------------------------------------------------------------------
     5) responsive: under 400px only show up to 3 pages at a time
     (you’ll always see: “‹”, up to 3 page-buttons, then “›”)
     ------------------------------------------------------------------------------------ */

`;
