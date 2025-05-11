import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/user.model.js";

// Local Strategy for username/password login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// JWT Strategy for token authentication
const JWT_SECRET = process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set on .env!");
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user) {
          console.log("No user found with ID:", payload.id);
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        console.error("JWT Strategy Error:", error);
        return done(error, false);
      }
    }
  )
);
