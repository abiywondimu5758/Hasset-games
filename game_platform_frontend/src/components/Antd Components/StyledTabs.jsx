
import styled from 'styled-components';
import { Tabs } from 'antd';
export const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav {
    color: #white !important; /* Change the border color of the tab bar */
  }

  & .ant-tabs-tab {
    color: #ffffff !important; /* Inactive tab text color */
    font-weight: bold; /* Optional: make the text bold */
    border: 1px solid #ffffff  !important; /* Change border color for tabs */
  }

  & .ant-tabs-tab-active {
    background-color: #20446f !important; /* Active tab background color */
    color: #ffffff !important; /* Active tab text color */
    border: 1px solid #20446f !important; /* Change border color for active tab */
    font-weight: bold; /* Optional: make the text bold */
  }

  & .ant-tabs-tab:hover {
    color: #ffffff !important; /* Text color on hover */
    border: 1px solid #20446f !important;
    background-color: #20446f !important;
  }

  & .ant-tabs-ink-bar {
    background-color: #20446f !important; /* Change the ink bar color */
    color: #ffffff !important; /* Optional: change the ink bar color */
  }
`;