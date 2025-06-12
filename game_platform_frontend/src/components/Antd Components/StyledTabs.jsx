import styled from 'styled-components';
import { Tabs } from 'antd';
export const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav::before {
    border-bottom: 2px solid #20446f !important;
    /* or to remove it altogether:
       border-bottom: none !important;
    */
  }


  & .ant-tabs-tab {
    color: #20446f !important; /* Inactive tab text color */
    font-weight: bold; /* Optional: make the text bold */
    border: 2px solid #20446f  !important; /* Change border color for tabs */
  }

  & .ant-tabs-tab-active {
    background-color: #20446f !important; /* Active tab background color */
    color: #ffffff !important; /* Active tab text color */
    border: 2px solid #20446f !important; /* Change border color for active tab */
    font-weight: bold; /* Optional: make the text bold */
  }

  & .ant-tabs-tab:hover {
    color: #ffffff !important; /* Text color on hover */
    border: 2px solid #20446f !important;
    background-color: #20446f !important;
  }


`;