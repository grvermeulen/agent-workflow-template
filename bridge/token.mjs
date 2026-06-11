// Generates a strong shared token for the bridge and prints setup hints.
import crypto from "node:crypto";

const token = crypto.randomBytes(32).toString("base64url");

console.log("Nieuw bridge-token (bewaar dit veilig, het geeft shell-toegang tot deze machine):\n");
console.log(`  ${token}\n`);
console.log("Zet het in bridge/.env:");
console.log(`  COS_BRIDGE_TOKEN=${token}\n`);
console.log("En vul hetzelfde token in op de terminalpagina van de cockpit.");
