// const request = require("supertest");
// const { v4: uuidv4 } = require("uuid");
// const app = require("../app");
// const prisma = require("../config/prismaClient");

// // Corrected shortUuid function
// const shortUuid = () => uuidv4().replace(/-/g, "").substring(0, 10);

// // Helper function to generate unique phone numbers
// const generateUniquePhoneNumber = () => {
//   const prefix = Math.random() < 0.5 ? "07" : "09";
//   const number = Math.floor(10000000 + Math.random() * 90000000); // Generates an 8-digit number
//   return `${prefix}${number}`;
// };

// describe("Auth Controller", () => {
//   const testUserIds = [];


//   afterAll(async () => {
//     try {
//       await prisma.$transaction([
//         prisma.referredUser.deleteMany({
//           where: {
//             referrerId: { in: testUserIds },
//           },
//         }),
//         prisma.userStatistics.deleteMany({
//           where: {
//             userId: { in: testUserIds },
//           },
//         }),
//         prisma.user.deleteMany({
//           where: {
//             id: { in: testUserIds },
//           },
//         }),
//       ]);
//     } catch (error) {
//       console.error("Error during cleanup:", error);
//     } finally {
//       await prisma.$disconnect();
//     }
//   });

//   describe("POST /auth/register", () => {
//     it("should register a new user", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `testUser_${shortUuid()}`;
//       const password = "TestPassword@1";

//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         password,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.user).toHaveProperty("id");

//       // Store the created user's ID for cleanup
//       testUserIds.push(response.body.user.id);
//     });

//     it("should return an error if required fields are missing", async () => {
//       const response = await request(app).post("/auth/register").send({}); // Missing all fields

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should return an error if user already exists", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `testUser_${shortUuid()}`;
//       const password = "TestPassword@1";

//       // Register the user the first time
//       const firstResponse = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         password,
//       });

//       expect(firstResponse.statusCode).toBe(201);
//       testUserIds.push(firstResponse.body.user.id);

//       // Attempt to register the same user again
//       const secondResponse = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         password,
//       });

//       expect(secondResponse.statusCode).toBe(400);
//       expect(secondResponse.body.error).toBe(
//         "User with this phone number already exists" ||
//           "User with this username already exists"
//       );
//     });

//     it("should return an error if referral code is invalid", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `testUser_${shortUuid()}`;
//       const password = "TestPassword@1";

//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         password,
//         referralCode: "INVALID_CODE",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Invalid referral code");
//     });

//     it("should return an error if the password is too weak", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `weakPasswordUser_${shortUuid()}`;
//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         password: "123", // Weak password
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Password is too weak");
//     });

//     it("should return an error if the phone number format is invalid", async () => {
//       const uniqueUsername = `invalidPhoneUser_${shortUuid()}`;
//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: "invalid_phone",
//         username: uniqueUsername,
//         password: "ValidPass123!",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Invalid phone number format");
//     });

//     it("should return an error if the username exceeds max length", async () => {
//       const longUsername = "a".repeat(33);
//       const uniquePhoneNumber = generateUniquePhoneNumber();

//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: longUsername,
//         password: "ValidPass123!",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe(
//         "Username exceeds maximum length of 32 characters"
//       );
//     });

//     it("should treat usernames as case-insensitive", async () => {
//       const baseUsername = `caseTestUser_${shortUuid()}`;
//       const uppercaseUsername = baseUsername.toUpperCase();
//       const lowercaseUsername = baseUsername.toLowerCase();
//       const uniquePhoneNumber1 = generateUniquePhoneNumber();
//       const uniquePhoneNumber2 = generateUniquePhoneNumber();

//       // Register with uppercase username
//       let response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber1,
//         username: uppercaseUsername,
//         password: "ValidPass123!",
//       });

//       expect(response.statusCode).toBe(201);
//       testUserIds.push(response.body.user.id);

//       // Attempt to register with lowercase username
//       response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber2,
//         username: lowercaseUsername,
//         password: "ValidPass123!",
//       });

//       // If usernames are case-insensitive, expect an error
//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe(
//         "User with this username already exists" ||
//           "User with this phone number already exists"
//       );
//     });

//     it("should handle concurrent registrations properly", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `concurrentUser_${shortUuid()}`;
//       const password = "ValidPass123!";

//       // Simulate two concurrent registration attempts with the same phone number and username
//       const [response1, response2] = await Promise.all([
//         request(app).post("/auth/register").send({
//           phoneNumber: uniquePhoneNumber,
//           username: uniqueUsername,
//           password,
//         }),
//         request(app).post("/auth/register").send({
//           phoneNumber: uniquePhoneNumber,
//           username: uniqueUsername,
//           password,
//         }),
//       ]);

//       const successfulResponse = [response1, response2].find(
//         (r) => r.statusCode === 201
//       );
//       const failedResponse = [response1, response2].find(
//         (r) => r.statusCode === 400
//       );

//       expect(successfulResponse).toBeDefined();
//       expect(failedResponse).toBeDefined();

//       // Since the error message can vary based on the unique constraint violated,
//       // check if it matches one of the expected messages
//       const expectedErrors = [
//         "User with this phone number already exists",
//         "User with this username already exists",
//       ];
//       expect(expectedErrors).toContain(failedResponse.body.error);

//       if (
//         successfulResponse &&
//         successfulResponse.body.user &&
//         successfulResponse.body.user.id
//       ) {
//         testUserIds.push(successfulResponse.body.user.id);
//       }
//     });
//     it("should trim leading and trailing spaces in username", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const rawUsername = `  spacedUser_${shortUuid()}  `;
//       const trimmedUsername = rawUsername.trim().toLocaleLowerCase();

//       const response = await request(app).post("/auth/register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: rawUsername,
//         password: "ValidPass123!",
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user.username).toBe(trimmedUsername);
//       testUserIds.push(response.body.user.id);
//     });
//     //   it('should prevent SQL injection via username', async () => {
//     //     const uniquePhoneNumber = generateUniquePhoneNumber();
//     //     const maliciousUsername = `DROP TABLE users; --`;
//     //     const password = 'ValidPass123!';

//     //     const response = await request(app).post('/auth/register').send({
//     //       phoneNumber: uniquePhoneNumber,
//     //       username: maliciousUsername,
//     //       password: password,
//     //     });

//     //     // Expecting the registration to fail due to invalid characters in username
//     //     expect(response.statusCode).toBe(400);
//     //     expect(response.body.error).toBe('Username contains invalid characters');
//     //   });

//     it("should register a user with a valid referral code", async () => {
//       // First, create a referring user
//       const referrerPhone = generateUniquePhoneNumber();
//       const referrerUsername = `referrer_${shortUuid()}`;
//       const referrerPassword = "ValidPass123!";

//       let response = await request(app).post("/auth/register").send({
//         phoneNumber: referrerPhone,
//         username: referrerUsername,
//         password: referrerPassword,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user).toHaveProperty("id");
//       const referrerId = response.body.user.id;
//       testUserIds.push(referrerId);

//       const referralCode = response.body.user.referralCode;

//       // Now, register a new user with the referral code
//       const newUserPhone = generateUniquePhoneNumber();
//       const newUserUsername = `newUser_${shortUuid()}`;
//       const newUserPassword = "ValidPass123!";

//       response = await request(app).post("/auth/register").send({
//         phoneNumber: newUserPhone,
//         username: newUserUsername,
//         password: newUserPassword,
//         referralCode: referralCode,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user).toHaveProperty("id");
//       const newUserId = response.body.user.id;
//       testUserIds.push(newUserId);

//       // Retrieve the referrer to check the referral bonus and count
//       const referrer = await prisma.user.findUnique({
//         where: { id: referrerId },
//       });

//       expect(Number(referrer.referralBonus)).toBe(5); // Assuming bonus increments by 5
//       expect(referrer.referredCount).toBe(1);
//     });

//     it("should calculate referral bonus correctly for multiple referrals", async () => {
//       // Create a referrer
//       const referrerPhone = generateUniquePhoneNumber();
//       const referrerUsername = `referrerMultiple_${shortUuid()}`;
//       const referrerPassword = "ValidPass123!";

//       let response = await request(app).post("/auth/register").send({
//         phoneNumber: referrerPhone,
//         username: referrerUsername,
//         password: referrerPassword,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user).toHaveProperty("id");
//       const referrerId = response.body.user.id;
//       testUserIds.push(referrerId);

//       const referralCode = response.body.user.referralCode;

//       // Register first referred user
//       const firstReferralPhone = generateUniquePhoneNumber();
//       const firstReferralUsername = `referral1_${shortUuid()}`;
//       const firstReferralPassword = "ValidPass123!";

//       response = await request(app).post("/auth/register").send({
//         phoneNumber: firstReferralPhone,
//         username: firstReferralUsername,
//         password: firstReferralPassword,
//         referralCode: referralCode,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user).toHaveProperty("id");
//       const firstReferralId = response.body.user.id;
//       testUserIds.push(firstReferralId);

//       // Register second referred user
//       const secondReferralPhone = generateUniquePhoneNumber();
//       const secondReferralUsername = `referral2_${shortUuid()}`;
//       const secondReferralPassword = "ValidPass123!";

//       response = await request(app).post("/auth/register").send({
//         phoneNumber: secondReferralPhone,
//         username: secondReferralUsername,
//         password: secondReferralPassword,
//         referralCode: referralCode,
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.user).toHaveProperty("id");
//       const secondReferralId = response.body.user.id;
//       testUserIds.push(secondReferralId);

//       // Retrieve the referrer to check the referral bonus and count
//       const referrer = await prisma.user.findUnique({
//         where: { id: referrerId },
//       });

//       expect(Number(referrer.referralBonus)).toBe(10); // Assuming 5 per referral
//       expect(referrer.referredCount).toBe(2);
//     });
//   });

//   describe("POST /auth/staff-register", () => {
//     it("should register a new staff member", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `staffUser_${shortUuid()}`;
//       const uniqueEmail = `staff_${shortUuid()}@example.com`;
//       const password = "StaffPassword@1";

//       const response = await request(app).post("/auth/staff-register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         email: uniqueEmail,
//         password,
//         role: "STAFF",
//       });

//       expect(response.statusCode).toBe(201);
//       expect(response.body.success).toBe(true);
//       expect(response.body.user).toHaveProperty("id");

//       // Store the created staff user's ID for cleanup
//       testUserIds.push(response.body.user.id);
//     });

//     it("should return an error if required fields are missing", async () => {
//       const response = await request(app).post("/auth/staff-register").send({}); // Missing all fields

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should return an error if role is invalid", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `staffUser_${shortUuid()}`;
//       const uniqueEmail = `staff_${shortUuid()}@example.com`;
//       const password = "StaffPassword@1";

//       const response = await request(app).post("/auth/staff-register").send({
//         phoneNumber: uniquePhoneNumber,
//         username: uniqueUsername,
//         email: uniqueEmail,
//         password,
//         role: "INVALID_ROLE",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Invalid role");
//     });

//     it("should return an error if user already exists", async () => {
//       const uniquePhoneNumber = generateUniquePhoneNumber();
//       const uniqueUsername = `staffUser_${shortUuid()}`;
//       const uniqueEmail = `staff_${shortUuid()}@example.com`;
//       const password = "StaffPassword@1";

//       // Register the staff member the first time
//       const firstResponse = await request(app)
//         .post("/auth/staff-register")
//         .send({
//           phoneNumber: uniquePhoneNumber,
//           username: uniqueUsername,
//           email: uniqueEmail,
//           password,
//           role: "STAFF",
//         });

//       expect(firstResponse.statusCode).toBe(201);
//       testUserIds.push(firstResponse.body.user.id);

//       // Attempt to register the same staff member again
//       const secondResponse = await request(app)
//         .post("/auth/staff-register")
//         .send({
//           phoneNumber: uniquePhoneNumber,
//           username: uniqueUsername,
//           email: uniqueEmail,
//           password,
//           role: "STAFF",
//         });

//       expect(secondResponse.statusCode).toBe(400);
//       expect(secondResponse.body.error).toBe(
//         "User with this phone number, username, or email already exists"
//       );
//     });
//   });

//   describe("POST /auth/login", () => {
//     it("should login successfully with correct credentials", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "----",
//         password: "--------",
//       });

//       expect(response.statusCode).toBe(200);
//       expect(response.body).toHaveProperty("accessToken");
//       expect(response.body).toHaveProperty("refreshToken");
//       expect(response.body.message).toBe("Login successful");
//     });

//     it("should fail login with incorrect username", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "nonExistentUser",
//         password: "TestPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail login with incorrect password", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "----",
//         password: "WrongPassword!2",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail login if username is missing", async () => {
//       const response = await request(app).post("/auth/login").send({
//         password: "TestPassword@1",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should fail login if password is missing", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "----",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should handle case-insensitive usernames", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "----".toUpperCase(),
//         password: "--------",
//       });

//       expect(response.statusCode).toBe(200);
//       expect(response.body).toHaveProperty("accessToken");
//       expect(response.body).toHaveProperty("refreshToken");
//       expect(response.body.message).toBe("Login successful");
//     });

//     it("should prevent SQL injection via username", async () => {
//       const maliciousUsername = `testUser_${shortUuid()}; DROP TABLE users; --`;
//       const response = await request(app).post("/auth/login").send({
//         username: maliciousUsername,
//         password: "AnyPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail login for non-existent user with malicious input", async () => {
//       const maliciousUsername = `' OR '1'='1`;
//       const response = await request(app).post("/auth/login").send({
//         username: maliciousUsername,
//         password: "AnyPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail login with empty username and password", async () => {
//       const response = await request(app).post("/auth/login").send({
//         username: "",
//         password: "",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should fail login with excessively long username", async () => {
//       const longUsername = "a".repeat(1000);
//       const response = await request(app).post("/auth/login").send({
//         username: longUsername,
//         password: "TestPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });
//   });

//   describe("POST /auth/staff-login", () => {
//     it("should login successfully as ADMIN with correct credentials", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "----",
//         password: "AdminPass@1",
//       });

//       expect(response.statusCode).toBe(200);
//       expect(response.body).toHaveProperty("accessToken");
//       expect(response.body).toHaveProperty("refreshToken");
//       expect(response.body.message).toBe("Login successful");
//     });

//     it("should login successfully as STAFF with correct credentials", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "----",
//         password: "StaffPass@1",
//       });

//       expect(response.statusCode).toBe(200);
//       expect(response.body).toHaveProperty("accessToken");
//       expect(response.body).toHaveProperty("refreshToken");
//       expect(response.body.message).toBe("Login successful");
//     });

//     it("should fail staffLogin with USER role", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "----",
//         password: "UserPass@1",
//       });

//       expect(response.statusCode).toBe(403);
//       expect(response.body.error).toBe("Unauthorized: Insufficient privileges");
//     });

//     it("should fail staffLogin with incorrect username", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "nonExistentStaff",
//         password: "StaffPass@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail staffLogin with incorrect password", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "----",
//         password: "WrongPass@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail staffLogin if username is missing", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         password: "StaffPass@1",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should fail staffLogin if password is missing", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "----",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should prevent SQL injection via username in staffLogin", async () => {
//       const maliciousUsername = `staffUser_${shortUuid()}; DROP TABLE users; --`;
//       const response = await request(app).post("/auth/staff-login").send({
//         username: maliciousUsername,
//         password: "AnyPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail staffLogin for non-existent user with malicious input", async () => {
//       const maliciousUsername = `' OR '1'='1`;
//       const response = await request(app).post("/auth/staff-login").send({
//         username: maliciousUsername,
//         password: "AnyPassword@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });

//     it("should fail staffLogin with empty username and password", async () => {
//       const response = await request(app).post("/auth/staff-login").send({
//         username: "",
//         password: "",
//       });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("All fields are required");
//     });

//     it("should fail staffLogin with excessively long username", async () => {
//       const longUsername = "a".repeat(1000);
//       const response = await request(app).post("/auth/staff-login").send({
//         username: longUsername,
//         password: "StaffPass@1",
//       });

//       expect(response.statusCode).toBe(401);
//       expect(response.body.error).toBe("Invalid credentials");
//     });
//   });
// });
