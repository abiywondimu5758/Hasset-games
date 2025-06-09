// const { PrismaClient } = require("@prisma/client");
// const {
//   joinGame,
//   getStakes,
//   createStakes,
//   leaveGame,
// } = require("../controllers/bingoController"); // Adjust the import based on your file structure
// const { userBingoCard } = require("../config/prismaClient");

// jest.mock("@prisma/client", () => {
//   const mPrisma = {
//     bingoGame: {
//       findFirst: jest.fn(),
//       create: jest.fn(),
//       update: jest.fn(),
//       findUnique: jest.fn(), // Ensure this is included
//       delete: jest.fn(),
//     },
//     user: {
//       findUnique: jest.fn(),
//     },
//     stake: {
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       create: jest.fn(),
//     },
//     userBingoCard: {
//       deleteMany: jest.fn(),
//       count: jest.fn(),
//     },
//     bingoCard: {
//       findMany: jest.fn(),
//     },
//     $transaction: jest.fn(), // Mocking $transaction
//   };
//   return { PrismaClient: jest.fn().mockImplementation(() => mPrisma) };
// });

// const prisma = new PrismaClient();
// const io = { emit: jest.fn(), to: jest.fn().mockReturnThis() }; // Mock Socket.IO

// describe("Game controller", () => {
//   let req;
//   let res;

//   beforeEach(() => {
//     req = {
//       body: {
//         stakeId: 1,
//       },
//       user: {
//         id: 1,
//       },
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     };
//   });

//   afterEach(() => {
//     jest.clearAllMocks(); // Clear mocks to avoid state leakage between tests
//   });
//   describe("joinGame", () => {
//     it("should return error if the user is already in an active game", async () => {
//       prisma.bingoGame.findFirst.mockResolvedValueOnce({
//         hasEnded: false,
//         players: [{ userId: 1 }],
//       });

//       await joinGame(io)(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         error: "You are already in a game 1",
//       });
//     });

//     it("should return error if user has insufficient funds", async () => {
//       prisma.user.findUnique.mockResolvedValueOnce({ wallet: 5 });
//       prisma.stake.findUnique.mockResolvedValueOnce({ amount: 10 });

//       await joinGame(io)(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({ error: "Insufficient funds" });
//     });

//     it("should return error if no unassigned Bingo cards are available", async () => {
//       prisma.user.findUnique.mockResolvedValueOnce({ wallet: 20 });
//       prisma.stake.findUnique.mockResolvedValueOnce({ amount: 10 });
//       prisma.bingoGame.findFirst.mockResolvedValueOnce(null); // No existing game
//       prisma.bingoCard.findMany.mockResolvedValueOnce([]); // No unassigned cards

//       await joinGame(io)(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         error: "No unassigned Bingo cards available",
//       });
//     });

//     it("should successfully join a game", async () => {
//       // Mocking user with sufficient funds
//       prisma.user.findUnique.mockResolvedValueOnce({ wallet: 20 });
//       prisma.stake.findUnique.mockResolvedValueOnce({ amount: 10 });

//       // Ensure no existing game is found
//       prisma.bingoGame.findFirst.mockResolvedValueOnce(null); // No existing game

//       // Mocking available Bingo cards
//       prisma.bingoCard.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]); // Unassigned cards available

//       // Mock the create function to return a new game object
//       const newGame = undefined;
//       prisma.bingoGame.create.mockResolvedValueOnce(newGame);

//       await joinGame(io)(req, res);

//       // Expectations
//       expect(res.json).toHaveBeenCalledWith(
//         expect.objectContaining({ success: true, game: newGame })
//       ); // Include the game object
//       expect(prisma.bingoGame.create).toHaveBeenCalled(); // Check if create was called
//     });
//   });
//   describe("leaveGame", () => {
//     it("should return error if the user is not in any game", async () => {
//       prisma.bingoGame.findFirst.mockResolvedValueOnce(null); // No game found

//       await leaveGame(io)(req, res);

//       expect(res.status).toHaveBeenCalledWith(400);
//       expect(res.json).toHaveBeenCalledWith({
//         error: "You are not in any game or the game is already in progress.",
//       });
//     });

//     it("should successfully delete the user's bingo card and update the game state", async () => {
//       const mockGame = {
//         id: 1,
//         active: false,
//         players: [{ userId: 1 }],
//         possibleWin: 100,
//       };

//       const stake = { amount: 10 }; // Mock the stake amount
//       prisma.stake.findUnique.mockResolvedValueOnce(stake); // Ensure stake is available

//       prisma.bingoGame.findFirst.mockResolvedValueOnce(mockGame); // User is in a game
//       prisma.userBingoCard.deleteMany.mockResolvedValueOnce({ count: 1 }); // Simulate deleting the user's bingo card
//       prisma.bingoGame.update.mockResolvedValueOnce(mockGame); // Simulate updating the game state

//       await leaveGame(io)(req, res);

//       expect(prisma.userBingoCard.deleteMany).toHaveBeenCalled();
//       expect(prisma.bingoGame.update).toHaveBeenCalledWith({
//         where: { id: mockGame.id },
//         data: { possibleWin: { decrement: stake.amount * 0.8 } },
//       });
//       const updatedGame = await prisma.bingoGame.findUnique({
//         where: { id: req.body.gameId },
//         include: {
//           players: {
//             include: {
//               user: true,
//               bingoCard: true,
//             },
//           },
//           stake: true,
//         },
//       });
//       expect(io.emit).toHaveBeenCalledWith("gameupdated", updatedGame);

//       expect(res.json).toHaveBeenCalledWith({
//         success: true,
//         message: "You have left the game",
//       });
//     });

//     it("should delete the game if no players remain", async () => {
//       const mockGame = {
//         id: 1,
//         active: false,
//         players: [{ userId: 1 }],
//         possibleWin: 100,
//       };

//       prisma.bingoGame.findFirst.mockResolvedValueOnce(mockGame); // User is in a game
//       prisma.userBingoCard.deleteMany.mockResolvedValueOnce({ count: 1 }); // Simulate deleting the user's bingo card
//       prisma.bingoGame.delete.mockResolvedValueOnce({}); // Simulate deleting the game

//       // Simulate that no players are remaining
//       prisma.bingoGame.findFirst.mockResolvedValueOnce(null); // No active game found

//       await leaveGame(io)(req, res);

//       expect(prisma.bingoGame.delete).toHaveBeenCalledWith({
//         where: { id: mockGame.id },
//       });
//       expect(io.emit).toHaveBeenCalledWith("gameStatusUpdate", {
//         stakeId: req.body.stakeId,
//         gameStatus: "None",
//       });
//       expect(res.json).toHaveBeenCalledWith({
//         success: true,
//         message: "You have left the game",
//       });
//     });

//     it("should stop the countdown if only one player is left", async () => {
//       const mockGame = {
//         id: 1,
//         active: false,
//         players: [{ userId: 1 }, { userId: 2 }],
//         possibleWin: 100,
//       };

//       const mockStake = { id: 1, amount: 10 };

//       prisma.stake.findUnique.mockResolvedValueOnce(mockStake);
//       prisma.bingoGame.findFirst.mockResolvedValueOnce(mockGame);
//       prisma.userBingoCard.deleteMany.mockResolvedValueOnce({ count: 1 });

//       // Simulate remaining players count as 1
//       prisma.bingoGame.findUnique.mockResolvedValueOnce({
//         id: mockGame.id,
//         possibleWin: 92, // After decrement of 8 (10 * 0.8)
//       });

//       // First, mock the countdown stop update
//       prisma.bingoGame.update.mockResolvedValueOnce(mockGame); // Mock countdown stop

//       await leaveGame(io)(req, res);

//       // First expect checks countdown stop
//       expect(prisma.bingoGame.update).toHaveBeenCalledWith({
//         where: { id: mockGame.id },
//         data: {
//           // countdownEnd: null,
//           // countdownStart: null,
//           possibleWin: { decrement: 8 },
//         },
//       });

//       expect(io.emit).toHaveBeenCalledWith("gameStatusUpdate", {
//         stakeId: req.body.stakeId,
//         gameStatus: "None",
//         // possibleWin: 92,
//       });

//       expect(res.json).toHaveBeenCalledWith({
//         success: true,
//         message: "You have left the game",
//       });
//     });

//     it("should handle unexpected errors gracefully", async () => {
//       prisma.bingoGame.findFirst.mockRejectedValue(new Error("Database error")); // Simulate an error

//       await leaveGame(io)(req, res);

//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({ error: "Failed to leave game" });
//     });
//   });
// });
// describe("Stake Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     req = { body: {} }; // Initialize req with an empty body
//     res = {
//       json: jest.fn(),
//       status: jest.fn().mockReturnThis(), // Mock the status method to return res
//     };
//   });

//   describe("getStakes", () => {
//     it("should return an array of stakes", async () => {
//       const mockStakes = [
//         { id: 1, amount: 10 },
//         { id: 2, amount: 20 },
//       ];

//       prisma.stake.findMany.mockResolvedValue(mockStakes); // Mock the findMany function

//       await getStakes(req, res); // Call the function

//       expect(res.json).toHaveBeenCalledWith([
//         { id: 1, amount: 10 },
//         { id: 2, amount: 20 },
//       ]);
//       expect(prisma.stake.findMany).toHaveBeenCalled(); // Ensure findMany was called
//     });

//     it("should handle errors and respond with a 500 status", async () => {
//       const errorMessage = "Database error";
//       prisma.stake.findMany.mockRejectedValue(new Error(errorMessage)); // Simulate an error

//       await getStakes(req, res); // Call the function

//       expect(res.status).toHaveBeenCalledWith(500); // Check for the correct status code
//       expect(res.json).toHaveBeenCalledWith({
//         error: "Failed to fetch stakes",
//       }); // Check error message
//     });
//   });

//   describe("createStakes", () => {
//     it("should create a new stake and return a success message", async () => {
//       req.body.amount = 50; // Set the amount in the request body

//       const mockStake = { id: 1, amount: 50 };
//       prisma.stake.create.mockResolvedValue(mockStake); // Mock the create function

//       await createStakes(req, res); // Call the function

//       expect(res.status).toHaveBeenCalledWith(201); // Check for the correct status code
//       expect(res.json).toHaveBeenCalledWith({
//         message: "Stake created",
//         stake: mockStake,
//       });
//     });

//     it("should return a 400 status if amount is missing", async () => {
//       await createStakes(req, res); // Call the function without setting amount

//       expect(res.status).toHaveBeenCalledWith(400); // Check for the correct status code
//       expect(res.json).toHaveBeenCalledWith({
//         error: "All fields are required",
//       }); // Check error message
//     });

//     it("should handle database errors and return a 500 status", async () => {
//       req.body.amount = 50; // Set the amount in the request body

//       prisma.stake.create.mockRejectedValue(new Error("Database error")); // Simulate an error

//       await createStakes(req, res); // Call the function

//       expect(res.status).toHaveBeenCalledWith(500); // Check for the correct status code
//       expect(res.json).toHaveBeenCalledWith({ error: "Stake creation failed" }); // Check error message
//     });

//     it("should handle unique constraint errors and return a 400 status", async () => {
//       req.body.amount = 50; // Set the amount in the request body

//       const uniqueConstraintError = { code: "P2002" }; // Simulate a unique constraint error
//       prisma.stake.create.mockRejectedValue(uniqueConstraintError); // Mock the create function

//       await createStakes(req, res); // Call the function

//       expect(res.status).toHaveBeenCalledWith(400); // Check for the correct status code
//       expect(res.json).toHaveBeenCalledWith({
//         error: "Stake with this amount already exists",
//       }); // Check error message
//     });
//   });
// });
