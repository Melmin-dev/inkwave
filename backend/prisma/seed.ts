import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.upsert({
    where: { email: "alice@inkwave.dev" },
    update: {},
    create: {
      username: "alice_writes",
      email: "alice@inkwave.dev",
      password,
      displayName: "Alice",
      bio: "Autrice de fantasy et de romance. ✨",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@inkwave.dev" },
    update: {},
    create: {
      username: "bob_stories",
      email: "bob@inkwave.dev",
      password,
      displayName: "Bob",
      bio: "J'écris des thrillers depuis mon canapé.",
    },
  });

  const story1 = await prisma.story.create({
    data: {
      title: "L'Écho des Étoiles Mortes",
      description: "Dans un empire galactique en ruine, une jeune ingénieure découvre un signal qui pourrait tout changer.",
      genre: "Science-Fiction",
      tags: "espace,aventure,dystopie",
      status: "ongoing",
      published: true,
      authorId: alice.id,
      chapters: {
        create: [
          { title: "Chapitre 1 : Le Signal", content: "Le vaisseau tremblait sous les décharges electromagnétiques...\n\nElena n'avait jamais rien vu de tel.", order: 0, published: true },
          { title: "Chapitre 2 : La Décision", content: "Il fallait choisir : fuir ou répondre à l'appel venu du vide.", order: 1, published: true },
        ],
      },
    },
  });

  const story2 = await prisma.story.create({
    data: {
      title: "Le Dernier Appel",
      description: "Un détective à la retraite est rappelé pour une enquête qui va bouleverser tout ce qu'il croyait savoir.",
      genre: "Thriller",
      tags: "policier,suspense,mystère",
      status: "completed",
      published: true,
      authorId: bob.id,
      chapters: {
        create: [
          { title: "Chapitre 1 : Le Coup de Fil", content: "Le téléphone sonna à 3h du matin. Marcus savait que ça n'annonçait rien de bon.", order: 0, published: true },
        ],
      },
    },
  });

  await prisma.like.create({ data: { userId: bob.id, storyId: story1.id } });
  await prisma.comment.create({ data: { userId: bob.id, storyId: story1.id, content: "Hâte de lire la suite !" } });
  await prisma.libraryItem.create({ data: { userId: alice.id, storyId: story2.id } });

  console.log("✅ Données de démo créées : alice_writes / bob_stories (mot de passe: password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
