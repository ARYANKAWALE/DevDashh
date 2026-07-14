import { User, User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const RegisterUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const ExistingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (ExistingUser) {
    throw new ApiError(400, "User Already Exists");
  }

    const hashedPassword = await bcrypt.hash(password, 10)

    const User = User.create({
        username:username.toLowerCase(),
        email,
        password:hashedPassword
    })

    

  
});

export default RegisterUser;