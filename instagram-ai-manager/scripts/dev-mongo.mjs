/**
 * Sobe um MongoDB local em memória para desenvolvimento — sem instalar nada.
 * Uso: npm run dev:db   (em outro terminal: npm run dev)
 * Os dados são apagados quando o processo encerra.
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const mongod = await MongoMemoryServer.create({
  instance: { port: 27017, ip: "127.0.0.1", dbName: "instagram-ai-manager" },
});

console.log("✅ MongoDB em memória rodando em:", mongod.getUri());
console.log("   Use MONGODB_URI=\"mongodb://127.0.0.1:27017/instagram-ai-manager\"");
console.log("   Ctrl+C para encerrar (os dados são temporários).");

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await mongod.stop();
    process.exit(0);
  });
}
setInterval(() => {}, 60_000);
