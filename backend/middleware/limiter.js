const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // start blocking after 10 requests
  messages:
  	"Too many resquests from this IP, please try again after an 15 minutes"
});

module.exports = limiter;