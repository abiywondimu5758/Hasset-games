import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../services/userServices";
import { userStore } from "../stores/userStore";
import { authStore } from "../stores/AuthStore";
import Nav from "./Nav";
import GameList from "./GameList";
import { message } from "antd";
import Footerx from "./Footerx";

const Dashboard = observer(() => {
  const [messageApi, contextHolder] = message.useMessage();

  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const profile = await fetchProfile();
      userStore.setUserProfile(profile);
      return profile;
    },
    onError: (err) => {
      const errMsg =
        err.response?.data?.error || "Network error. Please try again.";
      userStore.setError(errMsg);
      messageApi.open({
        type: "error",
        content: errMsg,
      });
    },
    enabled: !!authStore.isAuthenticated(),
  });

  useEffect(() => {
    if (profile) {
      userStore.setUserProfile(profile);
    }
  }, [profile]);

  return (
    <>
      {contextHolder}

      {/* className="bg-[#20446f] h-screen" */}
      <div className="bg-text/75 h-screen">
        <Nav />
        <GameList />
      </div>
      <Footerx />
    </>
    
  );
});

export default Dashboard;
