import jwt from "jsonwebtoken";



const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "15d", // 15 days
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    sameSite: "None", //CSRF
  });

  return token;
};

export default generateTokenAndSetCookie;
