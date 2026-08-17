import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, optionalAuth, AuthRequest } from "../middleware/auth";
import { upload, uploadToCloudinary } from "../middleware/upload"; // Import du middleware d'upload

const router = Router();

// Découverte : liste des histoires publiées, filtrable par genre, triable
router.get("/", async (req, res, next) => {
  try {
    const { genre, sort } = req.query as { genre?: string; sort?: string };
    const where: any = { published: true };
    if (genre && genre !== "Tous") where.genre = genre;

    const orderBy =
      sort === "recent" ? { updatedAt: "desc" as const } :
      sort === "views" ? { views: "desc" as const } :
      { createdAt: "desc" as const };

    const stories = await prisma.story.findMany({
      where,
      orderBy,
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        _count: { select: { likes: true, chapters: true, comments: true } },
      },
      take: 60,
    });
    res.json(stories);
  } catch (err) {
    next(err);
  }
});

const storySchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  genre: z.string().min(1).optional(),
  tags: z.string().max(300).optional(),
  status: z.enum(["ongoing", "completed", "hiatus"]).optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = storySchema.parse(req.body);
    const story = await prisma.story.create({
      data: { ...data, authorId: req.userId! },
    });
    res.status(201).json(story);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

// NOUVELLE ROUTE : Téléversement de l'image de couverture
router.post("/:id/cover", requireAuth, upload.single("cover"), async (req: AuthRequest, res, next) => {
  try {
    const story = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story) return res.status(404).json({ error: "Histoire introuvable" });
    if (story.authorId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier image fourni" });
    }

    // Téléversement sur Cloudinary dans le dossier 'covers'
    const imageUrl = await uploadToCloudinary(req.file.buffer, "covers");

    // Mise à jour de l'histoire en BDD
    const updated = await prisma.story.update({
      where: { id: req.params.id },
      data: { coverUrl: imageUrl },
    });

    res.json({ coverUrl: updated.coverUrl });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { username: true, displayName: true, avatarUrl: true } },
        chapters: { orderBy: { order: "asc" } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!story) return res.status(404).json({ error: "Histoire introuvable" });

    let isLiked = false;
    let isInLibrary = false;
    if (req.userId) {
      isLiked = !!(await prisma.like.findUnique({ where: { userId_storyId: { userId: req.userId, storyId: story.id } } }));
      isInLibrary = !!(await prisma.libraryItem.findUnique({ where: { userId_storyId: { userId: req.userId, storyId: story.id } } }));
    }

    const isOwner = req.userId === story.authorId;
    const chapters = isOwner ? story.chapters : story.chapters.filter((c) => c.published);

    res.json({ ...story, chapters, isLiked, isInLibrary, isOwner });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const story = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story) return res.status(404).json({ error: "Histoire introuvable" });
    if (story.authorId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    const data = storySchema.partial().extend({ published: z.boolean().optional() }).parse(req.body);
    const updated = await prisma.story.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors[0].message });
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const story = await prisma.story.findUnique({ where: { id: req.params.id } });
    if (!story) return res.status(404).json({ error: "Histoire introuvable" });
    if (story.authorId !== req.userId) return res.status(403).json({ error: "Action non autorisée" });

    await prisma.story.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/like", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.like.findUnique({
      where: { userId_storyId: { userId: req.userId!, storyId: req.params.id } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return res.json({ liked: false });
    } else {
      await prisma.like.create({ data: { userId: req.userId!, storyId: req.params.id } });
      return res.json({ liked: true });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/mine/list", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const stories = await prisma.story.findMany({
      where: { authorId: req.userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { chapters: true, likes: true } } },
    });
    res.json(stories);
  } catch (err) {
    next(err);
  }
});

export default router;