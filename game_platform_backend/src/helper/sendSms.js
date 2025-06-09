const fetch = require("node-fetch-commonjs");

async function sendSMS(to) {
    try {
      const baseUrl = "https://api.afromessage.com/api/challenge";
      const token = process.env.AFRO_SMS_SECRET_KEY;
  
      if (!token) {
        throw new Error("AFRO_SMS_SECRET_KEY is not set in environment variables.");
      }
  
      const url = new URL(baseUrl);
      url.searchParams.append("sender", "FortuneBingo");
      url.searchParams.append("to", to);
      url.searchParams.append("len", 6);
      url.searchParams.append("t", 0);
      url.searchParams.append("ttl", 300);
      if (callback) url.searchParams.append("callback", callback);
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }
  
      const result = await response.json();

    if (result.acknowledge === "success") {
        console.log("SMS sent successfully:", result.response)
      return ("SMS sent successfully:", result.response);
    } else {
       console.log = ("Error sending SMS:", result)
      return ("Error sending SMS:", result);
    }
  } catch (error) {
    console.log(("Failed to send SMS:", error.message))
    return ("Failed to send SMS:", error.message);
  }
}

export default sendSMS
// Example usage:
// Replace `TEMPLATE_ID`, `PHONE_NUMBER`, `CODE_LENGTH`, `CODE_TYPE`, and `TTL` with appropriate values.

