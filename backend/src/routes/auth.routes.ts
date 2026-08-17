import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Lettres, chiffres et _ uniquement"),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(50).optional(),
});

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (existing) {
      return res.status(409).json({ error: "Email ou nom d'utilisateur déjà utilisé" });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashed,
        displayName: data.displayName || data.username,
      },
    });

    const token = signToken({ userId: user.id });
    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, bio: user.bio },
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

const loginSchema = z.object({
  emailOrUsername: z.string(),
  password: z.string(),
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: data.emailOrUsername }, { username: data.emailOrUsername }] },
    });
    if (!user) return res.status(401).json({ error: "Identifiants invalides" });

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return res.status(401).json({ error: "Identifiants invalides" });

    const token = signToken({ userId: user.id });
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, bio: user.bio },
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    res.json({ id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, bio: user.bio });
  } catch (err) {
    next(err);
  }
});

export default router;
