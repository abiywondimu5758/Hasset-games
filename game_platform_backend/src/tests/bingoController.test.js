// // tests/bingoController.test.js

// const prisma = require('../config/prismaClient');
// const {
//   getStakes,
//   checkIfPlayerAlreadyInAGame,
//   joinGame,
//   leaveGame,
// } = require('../controllers/bingoController');

// // Mock Prisma methods used by these functions
// jest.mock('../config/prismaClient', () => ({
//   stake: {
//     findMany: jest.fn(),
//   },
//   userBingoCard: {
//     findFirst: jest.fn(),
//     create: jest.fn(),
//     delete: jest.fn(),
//   },
//   // Add other models/methods as needed
// }));

// describe('Bingo Controller', () => {
//   describe('getStakes', () => {
//     it('should fetch an array of available stakes', async () => {
//       const mockStakes = [
//         { id: 1, amount: 5 },
//         { id: 2, amount: 10 },
//       ];
//       prisma.stake.findMany.mockResolvedValue(mockStakes);

//       const req = {}; // Adjust if your function needs specific req data
//       const res = {
//         json: jest.fn(),
//         status: jest.fn().mockReturnThis(),
//       };

//       await getStakes(req, res);
//       expect(prisma.stake.findMany).toHaveBeenCalled();
//       expect(res.json).toHaveBeenCalledWith(mockStakes);
//     });

//     it('should handle errors and return status 500 if fetching fails', async () => {
//       prisma.stake.findMany.mockRejectedValue(new Error('DB error'));

//       const req = {};
//       const res = {
//         json: jest.fn(),
//         status: jest.fn().mockReturnThis(),
//       };

//       await getStakes(req, res);
//       expect(res.status).toHaveBeenCalledWith(500);
//       expect(res.json).toHaveBeenCalledWith({
//         error: 'Failed to fetch stakes',
//       });
//     });
//   });

//   describe('checkIfPlayerAlreadyInAGame', () => {
//     it('should return true if user already has a bingoCard for the given game', async () => {
//       prisma.userBingoCard.findFirst.mockResolvedValue({ id: 1 });
//       const userId = 10;
//       const gameId = 100;

//       const result = await checkIfPlayerAlreadyInAGame(userId, gameId);
//       expect(result).toBe(true);
//       expect(prisma.userBingoCard.findFirst).toHaveBeenCalledWith({
//         where: { userId, gameId },
//       });
//     });

//     it('should return false if no userBingoCard record exists', async () => {
//       prisma.userBingoCard.findFirst.mockResolvedValue(null);
//       const userId = 11;
//       const gameId = 101;

//       const result = await checkIfPlayerAlreadyInAGame(userId, gameId);
//       expect(result).toBe(false);
//       expect(prisma.userBingoCard.findFirst).toHaveBeenCalledWith({
//         where: { userId, gameId },
//       });
//     });
//   });

// //   describe('joinGame', () => {
// //     it('should allow a user to join a game by creating a userBingoCard record', async () => {
// //       prisma.userBingoCard.create.mockResolvedValue({ id: 1 });
// //       const req = {
// //         body: {
// //           gameId: 100,
// //         },
// //         user: {
// //           id: 20,
// //         },
// //       };
// //       const res = {
// //         json: jest.fn(),
// //         status: jest.fn().mockReturnThis(),
// //       };

// //       await joinGame(req, res);
// //       expect(prisma.userBingoCard.create).toHaveBeenCalled();
// //       expect(res.json).toHaveBeenCalledWith({
// //         success: true,
// //         message: 'Joined the game successfully.',
// //       });
// //     });

// //     it('should return error 500 if joinGame fails', async () => {
// //       prisma.userBingoCard.create.mockRejectedValue(new Error('DB error'));
// //       const req = {
// //         body: {
// //           gameId: 200,
// //         },
// //         user: {
// //           id: 25,
// //         },
// //       };
// //       const res = {
// //         json: jest.fn(),
// //         status: jest.fn().mockReturnThis(),
// //       };

// //       await joinGame(req, res);
// //       expect(res.status).toHaveBeenCalledWith(500);
// //       expect(res.json).toHaveBeenCalledWith({
// //         error: 'Failed to join the game.',
// //       });
// //     });
// //   });

// //   describe('leaveGame', () => {
// //     it('should remove the user from the game by deleting userBingoCard record', async () => {
// //       prisma.userBingoCard.delete.mockResolvedValue({ id: 1 });
// //       const req = {
// //         body: {
// //           gameId: 300,
// //         },
// //         user: {
// //           id: 30,
// //         },
// //       };
// //       const res = {
// //         json: jest.fn(),
// //         status: jest.fn().mockReturnThis(),
// //       };

// //       await leaveGame(req, res);
// //       expect(prisma.userBingoCard.delete).toHaveBeenCalled();
// //       expect(res.json).toHaveBeenCalledWith({
// //         success: true,
// //         message: 'Left the game successfully.',
// //       });
// //     });

// //     it('should return error 500 if leaveGame fails', async () => {
// //       prisma.userBingoCard.delete.mockRejectedValue(new Error('DB error'));
// //       const req = {
// //         body: {
// //           gameId: 400,
// //         },
// //         user: {
// //           id: 35,
// //         },
// //       };
// //       const res = {
// //         json: jest.fn(),
// //         status: jest.fn().mockReturnThis(),
// //       };

// //       await leaveGame(req, res);
// //       expect(res.status).toHaveBeenCalledWith(500);
// //       expect(res.json).toHaveBeenCalledWith({
// //         error: 'Failed to leave the game.',
// //       });
// //     });
// //   });
// });