const express = require("express");
const snarkjs = require("snarkjs");
const fs = require("fs");
const app = express();
const cors = require("cors");

const port = 3001;

app.use(cors()); // Allow CORS
app.use(express.json());

// File paths
const circuitWasm = "./circom_build/zkp_proof_js/zkp_proof.wasm";
const zkeyFile = "./circom_build/zkp_proof_0001.zkey";
const verificationKeyFile = "./circom_build/verification_key.json";

// Ensure necessary files exist
if (!fs.existsSync(circuitWasm) || !fs.existsSync(zkeyFile) || !fs.existsSync(verificationKeyFile)) {
  console.error("Required circuit files not found!");
  process.exit(1);
}

// Winning number
const winningN = BigInt(8463);

app.post("/api/check-lottery", async (req, res) => {
  try {
    const { p, q } = req.body;

    // Validate inputs
    if (!Number.isInteger(Number(p)) || !Number.isInteger(Number(q))) {
      console.error("Invalid inputs received:", { p, q });
      return res.status(400).json({ error: "Inputs p and q must be integers." });
    }

    const pBig = BigInt(p);
    const qBig = BigInt(q);
    const nComputed = pBig * qBig;

    console.log("Received inputs:");
    console.log("p:", pBig.toString());
    console.log("q:", qBig.toString());
    console.log("Computed n:", nComputed.toString());

    // Determine if user wins
    if (nComputed !== winningN) {
      console.log("User did not win. Computed n does not match winning number.");
      return res.json({ message: "Sorry, you did not win the lottery.", isWinner: false });
    }

    // Generate proof
    const input = {
      p: pBig.toString(),
      q: qBig.toString(),
      n: winningN.toString(),
    };

    console.log("Generating proof with input:", input);

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, circuitWasm, zkeyFile);

    console.log("Proof generated:", proof);
    console.log("Public signals:", publicSignals);

    // Verify proof
    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyFile, "utf-8"));
    const isVerified = await snarkjs.groth16.verify(verificationKey, publicSignals, proof);

    console.log("Verification result:", isVerified);

    if (!isVerified) {
      console.error("Proof verification failed!");
      return res.status(500).json({ error: "Proof verification failed!" });
    }

    // Respond with proof and success message
    res.json({
      message: "Congratulations! You won the lottery!",
      isWinner: true,
      proof,
      publicSignals,
    });
  } catch (error) {
    console.error("Error handling lottery request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
