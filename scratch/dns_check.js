const dns = require('dns');

// Set public DNS servers to bypass local refusal
dns.setServers(['8.8.8.8', '1.1.1.1']);

function resolveA(domain) {
  return new Promise((res) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        res({ error: err.message });
      } else {
        res({ A: addresses });
      }
    });
  });
}

function resolveCNAME(domain) {
  return new Promise((res) => {
    dns.resolveCname(domain, (err, addresses) => {
      if (err) {
        res({ error: err.message });
      } else {
        res({ CNAME: addresses });
      }
    });
  });
}

async function run() {
  console.log("Checking amorajewelry.cl:");
  console.log("A:", await resolveA('amorajewelry.cl'));
  console.log("CNAME:", await resolveCNAME('amorajewelry.cl'));
  
  console.log("\nChecking www.amorajewelry.cl:");
  console.log("A:", await resolveA('www.amorajewelry.cl'));
  console.log("CNAME:", await resolveCNAME('www.amorajewelry.cl'));
}

run();
