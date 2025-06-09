import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGames } from "../services/gameServices";
import { gamesStore } from "../stores/gamesStore";
import GameCard from "./GameCard";
import Spinner from "./Spinner";
import { message } from "antd";

const GameList = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const { data: games, error, isPending } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {


      const fetchedGames = await fetchGames();
      gamesStore.setGames(fetchedGames);
      return fetchedGames;
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error || "An error occurred";
      gamesStore.setError(errMsg);
      messageApi.open({
        type: "error",
        content: errMsg,
      });
    },
  });

  useEffect(() => {
    if (games) {
      gamesStore.setGames(games);
    }
  }, [games]);

  if (isPending || gamesStore.loading) {
    return <Spinner />;
  }

  return (
    <>
      {contextHolder}
      {error && (
        <div className="w-1/2 flex items-start justify-start p-2">
          <message
            type="error"
            content={error.message || gamesStore.error.toString()}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
        {games && games.length > 0 ? (
          games.map((game) => <GameCard key={game.id} game={game} />)
        ) : (
          <p className="col-span-full text-center text-white">
            No games available at the moment.
          </p>
        )}
      </div>
      
    </>
  );
};

export default GameList;


