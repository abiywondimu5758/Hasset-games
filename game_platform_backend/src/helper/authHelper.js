exports.validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/;
    const hasLowerCase = /[a-z]/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  
    if (password.length < minLength || !hasUpperCase.test(password) || !hasLowerCase.test(password) || !hasNumber.test(password) || !hasSpecialChar.test(password)) {
      return "Password is too weak";
    }
    return null;
  };

exports.validatePhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^(09|07)\d{8}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      return "Invalid phone number format";
    }
    return null;
  };

exports.validateUsernameLength = (username) => {
    const maxLength = 32;
    if (username.length > maxLength) {
      return "Username exceeds maximum length of 32 characters";
    }
    return null;
  }