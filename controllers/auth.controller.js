import User from "../models/user.model.js";

export const signup = async (req, res, next) => {
   const { name, email, password, role, phone, collegeName, image } = req.body;

   if (!name || !email || !password || !role || !phone || !collegeName) {
      return res.status(400).json({ message: "All fields are required" });
   }

   try {
      const user = new User({
         name,
         email,
         password,
         role,
         phone,
         collegeName,
         image,
      });
      user.password = await user.hashPassword(password);
      await user.save();
      res.status(201).json({ message: "User created successfully", user });
   } catch (err) {
      next(err);
   }
};

export const signin = async (req, res, next) => {
   const { email, password } = req.body;
   if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
   }

   try {
      const user = await User.findOne({ email });
      if (!user) {
         return res.status(404).json({
            message: "Invalid credentials",
            success: false,
            status: 404,
         });
      }

      const isValid = await user.comparePassword(password);

      if (!isValid) {
         return res.status(400).json({
            message: "Invalid credentials",
            success: false,
            status: 400,
         });
      }
      // seperate the password from the user object
      const { password: pass, ...rest } = user._doc;
      const token = await user.generateToken();
      res.status(200)
         .cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
         })
         .json({ message: "User logged in successfully", rest });
   } catch (err) {
      next(err);
   }
};
