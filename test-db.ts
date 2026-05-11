import "dotenv/config";
import dns from "dns";
import dnsPromises from "dns/promises";

// Ensure custom resolver uses Google's DNS
dnsPromises.setServers(['8.8.8.8', '1.1.1.1']);

const originalLookup = dns.lookup;

// @ts-ignore
dns.lookup = function(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (hostname.includes('neon.tech')) {
    dnsPromises.resolve4(hostname)
      .then(addresses => {
        if (addresses.length > 0) {
          callback(null, addresses[0], 4);
        } else {
          originalLookup(hostname, options, callback);
        }
      })
      .catch(err => {
        originalLookup(hostname, options, callback);
      });
  } else {
    originalLookup(hostname, options, callback);
  }
};

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const res = await prisma.user.findMany();
    console.log("Success with monkey-patch! Users count:", res.length);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
main();
