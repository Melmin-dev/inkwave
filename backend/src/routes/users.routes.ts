import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";
import { upload, uploadToCloudinary } from "../middleware/upload"; // Import du middleware d'upload

const router = Router();

// Profil public d'un utilisateur (par username)
router.get("/:username", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username },
      include: {
        _count: { select: { followers: true, following: true, stories: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    const stories = await prisma.story.findMany({
      where: { authorId: user.id, published: true },
      orderBy: { updatedAt: "desc" },
    });

    let isFollowing = false;
    if (req.userId) {
      const f = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId, followingId: user.id } },
      });
      isFollowing = !!f;
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      storiesCount: user._count.stories,
      isFollowing,
      stories,
    });
  } catch (err) {
    next(err);
  }
});

const updateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

router.put("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.userId }, data });
    res.json({ id: user.id, username: user.username, displayName: user.displayName, bio: user.bio, avatarUrl: user.avatarUrl });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

// NOUVELLE ROUTE : Téléversement de la photo de profil / avatar
router.post("/me/avatar", requireAuth, upload.single("avatar"), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier image fourni" });
    }

    // Téléversement sur Cloudinary dans le dossier 'avatars'
    const imageUrl = await uploadToCloudinary(req.file.buffer, "avatars");

    // Mise à jour de l'utilisateur en BDD
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatarUrl: imageUrl },
    });

    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    next(err);
  }
});

router.post("/:username/follow", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const target = await prisma.user.findUnique({ where: { username: req.params.username } });
    if (!target) return res.status(404).json({ error: "Utilisateur introuvable" });
    if (target.id === req.userId) return res.status(400).json({ error: "Impossible de se suivre soi-même" });

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: req.userId!, followingId: target.id } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return res.json({ following: false });
    } else {
      await prisma.follow.create({ data: { followerId: req.userId!, followingId: target.id } });
      return res.json({ following: true });
    }
  } catch (err) {
    next(err);
  }
});

export default router;