import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: true,
    },
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password before saving to database (pre = before, before data is saved to database, mongoose automatically run this function )
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // before save password is undefined, after we type it, we get password. so it means modified. so it is true. !true = false. stop it and run code below

  const salt = await bcrypt.genSalt(10); // Create random security data to mix with the password before locking it. Why? => same passwords don’t look the same. hackers can’t guess passwords easily. Ex: u will get random text like abcd and then we will hash your password + abcd
  this.password = await bcrypt.hash(this.password, salt); // hash abcd+yourpassword
  // why "this"? Why not pass the user as an argument? => Because Mongoose already knows which document is being saved.Ex: You call: await user.save(); => Mongoose runs: preSaveHook.call(user); => this === user
  // Hash vs Bcrypt vs Encryption
  // hash = is a one-way transformation of data. You can’t get the original data back.
  // bycrypt = is a type of hash that designed for password locking. Why bcrypt is special? => 1. One-way (can’t get password back), 2. Salted (same passwords look different)
  //  Encryption = Can decrypt(can get original data back)
});

// Compare using password using bcrypt.js
userSchema.methods.comparePassword = async function (password) {
  // Hey Mongoose, please add my custom function called to every User document comparePassword(methods = To attach functions (actions) to a MongoDB document.)

  return bcrypt.compare(password, this.password); // 1. Reads the stored hash, 2. Get the salt from stored hash string, 3. Re-hashes "123456" using SAME salt, Compares newhashed with stored hash
};

const User = mongoose.model("User", userSchema);

export default User;
